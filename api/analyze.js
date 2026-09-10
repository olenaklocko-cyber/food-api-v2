// CaloAI Food Recognition API
const fetch = require('node-fetch');

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
    
    // Повертаємо оригінал якщо переклад не вдався
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
        
        const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.CALOAI_API_KEY || process.env.API_KEY;
        
        if (!rapidApiKey) {
            return res.status(500).json({ error: 'RAPIDAPI_KEY not configured' });
        }
        
        // Відправляємо base64 без data URI префікса
        let imageData = image;
        if (image.startsWith('data:')) {
            // Видаляємо "data:image/jpeg;base64," префікс
            imageData = image.split(',')[1];
        }
        
        // Використовуємо CaloAI API через RapidAPI
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
                body: JSON.stringify({ image_url: imageData }),
                signal: controller.signal
            }
        );
        
        clearTimeout(timeout);
        const data = await response.json();
        
        // Обробка результату від CaloAI
        if (data.status === 'success' && data.response) {
            const resp = data.response;
            
            const dishes = [];
            
            if (resp.product_name) {
                // Перекладаємо назву на українську
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
