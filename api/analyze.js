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
        
        // Обробляємо зображення
        let imageBase64 = image;
        if (image.includes('base64,')) {
            imageBase64 = image.split('base64,')[1];
        }
        
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        
        // Використовуємо кращу модель для розпізнавання їжі
        const response = await fetch(
            'https://router.huggingface.co/hf-inference/models/CreatorJarvis/FoodExtract-Vision-SmolVLM2-500M-fine-tune',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + hfToken,
                    'Content-Type': 'application/octet-stream'
                },
                body: imageBuffer,
                timeout: 60000
            }
        );
        
        const data = await response.json();
        
        // База калорій для українських страв
        const calorieDB = {
            'sausage': { name: 'Сосиска', cal: 150 },
            'hot dog': { name: 'Хот-дог', cal: 290 },
            'bacon': { name: 'Бекон', cal: 540 },
            'ham': { name: 'Шинка', cal: 145 },
            'tomato': { name: 'Помідор', cal: 18 },
            'tomatoes': { name: 'Помідори', cal: 18 },
            'cucumber': { name: 'Огірок', cal: 15 },
            'carrot': { name: 'Морква', cal: 41 },
            'carrots': { name: 'Морква', cal: 41 },
            'onion': { name: 'Цибуля', cal: 40 },
            'potato': { name: 'Картопля', cal: 95 },
            'potatoes': { name: 'Картопля', cal: 95 },
            'pepper': { name: 'Перець', cal: 27 },
            'lettuce': { name: 'Салат', cal: 15 },
            'salad': { name: 'Салат', cal: 20 },
            'broccoli': { name: 'Броколі', cal: 34 },
            'mushroom': { name: 'Гриби', cal: 22 },
            'mushrooms': { name: 'Гриби', cal: 22 },
            'corn': { name: 'Кукурудза', cal: 86 },
            'avocado': { name: 'Авокадо', cal: 160 },
            'apple': { name: 'Яблуко', cal: 52 },
            'apples': { name: 'Яблука', cal: 52 },
            'banana': { name: 'Банан', cal: 95 },
            'bananas': { name: 'Бани', cal: 95 },
            'orange': { name: 'Апельсин', cal: 43 },
            'oranges': { name: 'Апельсини', cal: 43 },
            'grape': { name: 'Виноград', cal: 69 },
            'grapes': { name: 'Виноград', cal: 69 },
            'strawberry': { name: 'Полуниця', cal: 33 },
            'strawberries': { name: 'Полуниця', cal: 33 },
            'blueberry': { name: 'Чорниця', cal: 57 },
            'blueberries': { name: 'Чорниця', cal: 57 },
            'peach': { name: 'Персик', cal: 40 },
            'pear': { name: 'Груша', cal: 57 },
            'mango': { name: 'Манго', cal: 60 },
            'pineapple': { name: 'Ананас', cal: 50 },
            'watermelon': { name: 'Кавун', cal: 30 },
            'kiwi': { name: 'Ківі', cal: 61 },
            'lemon': { name: 'Лимон', cal: 29 },
            'coconut': { name: 'Кокос', cal: 354 },
            'cheese': { name: 'Сир', cal: 350 },
            'cheddar': { name: 'Чеддер', cal: 403 },
            'mozzarella': { name: 'Моцарелла', cal: 280 },
            'parmesan': { name: 'Пармезан', cal: 431 },
            'feta': { name: 'Фета', cal: 264 },
            'yogurt': { name: 'Йогурт', cal: 60 },
            'milk': { name: 'Молоко', cal: 42 },
            'cream': { name: 'Вершки', cal: 195 },
            'butter': { name: 'Масло', cal: 717 },
            'ice cream': { name: 'Морозиво', cal: 207 },
            'bread': { name: 'Хліб', cal: 265 },
            'toast': { name: 'Тост', cal: 260 },
            'croissant': { name: 'Круассан', cal: 406 },
            'muffin': { name: 'Маффін', cal: 340 },
            'pancake': { name: 'Млинець', cal: 227 },
            'pancakes': { name: 'Млинці', cal: 227 },
            'waffle': { name: 'Вафля', cal: 291 },
            'donut': { name: 'Пончик', cal: 452 },
            'cookies': { name: 'Печиво', cal: 488 },
            'cookie': { name: 'Печиво', cal: 488 },
            'chicken': { name: 'Курка', cal: 239 },
            'chicken breast': { name: 'Куряча грудка', cal: 165 },
            'beef': { name: 'Яловичина', cal: 250 },
            'steak': { name: 'Стейк', cal: 271 },
            'pork': { name: 'Свинина', cal: 242 },
            'lamb': { name: 'Баранина', cal: 294 },
            'hamburger': { name: 'Бургер', cal: 295 },
            'burger': { name: 'Бургер', cal: 295 },
            'cheeseburger': { name: 'Чізбургер', cal: 354 },
            'salmon': { name: 'Лосось', cal: 208 },
            'tuna': { name: 'Тунець', cal: 132 },
            'shrimp': { name: 'Креветки', cal: 99 },
            'crab': { name: 'Краб', cal: 97 },
            'lobster': { name: 'Лангуст', cal: 89 },
            'fish': { name: 'Риба', cal: 206 },
            'pizza': { name: 'Піца', cal: 266 },
            'pasta': { name: 'Паста', cal: 131 },
            'spaghetti': { name: 'Спагетті', cal: 158 },
            'lasagna': { name: 'Лазанья', cal: 135 },
            'noodles': { name: 'Локшина', cal: 138 },
            'sushi': { name: 'Суші', cal: 143 },
            'rice': { name: 'Рис', cal: 130 },
            'fried rice': { name: 'Смажений рис', cal: 163 },
            'curry': { name: 'Каррі', cal: 125 },
            'soup': { name: 'Суп', cal: 50 },
            'sandwich': { name: 'Сендвіч', cal: 252 },
            'french fries': { name: 'Картопля фрі', cal: 312 },
            'fries': { name: 'Картопля фрі', cal: 312 },
            'chips': { name: 'Чіпси', cal: 536 },
            'chocolate': { name: 'Шоколад', cal: 546 },
            'cake': { name: 'Торт', cal: 352 },
            'pie': { name: 'Пиріг', cal: 237 },
            'brownie': { name: 'Брауні', cal: 466 },
            'coffee': { name: 'Кава', cal: 2 },
            'tea': { name: 'Чай', cal: 2 },
            'juice': { name: 'Сік', cal: 45 },
            'soda': { name: 'Газировка', cal: 41 },
            'beer': { name: 'Пиво', cal: 43 },
            'wine': { name: 'Вино', cal: 83 },
            'water': { name: 'Вода', cal: 0 },
            'smoothie': { name: 'Смузі', cal: 120 },
            'cereal': { name: 'Гранули', cal: 379 },
            'oatmeal': { name: 'Вівсянка', cal: 68 },
            'eggs': { name: 'Яйця', cal: 155 },
            'egg': { name: 'Яйце', cal: 78 },
            'omelette': { name: 'Омлет', cal: 154 },
            'taco': { name: 'Тако', cal: 210 },
            'burrito': { name: 'Бурріто', cal: 206 },
            'quesadilla': { name: 'Кесаділья', cal: 227 },
            'nachos': { name: 'Начос', cal: 316 },
            'hummus': { name: 'Хумус', cal: 166 },
            'falafel': { name: 'Фалафель', cal: 333 },
            'kebab': { name: 'Кебаб', cal: 279 },
            'shawarma': { name: 'Шаварма', cal: 230 },
            'dumplings': { name: 'Вареники', cal: 210 },
            'borscht': { name: 'Борщ', cal: 50 },
            'varenyky': { name: 'Вареники', cal: 210 },
            'deruny': { name: 'Деруни', cal: 180 },
            'syrnyky': { name: 'Сирники', cal: 180 },
            'mlyntsi': { name: 'Млинці', cal: 230 },
            'olives': { name: 'Оливки', cal: 115 },
            'spinach': { name: 'Шпинат', cal: 23 },
            'peas': { name: 'Горох', cal: 81 },
            'beans': { name: 'Квасоля', cal: 127 },
            'lentils': { name: 'Сочевиця', cal: 116 },
            'chickpeas': { name: 'Нут', cal: 164 },
            'tofu': { name: 'Тофу', cal: 76 },
            'ketchup': { name: 'Кетчуп', cal: 112 },
            'mustard': { name: 'Гірчиця', cal: 66 },
            'mayonnaise': { name: 'Майонез', cal: 680 },
            'salsa': { name: 'Сальса', cal: 36 },
            'guacamole': { name: 'Гуакамоле', cal: 151 },
            'pesto': { name: 'Песто', cal: 388 },
            'nuts': { name: 'Горіхи', cal: 607 },
            'almonds': { name: 'Мигдаль', cal: 579 },
            'cashews': { name: 'Кеш\'ю', cal: 553 },
            'peanuts': { name: 'Арахіс', cal: 567 },
            'walnuts': { name: 'Волоські горіхи', cal: 654 }
        };
        
        // Обробка результату
        if (data && typeof data === 'object') {
            // Якщо це VLM відповідь з JSON
            if (data.food_items || data.food_items === []) {
                const items = data.food_items || [];
                const drinks = data.drink_items || [];
                const allItems = [...items, ...drinks];
                
                if (allItems.length > 0) {
                    const dishes = allItems.map(item => {
                        const itemLower = item.toLowerCase();
                        const foodInfo = calorieDB[itemLower] || { name: item, cal: 150 };
                        return {
                            name: foodInfo.name,
                            calories: foodInfo.cal,
                            confidence: 85
                        };
                    });
                    
                    const totalCal = dishes.reduce((sum, d) => sum + d.calories, 0);
                    
                    return res.status(200).json({
                        success: true,
                        dishes: dishes,
                        totalCalories: totalCal,
                        title: data.image_title || 'Їжа'
                    });
                }
            }
            
            // Якщо це класифікація з confidence
            if (Array.isArray(data) && data.length > 0) {
                const topResults = data.slice(0, 3).map(item => {
                    const itemLabel = item.label ? item.label.toLowerCase() : '';
                    const foodInfo = calorieDB[itemLabel] || { name: item.label || 'Їжа', cal: 200 };
                    return {
                        name: foodInfo.name,
                        confidence: Math.round((item.score || 0.5) * 100),
                        calories: foodInfo.cal
                    };
                });
                
                return res.status(200).json({
                    success: true,
                    dishes: topResults,
                    totalCalories: topResults[0].calories
                });
            }
        }
        
        return res.status(200).json({
            success: false,
            error: 'Не вдалося розпізнати'
        });
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
