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
        
        // Отримуємо токен FatSecret
        const clientId = process.env.FATSECRET_CLIENT_ID;
        const clientSecret = process.env.FATSECRET_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
            return res.status(500).json({ error: 'FatSecret credentials not configured' });
        }
        
        // Отримуємо OAuth токен
        const tokenResponse = await fetch('https://oauth.fatsecret.com/connect/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}&scope=basic`
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
            return res.status(500).json({ error: 'Failed to get FatSecret token' });
        }
        
        // Обробляємо зображення
        let imageBase64 = image;
        if (image.includes('base64,')) {
            imageBase64 = image.split('base64,')[1];
        }
        
        // Використовуємо FatSecret Image Recognition API
        const response = await fetch(
            'https://platform.fatsecret.com/rest/image-recognition/v1',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + tokenData.access_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_b64: imageBase64,
                    include_food_data: true,
                    region: 'US',
                    language: 'en'
                }),
                timeout: 30000
            }
        );
        
        const data = await response.json();
        
        // Обробка результату від FatSecret
        if (data.foods && data.foods.food_response && data.foods.food_response.length > 0) {
            const dishes = data.foods.food_response.map(food => {
                const serving = food.servings && food.servings.serving 
                    ? (Array.isArray(food.servings.serving) ? food.servings.serving[0] : food.servings.serving)
                    : null;
                
                return {
                    name: food.food_name,
                    confidence: Math.round((food.match_confidence || 0.5) * 100),
                    calories: serving ? parseInt(serving.calories) : 200,
                    serving: serving ? serving.serving_description : '1 serving',
                    protein: serving ? parseInt(serving.protein) : 0,
                    carbs: serving ? parseInt(serving.carbohydrate) : 0,
                    fat: serving ? parseInt(serving.fat) : 0
                };
            });
            
            const totalCal = dishes.reduce((sum, d) => sum + d.calories, 0);
            
            return res.status(200).json({
                success: true,
                dishes: dishes,
                totalCalories: totalCal
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
