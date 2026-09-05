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
        
        const hfToken = process.env.HF_TOKEN;
        
        if (!hfToken) {
            return res.status(500).json({ error: 'HF_TOKEN not configured' });
        }
        
        // Використовуємо прямий URL
        const response = await fetch(
            'https://api-inference.huggingface.co/models/nateraw/food',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + hfToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: image }),
                timeout: 30000
            }
        );
        
        const data = await response.json();
        
        const calorieDB = {
            'apple_pie': { name: 'Яблучний пиріг', cal: 320 },
            'baby_back_ribs': { name: 'Реберця', cal: 285 },
            'baklava': { name: 'Баклава', cal: 430 },
            'beef_carpaccio': { name: 'Карпаччо', cal: 170 },
            'beef_tartare': { name: 'Тартар', cal: 190 },
            'beet_salad': { name: 'Буряковий салат', cal: 65 },
            'beignets': { name: 'Беньє', cal: 350 },
            'bibimbap': { name: 'Бібімбап', cal: 490 },
            'bread_pudding': { name: 'Пудинг з хліба', cal: 320 },
            'breakfast_burrito': { name: 'Бурріто', cal: 380 },
            'bruschetta': { name: 'Брускетта', cal: 160 },
            'caesar_salad': { name: 'Салат Цезар', cal: 180 },
            'cannoli': { name: 'Каннолі', cal: 380 },
            'caprese_salad': { name: 'Капрезе', cal: 140 },
            'carrot_cake': { name: 'Морквяний торт', cal: 350 },
            'ceviche': { name: 'Севиче', cal: 120 },
            'cheesecake': { name: 'Чізкейк', cal: 420 },
            'cheese_plate': { name: 'Сирна тарілка', cal: 350 },
            'chicken_curry': { name: 'Курка каррі', cal: 220 },
            'chicken_quesadilla': { name: 'Кесаділья', cal: 320 },
            'chicken_wings': { name: 'Курячі крильця', cal: 290 },
            'chocolate_cake': { name: 'Шоколадний торт', cal: 380 },
            'chocolate_mousse': { name: 'Шоколадне суфле', cal: 280 },
            'churros': { name: 'Чуррос', cal: 350 },
            'clam_chowder': { name: 'Хаудер', cal: 160 },
            'club_sandwich': { name: 'Клубний сендвіч', cal: 320 },
            'crab_cakes': { name: 'Крабові котлети', cal: 230 },
            'creme_brulee': { name: 'Крем-брюле', cal: 320 },
            'croque_madame': { name: 'Крок-мадам', cal: 350 },
            'cup_cakes': { name: 'Кекси', cal: 340 },
            'deviled_eggs': { name: 'Фаршировані яйця', cal: 180 },
            'donuts': { name: 'Пончики', cal: 350 },
            'dumplings': { name: 'Вареники', cal: 210 },
            'edamame': { name: 'Едамаме', cal: 120 },
            'eggs_benedict': { name: 'Яйця Бенедикт', cal: 280 },
            'escargots': { name: 'Равлики', cal: 150 },
            'falafel': { name: 'Фалафель', cal: 250 },
            'filet_mignon': { name: 'Філе міньйон', cal: 280 },
            'fish_and_chips': { name: 'Риба з картоплею', cal: 350 },
            'foie_gras': { name: 'Фуа-гра', cal: 450 },
            'french_fries': { name: 'Картопля фрі', cal: 310 },
            'french_onion_soup': { name: 'Цибулевий суп', cal: 90 },
            'fried_calamari': { name: 'Смажений кальмар', cal: 250 },
            'fried_rice': { name: 'Смажений рис', cal: 200 },
            'frozen_yogurt': { name: 'Заморожений йогурт', cal: 150 },
            'garlic_bread': { name: 'Часниковий хліб', cal: 250 },
            'gnocchi': { name: 'Ньоккі', cal: 180 },
            'greek_salad': { name: 'Грецький салат', cal: 100 },
            'grilled_cheese_sandwich': { name: 'Сендвіч з сиром', cal: 320 },
            'grilled_salmon': { name: 'Смажений лосось', cal: 220 },
            'guacamole': { name: 'Гуакамоле', cal: 150 },
            'gyoza': { name: 'Діоза', cal: 200 },
            'hamburger': { name: 'Бургер', cal: 295 },
            'hot_and_sour_soup': { name: 'Гостро-кислий суп', cal: 80 },
            'hot_dog': { name: 'Хот-дог', cal: 290 },
            'huevos_rancheros': { name: 'Яйця по-мексиканськи', cal: 250 },
            'hummus': { name: 'Хумус', cal: 140 },
            'ice_cream': { name: 'Морозиво', cal: 200 },
            'lasagna': { name: 'Лазанья', cal: 280 },
            'lobster_bisque': { name: 'Бісквіт з лангустів', cal: 180 },
            'lobster_roll_sandwich': { name: 'Рол з лангустом', cal: 320 },
            'macaroni_and_cheese': { name: 'Макарони з сиром', cal: 280 },
            'macarons': { name: 'Макарони', cal: 350 },
            'miso_soup': { name: 'Місо-суп', cal: 50 },
            'mussels': { name: 'Мідії', cal: 140 },
            'nachos': { name: 'Начос', cal: 320 },
            'omelette': { name: 'Омлет', cal: 155 },
            'onion_rings': { name: 'Кільця цибулі', cal: 280 },
            'oysters': { name: 'Устриці', cal: 110 },
            'pad_thai': { name: 'Пад Тай', cal: 280 },
            'paella': { name: 'Паелья', cal: 220 },
            'pancakes': { name: 'Млинці', cal: 230 },
            'panna_cotta': { name: 'Панна-котта', cal: 300 },
            'peking_duck': { name: 'Пекінська качка', cal: 340 },
            'pho': { name: 'Фо', cal: 120 },
            'pizza': { name: 'Піца', cal: 266 },
            'pork_chop': { name: 'Свиняча відбивна', cal: 260 },
            'poutine': { name: 'Путін', cal: 350 },
            'prime_rib': { name: 'Прайм-ріб', cal: 320 },
            'pulled_pork_sandwich': { name: 'Сендвіч з тягнутою свининою', cal: 350 },
            'ramen': { name: 'Рамен', cal: 190 },
            'ravioli': { name: 'Равіолі', cal: 200 },
            'red_velvet_cake': { name: 'Торт червоний оксамит', cal: 370 },
            'risotto': { name: 'Різотто', cal: 200 },
            'samosa': { name: 'Самоса', cal: 260 },
            'sashimi': { name: 'Сашимі', cal: 120 },
            'scallops': { name: 'Морські гребінці', cal: 150 },
            'seaweed_salad': { name: 'Салат з водоростей', cal: 70 },
            'shrimp_and_grits': { name: 'Креветки з кашею', cal: 250 },
            'spaghetti_bolognese': { name: 'Спагетті Болоньєзе', cal: 220 },
            'spaghetti_carbonara': { name: 'Спагетті Карбонара', cal: 280 },
            'spring_rolls': { name: 'Літні роли', cal: 180 },
            'steak': { name: 'Стейк', cal: 270 },
            'strawberry_shortcake': { name: 'Полуничний торт', cal: 300 },
            'sushi': { name: 'Суші', cal: 200 },
            'tacos': { name: 'Тако', cal: 230 },
            'takoyaki': { name: 'Такоякі', cal: 200 },
            'tiramisu': { name: 'Тірамісу', cal: 350 },
            'tuna_tartare': { name: 'Тартар з тунця', cal: 160 },
            'waffles': { name: 'Вафлі', cal: 320 }
        };
        
        if (Array.isArray(data) && data.length > 0) {
            const topResults = data.slice(0, 3).map(item => {
                const foodInfo = calorieDB[item.label] || { name: item.label.replace(/_/g, ' '), cal: 200 };
                return {
                    name: foodInfo.name,
                    confidence: Math.round(item.score * 100),
                    calories: foodInfo.cal
                };
            });
            
            return res.status(200).json({
                success: true,
                dishes: topResults,
                totalCalories: topResults[0].calories
            });
        } else {
            return res.status(200).json({
                success: false,
                error: 'Не вдалося розпізнати'
            });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
