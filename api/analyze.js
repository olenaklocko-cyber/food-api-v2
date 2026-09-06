// CaloAI Food Recognition API
const fetch = require('node-fetch');

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
        
        const rapidApiKey = process.env.RAPIDAPI_KEY;
        
        if (!rapidApiKey) {
            return res.status(500).json({ error: 'RAPIDAPI_KEY not configured' });
        }
        
        // Переконуємось що зображення в форматі data URI
        let imageUri = image;
        if (!image.startsWith('data:')) {
            imageUri = 'data:image/jpeg;base64,' + image;
        }
        
        // Використовуємо CaloAI API через RapidAPI
        const response = await fetch(
            'https://caloai.p.rapidapi.com/v1',
            {
                method: 'POST',
                headers: {
                    'X-RapidAPI-Key': rapidApiKey,
                    'X-RapidAPI-Host': 'caloai.p.rapidapi.com',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image_url: imageUri }),
                timeout: 30000
            }
        );
        
        const data = await response.json();
        
        // Обробка результату від CaloAI
        if (data.status === 'success' && data.response) {
            const resp = data.response;
            
            const dishes = [];
            
            if (resp.product_name) {
                dishes.push({
                    name: resp.product_name,
                    calories: resp.calories || 300,
                    confidence: 90,
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
        return res.status(500).json({ error: error.message });
    }
};
