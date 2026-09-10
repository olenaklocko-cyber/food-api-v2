// CaloAI Food Recognition API
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Функція завантаження base64 на uguu.se
async function uploadToUguu(base64Data) {
    const buffer = Buffer.from(base64Data, 'base64');
    const tmpPath = '/tmp/upload_' + Date.now() + '.jpg';
    fs.writeFileSync(tmpPath, buffer);
    
    try {
        const form = new FormData();
        form.append('files[]', fs.createReadStream(tmpPath), 'image.jpg');
        
        const response = await fetch('https://uguu.se/upload', {
            method: 'POST',
            body: form
        });
        
        const data = await response.json();
        if (data.success && data.files && data.files[0]) {
            return data.files[0].url;
        }
        throw new Error('Upload failed');
    } finally {
        try { fs.unlinkSync(tmpPath); } catch(e) {}
    }
}

// Функція завантаження base64 на 0x0.st
async function uploadTo0x0(base64Data) {
    const buffer = Buffer.from(base64Data, 'base64');
    const tmpPath = '/tmp/upload_' + Date.now() + '.jpg';
    fs.writeFileSync(tmpPath, buffer);
    
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(tmpPath));
        
        const response = await fetch('https://0x0.st', {
            method: 'POST',
            body: form
        });
        
        const url = await response.text();
        return url.trim();
    } finally {
        try { fs.unlinkSync(tmpPath); } catch(e) {}
    }
}

// Функція завантаження base64 на catbox.moe
async function uploadToCatbox(base64Data) {
    // Конвертуємо base64 в Buffer
    const buffer = Buffer.from(base64Data, 'base64');
    const tmpPath = '/tmp/upload_' + Date.now() + '.jpg';
    fs.writeFileSync(tmpPath, buffer);
    
    try {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', fs.createReadStream(tmpPath), 'image.jpg');
        
        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: form
        });
        
        const url = await response.text();
        return url.trim();
    } finally {
        // Видаляємо тимчасовий файл
        try { fs.unlinkSync(tmpPath); } catch(e) {}
    }
}

// Функція завантаження base64 на tmpfiles.org
async function uploadToTmpfiles(base64Data) {
    const buffer = Buffer.from(base64Data, 'base64');
    const tmpPath = '/tmp/upload_' + Date.now() + '.jpg';
    fs.writeFileSync(tmpPath, buffer);
    
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(tmpPath), {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });
        
        const response = await fetch('https://tmpfiles.org/api/v1/upload', {
            method: 'POST',
            body: form
        });
        
        const data = await response.json();
        console.log('tmpfiles response:', data);
        
        if (data.status === 'success' && data.data && data.data.url) {
            // tmpfiles returns URL like https://tmpfiles.org/123/image.jpg
            // Convert to direct URL: https://tmpfiles.org/direct/123/image.jpg
            return data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/direct/');
        }
        
        throw new Error('Upload failed: ' + JSON.stringify(data));
    } finally {
        try { fs.unlinkSync(tmpPath); } catch(e) {}
    }
}

// Функція перекладу з англійської на українську через MyMemory API
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

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }
        
        const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.CALOAI_API_KEY || process.env.API_KEY || '16749e13b0msh437c9c685ba695bp10d553jsn871fbf3b2535';
        
        if (!rapidApiKey) {
            return res.status(500).json({ error: 'RAPIDAPI_KEY not configured' });
        }
        
        // Якщо image вже URL - відправляємо напряму
        let imageUrl;
        if (image.startsWith('http://') || image.startsWith('https://')) {
            imageUrl = image;
            console.log('Using direct URL:', imageUrl);
        } else {
            // Base64 - завантажуємо на хостинг для отримання URL
            let base64Data = image;
            if (image.startsWith('data:')) {
                base64Data = image.split(',')[1];
            }
            
            // Крок 1: Завантажуємо на uguu.se
            try {
                imageUrl = await uploadToUguu(base64Data);
                console.log('Uploaded to uguu.se:', imageUrl);
            } catch (eUguu) {
                console.error('uguu.se upload error:', eUguu.message);
                
                // Спроба 2: catbox.moe
                try {
                    imageUrl = await uploadToCatbox(base64Data);
                    console.log('Uploaded to catbox:', imageUrl);
                } catch (catboxError) {
                    console.error('catbox upload error:', catboxError.message);
                    return res.status(500).json({ error: 'Failed to upload image to hosting' });
                }
            }
        }
        
        // Крок 2: Відправляємо URL в CaloAI
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(
            'https://caloai.p.rapidapi.com/v1',
            {
                method: 'POST',
                headers: {
                    'X-RapidAPI-Key': rapidApiKey,
                    'X-RapidAPI-Host': 'caloai.p.rapidapi.com',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image_url: imageUrl }),
                signal: controller.signal
            }
        );
        
        clearTimeout(timeout);
        const data = await response.json();
        
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
            
            // Додаємо розпізнані страви окремо
            if (resp.detected_dishes && resp.detected_dishes.length > 0) {
                for (const dish of resp.detected_dishes) {
                    const translatedDishName = await translateToUkrainian(dish.name);
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
        
        return res.status(200).json({
            success: false,
            error: data.error || 'Не вдалося розпізнати'
        });
        
    } catch (error) {
        console.error('Analyze error:', error.message);
        return res.status(500).json({ error: error.message });
    }
};
