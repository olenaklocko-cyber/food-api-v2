# Налаштування середовища для Vercel

Після отримання API ключів від FatSecret, потрібно додати їх в Vercel:

## Крок 1: Перейди в налаштування Vercel
1. Відкрий https://vercel.com/dashboard
2. Знайди проєкт **food-api-v2**
3. Натисни **Settings** (Налаштування)
4. Перейди в **Environment Variables** (Змінні середовища)

## Крок 2: Додай змінні
Додай дві нові змінні:

### Змінна 1:
- **Key**: `FATSECRET_CLIENT_ID`
- **Value**: (встав свій Client ID від FatSecret)
- **Environments**: постав галочки на Production, Preview, Development

### Змінна 2:
- **Key**: `FATSECRET_CLIENT_SECRET`
- **Value**: (встав свій Client Secret від FatSecret)
- **Environments**: постав галочки на Production, Preview, Development

## Крок 3: Збережи
Натисни **"Save"** щоб зберегти змінні.

## Крок 4: Перезапусти проєкт
Vercel автоматично перезапустить проєкт після зміни змінних середовища.

---

Після цього API для розпізнавання їжі запрацює з високою точністю! 🎉
