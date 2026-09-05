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
                body: JSON.stringify({ image_url: image }),
                timeout: 30000
            }
        );
        
        const data = await response.json();
        
        // Обробка результату від CaloAI
        if (data.status === 'success' && data.response) {
            const resp = data.response;
            
            // CaloAI повертає дані в форматі:
            // { proteins, fats, carbs, calories, healthy_points, detected_dishes, ... }
            
            const dishes = [];
            
            if (resp.detected_dishes && resp.detected_dishes.length > 0) {
                // Якщо є список страв
                resp.detected_dishes.forEach(function(dish) {
                    dishes.push({
                        name: dish,
                        calories: Math.round(resp.calories / resp.detected_dishes.length),
                        confidence: resp.confidence_score || 85
                    });
                });
            } else {
                // Якщо тільки загальна інформація
                dishes.push({
                    name: 'Їжа на фото',
                    calories: resp.calories || 300,
                    confidence: resp.confidence_score || 70
                });
            }
            
            return res.status(200).json({
                success: true,
                dishes: dishes,
                totalCalories: resp.calories || 300,
                protein: resp.proteins || 0,
                fat: resp.fats || 0,
                carbs: resp.carbs || 0,
                healthyScore: resp.healthy_points || 5,
                verdict: resp.ai_verdict || ''
            });
        }
        
        // Якщо CaloAI повернув помилку
        if (data.error) {
            return res.status(200).json({
                success: false,
                error: data.error
            });
        }
        
        return res.status(200).json({
            success: false,
            error: 'Не вдалося розпізнати'
        });
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
