// CaloAI Food Recognition API
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function translateToUkrainian(text) {
    if (!text) return 'Їжа';
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|uk`,
            { signal: controller.signal }
        );
        clearTimeout(timeout);
        const data = await response.json();
        if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }
    } catch (error) {
        console.error('Translation error:', error.message);
    }
    return text;
}

async function uploadToTelegraph(base64Data) {
    const buffer = Buffer.from(base64Data, 'base64');
    const tmpPath = '/tmp/upload_' + Date.now() + '.jpg';
    fs.writeFileSync(tmpPath, buffer);
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(tmpPath), { filename: 'image.jpg', contentType: 'image/jpeg' });
        const response = await fetch('https://telegra.ph/upload', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });
        const data = await response.json();
        console.log('telegraph:', JSON.stringify(data));
        if (data && data[0] && data[0].src) {
            return 'https://telegra.ph' + data[0].src;
        }
        throw new Error('telegraph failed');
    } finally {
        try { fs.unlinkSync(tmpPath); } catch(e) {}
    }
}

async function uploadToCatbox(base64Data) {
    const buffer = Buffer.from(base64Data, 'base64');
    const tmpPath = '/tmp/upload_' + Date.now() + '.jpg';
    fs.writeFileSync(tmpPath, buffer);
    try {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', fs.createReadStream(tmpPath), { filename: 'image.jpg', contentType: 'image/jpeg' });
        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });
        const url = await response.text();
        console.log('catbox:', url);
        if (url && url.startsWith('https://')) return url.trim();
        throw new Error('catbox failed: ' + url);
    } finally {
        try { fs.unlinkSync(tmpPath); } catch(e) {}
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: 'No image provided' });
        
        const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.CALOAI_API_KEY || process.env.API_KEY || '16749e13b0msh437c9c685ba695bp10d553jsn871fbf3b2535';
        
        let imageUrl;
        if (image.startsWith('http://') || image.startsWith('https://')) {
            imageUrl = image;
        } else {
            let base64Data = image;
            if (image.startsWith('data:')) base64Data = image.split(',')[1];
            
            console.log('Base64 length:', base64Data.length);
            
            try {
                imageUrl = await uploadToTelegraph(base64Data);
                console.log('telegraph URL:', imageUrl);
            } catch (eTg) {
                console.error('telegraph error:', eTg.message);
                try {
                    imageUrl = await uploadToCatbox(base64Data);
                    console.log('catbox URL:', imageUrl);
                } catch (eCat) {
                    console.error('catbox error:', eCat.message);
                    return res.status(500).json({ error: 'Failed to upload image' });
                }
            }
        }
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch('https://caloai.p.rapidapi.com/v1', {
            method: 'POST',
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'caloai.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image_url: imageUrl }),
            signal: controller.signal
        });
        
        clearTimeout(timeout);
        const data = await response.json();
        console.log('CaloAI status:', data.status);
        
        if (data.status === 'success' && data.response) {
            const resp = data.response;
            const dishes = [];
            
            if (resp.product_name) {
                const translatedName = await translateToUkrainian(resp.product_name);
                dishes.push({
                    name: translatedName,
                    calories: resp.calories || 300,
                    confidence: resp.confidence_score || 90,
                    protein: resp.proteins || 0,
                    fat: resp.fats || 0,
                    carbs: resp.carbs || 0
                });
            }
            
            if (resp.detected_dishes && resp.detected_dishes.length > 0) {
                const mainName = (resp.product_name || '').toLowerCase().trim();
                const mainCalories = resp.calories || 0;
                for (const dish of resp.detected_dishes) {
                    const dishNameLower = (dish.name || '').toLowerCase().trim();
                    const dishCalories = dish.calories || 0;
                    var nameMatch = dishNameLower === mainName || mainName.includes(dishNameLower) || dishNameLower.includes(mainName);
                    var calMatch = mainCalories > 0 && dishCalories > 0 && (dishCalories / mainCalories) > 0.7;
                    if (nameMatch || calMatch) continue;
                    var translatedDishName = await translateToUkrainian(dish.name);
                    dishes.push({
                        name: translatedDishName,
                        calories: dish.calories || 0,
                        confidence: 80,
                        protein: dish.proteins || 0,
                        fat: dish.fats || 0,
                        carbs: dish.carbs || 0
                    });
                }
            }
            
            return res.status(200).json({
                success: true,
                dishes: dishes,
                totalCalories: resp.calories || 300,
                protein: resp.proteins || 0,
                fat: resp.fats || 0,
                carbs: resp.carbs || 0,
                healthyScore: resp.healthy_points || 5
            });
        }
        
        return res.status(200).json({ success: false, error: data.error || 'Не вдалося розпізнати' });
        
    } catch (error) {
        console.error('Analyze error:', error.message);
        return res.status(500).json({ error: error.message });
    }
};
