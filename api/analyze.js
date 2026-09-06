// CaloAI Food Recognition API
const fetch = require('node-fetch');

// Переклад назв страв з англійської на українську
const translations = {
    // М'ясо та ковбаси
    'sausage': 'Сосиска', 'hot dog': 'Хот-дог', 'bacon': 'Бекон', 'ham': 'Шинка',
    'chicken': 'Курка', 'beef': 'Яловичина', 'pork': 'Свинина', 'steak': 'Стейк',
    'turkey': 'Індичка', 'lamb': 'Баранина', 'duck': 'Качка', 'meatball': 'Котлета',
    'meatballs': 'Котлети', 'ribs': 'Реберця', 'pulled pork': 'Тягнуте м\'ясо',
    
    // Овочі
    'tomato': 'Помідор', 'tomatoes': 'Помідори', 'cucumber': 'Огірок',
    'carrot': 'Морква', 'onion': 'Цибуля', 'potato': 'Картопля', 'pepper': 'Перець',
    'lettuce': 'Салат', 'broccoli': 'Броколі', 'mushroom': 'Гриби', 'corn': 'Кукурудза',
    'avocado': 'Авокадо', 'spinach': 'Шпинат', 'peas': 'Горох', 'beans': 'Квасоля',
    'garlic': 'Часник', 'cabbage': 'Капуста', 'beet': 'Буряк', 'eggplant': 'Баклажан',
    'zucchini': 'Кабачок', 'pumpkin': 'Гарбуз', 'radish': 'Редиска', 'celery': 'Селера',
    'asparagus': 'Спаржа', 'green beans': 'Квасоля',
    
    // Фрукти
    'apple': 'Яблуко', 'banana': 'Банан', 'orange': 'Апельсин', 'grape': 'Виноград',
    'strawberry': 'Полуниця', 'blueberry': 'Чорниця', 'peach': 'Персик', 'pear': 'Груша',
    'mango': 'Манго', 'pineapple': 'Ананас', 'watermelon': 'Кавун', 'kiwi': 'Ківі',
    'lemon': 'Лимон', 'cherry': 'Вишня', 'pomegranate': 'Гранат', 'coconut': 'Кокос',
    
    // Молочні
    'cheese': 'Сир', 'mozzarella': 'Моцарелла', 'parmesan': 'Пармезан', 'feta': 'Фета',
    'yogurt': 'Йогурт', 'milk': 'Молоко', 'cream': 'Вершки', 'butter': 'Масло',
    'ice cream': 'Морозиво', 'sour cream': 'Сметана', 'cottage cheese': 'Сир творожний',
    
    // Хліб та випічка
    'bread': 'Хліб', 'toast': 'Тост', 'croissant': 'Круассан', 'muffin': 'Маффін',
    'pancake': 'Млинець', 'pancakes': 'Млинці', 'waffle': 'Вафля', 'donut': 'Пончик',
    'cookies': 'Печиво', 'bagel': 'Бейгл', 'pretzel': 'Брецель', 'baguette': 'Багет',
    'roll': 'Булка', 'bun': 'Булочка', 'tortilla': 'Тортилья', 'pita': 'Піта',
    'naan': 'Наан', 'scone': 'Скон', 'crackers': 'Сухарики',
    
    // Риба та морепродукти
    'salmon': 'Лосось', 'tuna': 'Тунець', 'shrimp': 'Креветки', 'crab': 'Краб',
    'lobster': 'Лангуст', 'fish': 'Риба', 'sushi': 'Суші', 'sashimi': 'Сашимі',
    'cod': 'Треска', 'mussel': 'Мідії', 'oyster': 'Устриці', 'squid': 'Кальмар',
    
    // Готові страви
    'pizza': 'Піца', 'pasta': 'Паста', 'spaghetti': 'Спагетті', 'lasagna': 'Лазанья',
    'noodles': 'Локшина', 'ramen': 'Рамен', 'rice': 'Рис', 'curry': 'Каррі',
    'soup': 'Суп', 'sandwich': 'Сендвіч', 'wrap': 'Рол', 'burrito': 'Бурріто',
    'taco': 'Тако', 'quesadilla': 'Кесаділья', 'nachos': 'Начос', 'falafel': 'Фалафель',
    'hummus': 'Хумус', 'kebab': 'Кебаб', 'shawarma': 'Шаварма', 'dumplings': 'Вареники',
    'borscht': 'Борщ', 'varenyky': 'Вареники', 'deruny': 'Деруни', 'syrnyky': 'Сирники',
    'mlyntsi': 'Млинці',
    
    // Бургери
    'hamburger': 'Бургер', 'burger': 'Бургер', 'cheeseburger': 'Чізбургер',
    'double cheeseburger': 'Двійний чізбургер', 'bacon cheeseburger': 'Бекон-чізбургер',
    'double patty cheeseburger': 'Двійний чізбургер', 'double patty': 'Двійний',
    'veggie burger': 'Овочевий бургер', 'chicken burger': 'Курячий бургер',
    'fish burger': 'Рибний бургер', 'turkey burger': 'Бургер з індички',
    
    // Салати
    'caesar salad': 'Салат Цезар', 'greek salad': 'Грецький салат', 'salad': 'Салат',
    'cobb salad': 'Кобб-салат', 'caprese': 'Капрезе', 'coleslaw': 'Коуслав',
    'potato salad': 'Картопляний салат', 'fruit salad': 'Фруктовий салат',
    
    // Солодощі
    'chocolate': 'Шоколад', 'cake': 'Торт', 'pie': 'Пиріг', 'brownie': 'Брауні',
    'cheesecake': 'Чізкейк', 'tiramisu': 'Тірамісу', 'cupcake': 'Кекс',
    'macaron': 'Макарон', 'baklava': 'Баклава', 'cannoli': 'Каннолі',
    'churro': 'Чуррос', 'pudding': 'Пудинг', 'mousse': 'Мус',
    
    // Сніданок
    'cereal': 'Гранули', 'oatmeal': 'Вівсянка', 'porridge': 'Каша', 'granola': 'Гранола',
    'eggs': 'Яйця', 'egg': 'Яйце', 'omelette': 'Омлет', 'scrambled eggs': 'Яйця-болтунці',
    'fried eggs': 'Смажені яйця', 'boiled eggs': 'Варені яйця', 'french toast': 'Тост з яйцем',
    
    // Напої
    'coffee': 'Кава', 'tea': 'Чай', 'juice': 'Сік', 'soda': 'Газировка',
    'beer': 'Пиво', 'wine': 'Вино', 'water': 'Вода', 'smoothie': 'Смузі',
    'milkshake': 'Мілкшейк', 'lemonade': 'Лимонад', 'latte': 'Латте',
    'cappuccino': 'Капучіно', 'espresso': 'Еспресо',
    
    // Горіхи
    'nuts': 'Горіхи', 'almonds': 'Мигдаль', 'cashews': 'Кеш\'ю', 'peanuts': 'Арахіс',
    'walnuts': 'Волоські горіхи', 'pistachios': 'Фісташки', 'hazelnuts': 'Фундук',
    
    // Соуси
    'ketchup': 'Кетчуп', 'mustard': 'Гірчиця', 'mayonnaise': 'Майонез',
    'salsa': 'Сальса', 'guacamole': 'Гуакамоле', 'pesto': 'Песто',
    
    // Бобові
    'lentils': 'Сочевиця', 'chickpeas': 'Нут', 'tofu': 'Тофу', 'edamame': 'Едамаме',
    
    // Картопля
    'french fries': 'Картопля фрі', 'fries': 'Картопля фрі', 'chips': 'Чіпси',
    'onion rings': 'Кільця цибулі', 'mashed potatoes': 'Картопляне пюре',
    
    // Супи
    'chicken soup': 'Курячий суп', 'tomato soup': 'Томатний суп', 'minestrone': 'Мінестроне',
    'mushroom soup': 'Грибний суп', 'onion soup': 'Цибулевий суп', 'broccoli soup': 'Суп з броколі',
    'pumpkin soup': 'Гарбузовий суп', 'lentil soup': 'Сочевичний суп', 'vegetable soup': 'Овочевий суп',
    
    // Паста додатково
    'penne': 'Пенне', 'rigatoni': 'Рігатоні', 'linguine': 'Лінгвіне', 'farfalle': 'Метелики',
    'fettuccine': 'Феттучіні', 'macaroni': 'Макарони', 'gnocchi': 'Ньоккі',
    'tortellini': 'Тортелліні', 'ravioli': 'Равіолі',
    
    // Піца додатково
    'margherita': 'Маргарита', 'pepperoni pizza': 'Піца з пепероні', 'cheese pizza': 'Сирна піца',
    'hawaiian pizza': 'Гавайська піца', 'veggie pizza': 'Овочева піца',
    
    // Рис та крупи
    'fried rice': 'Смажений рис', 'risotto': 'Різотто', 'paella': 'Паелья',
    'quinoa': 'Кіноа', 'couscous': 'Кускус',
    
    // Азіатська кухня
    'sushi roll': 'Рол', 'california roll': 'Каліфорнія', 'philadelphia': 'Філадельфія',
    'tempura': 'Темпура', 'teriyaki': 'Теріякі', 'yakitori': 'Якіторі',
    'tonkatsu': 'Тонкацу', 'udon': 'Удон', 'soba': 'Соба', 'miso soup': 'Місо-суп',
    'dim sum': 'Дім-сам', 'congee': 'Конджі', 'wonton soup': 'Суп з вонтоном',
    'spring rolls': 'Літні роли', 'dumplings': 'Пельмені', 'chow mein': 'Чоу мейн',
    'lo mein': 'Ло мейн', 'kung pao': 'Кунг-пао', 'mapo tofu': 'Мапо тофу',
    
    // Корейська
    'bibimbap': 'Бібімбап', 'bulgogi': 'Бульгогі', 'galbi': 'Гальбі',
    'tteokbokki': 'Ттокбоккі', 'japchae': 'Япчхе', 'kimchi': 'Кімчі',
    'kimbap': 'Кімбап',
    
    // Тайська
    'pad thai': 'Пад Тай', 'green curry': 'Зелене каррі', 'red curry': 'Червоне каррі',
    'tom yum': 'Том Ям', 'tom kha': 'Том Кха', 'som tam': 'Сом Там',
    'massaman curry': 'Массаман',
    
    // Індійська
    'butter chicken': 'Курка в маслі', 'chicken tikka masala': 'Тіка Масала',
    'biryani': 'Бір\'яні', 'dal': 'Дал', 'samosa': 'Самоса',
    'palak paneer': 'Палак Панір', 'chana masala': 'Чана Масала',
    'tandoori': 'Тандурі', 'pakora': 'Пакора', 'chai': 'Чай',
    'mango lassi': 'Манго Лассі',
    
    // Середземноморська
    'moussaka': 'Мусака', 'spanakopita': 'Спанакопіта', 'souvlaki': 'Сувлакі',
    'gyro': 'Гірос', 'tzatziki': 'Цацикі', 'dolma': 'Долма',
    'tabbouleh': 'Таббуле', 'fattoush': 'Фаттуш', 'baba ganoush': 'Баба-гануш',
    
    // Мексиканська
    'enchilada': 'Енчілада', 'tostada': 'Тостада', 'chimichanga': 'Чимічанга',
    'empanada': 'Емпанада', 'tamale': 'Тамале',
    
    // Французька
    'crepe': 'Креп', 'quiche': 'Кіш', 'ratatouille': 'Рататуй',
    'coq au vin': 'Кок-о-Вен', 'beef bourguignon': 'Беф-Бургіньйон',
    
    // Німецька
    'schnitzel': 'Шніцель', 'bratwurst': 'Братвурст', 'pretzel': 'Брецель',
    'sauerkraut': 'Квашена капуста', 'strudel': 'Струдель',
    
    // Загальне
    'frozen yogurt': 'Заморожений йогурт', 'sorbet': 'Сорбе', 'gelato': 'Джелато',
    'smoothie bowl': 'Смузі-боул', 'acai bowl': 'Асаї боул',
    'avocado toast': 'Тост з авокадо', 'granola bar': 'Батончик з граноли',
    'energy bar': 'Енергетичний батончик', 'protein bar': 'Батончик з білком',
    'trail mix': 'Мікс горіхів', 'dried fruit': 'Сухофрукти'
};

// Функція перекладу
function translateToUkrainian(name) {
    if (!name) return 'Їжа';
    
    var lowerName = name.toLowerCase().trim();
    
    // Точне співставлення
    if (translations[lowerName]) {
        return translations[lowerName];
    }
    
    // Часткове співставлення
    for (var key in translations) {
        if (lowerName.includes(key)) {
            return translations[key];
        }
    }
    
    // Повертаємо оригінал якщо перекладу немає
    return name;
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
                    name: translateToUkrainian(resp.product_name),
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
