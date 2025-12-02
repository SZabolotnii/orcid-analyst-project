# 🚀 Розгортання на HuggingFace Spaces

## Інструкція з розгортання

### 1. Створення Space

1. Перейдіть на [HuggingFace Spaces](https://huggingface.co/spaces)
2. Натисніть **"Create new Space"**
3. Налаштування:
   - **Owner**: ваш username
   - **Space name**: `orcid-analyst` (або інше ім'я)
   - **License**: Apache 2.0 або MIT
   - **Select the Space SDK**: **Docker**
   - **Space hardware**: CPU basic (безкоштовно)
   - **Visibility**: Public або Private

### 2. Налаштування Secrets

Після створення Space:

1. Перейдіть у **Settings** вашого Space
2. Знайдіть розділ **Repository secrets**
3. Додайте секрет:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: ваш Google Gemini API ключ
4. Натисніть **Add secret**

### 3. Підготовка коду

Оновіть `src/lib/gemini.js` для роботи з новим API endpoint:

```javascript
// У функції sendMessage змініть endpoint:
const apiUrl = import.meta.env.DEV 
  ? '/.netlify/functions/gemini'  // для локальної розробки
  : '/api/gemini';  // для HuggingFace Spaces

const response = await fetch(apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, history, analysisResult, groupResult })
});
```

### 4. Деплой

#### Варіант A: Git Push (рекомендовано)

```bash
# Додайте HuggingFace remote
git remote add huggingface https://huggingface.co/spaces/YOUR_USERNAME/orcid-analyst

# Закомітьте зміни
git add Dockerfile server.js README_HUGGINGFACE.md
git commit -m "Add HuggingFace Spaces support with Docker"

# Пуш на HuggingFace
git push huggingface main
```

#### Варіант B: Через Web UI

1. У вашому Space натисніть **Files** → **Add file** → **Upload files**
2. Завантажте файли:
   - `Dockerfile`
   - `server.js`
   - Весь вміст `dist/` після білда
3. HuggingFace автоматично побудує Docker image

### 5. Перевірка

Після успішного білда:

1. Space автоматично запуститься
2. Відкрийте URL вашого Space (наприклад: `https://huggingface.co/spaces/YOUR_USERNAME/orcid-analyst`)
3. Перевірте:
   - ✅ Сторінка завантажується
   - ✅ Можна ввести ORCID ID і отримати аналіз
   - ✅ Чат працює (якщо GEMINI_API_KEY налаштований)

## Структура файлів для HuggingFace

```
orcid-analyst-project/
├── Dockerfile                 # Docker конфігурація для Spaces
├── server.js                  # Express сервер (статика + API proxy)
├── package.json               # Залежності
├── dist/                      # Побудований Vite app (після npm run build)
└── README_HUGGINGFACE.md      # Ця інструкція
```

## Особливості HuggingFace Spaces

### Порт
- HuggingFace використовує **порт 7860** за замовчуванням
- Server.js налаштований на `process.env.PORT || 7860`

### Secrets
- Змінні оточення додаються через Web UI (Settings → Repository secrets)
- Доступні в коді через `process.env.VARIABLE_NAME`

### Автоматичні білди
- При кожному push на `main` Space автоматично перебудовується
- Білд логи доступні в розділі **Logs**

### Безкоштовні ресурси
- **CPU basic**: 2 vCPU, 16GB RAM, 50GB disk (безкоштовно)
- Space засинає після 48 годин неактивності
- Перше завантаження після сну займає ~10-30 секунд

## Альтернативи

### Якщо не хочете використовувати Docker:

1. **Static Space** (без чату):
   - Виберіть SDK: Static
   - Завантажте лише файли з `dist/`
   - Видаліть функціонал чату або використовуйте API ключ на клієнті (небезпечно!)

2. **Gradio Space** (з Python backend):
   - Створіть Gradio інтерфейс
   - Інтегруйте ORCID API через Python
   - Використайте `gr.HTML()` для рендерингу вашого фронтенду

## Порівняння: Netlify vs HuggingFace

| Особливість | Netlify | HuggingFace Spaces |
|-------------|---------|-------------------|
| **Serverless Functions** | ✅ Вбудовані | ❌ Потрібен Docker + Express |
| **Статичний хостинг** | ✅ Відмінний | ✅ Через Docker |
| **Безкоштовний plan** | ✅ 100GB/місяць | ✅ Unlimited |
| **Custom domain** | ✅ Так | ⚠️ Лише subdomain |
| **Secrets management** | ✅ Через UI | ✅ Через UI |
| **CI/CD** | ✅ Автоматичний | ✅ Автоматичний |
| **Cold start** | Миттєво | ~10-30 сек після сну |
| **ML інтеграції** | ❌ | ✅ Простіше |

## Підтримка

Якщо виникли проблеми:

1. Перевірте **Logs** у HuggingFace Space
2. Переконайтесь, що `GEMINI_API_KEY` доданий до Secrets
3. Перевірте, чи порт 7860 правильно налаштований
4. Локально перевірте Docker: `docker build -t orcid-analyst . && docker run -p 7860:7860 -e GEMINI_API_KEY=your_key orcid-analyst`

## Корисні посилання

- [HuggingFace Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Docker Spaces Guide](https://huggingface.co/docs/hub/spaces-sdks-docker)
- [HuggingFace Hub Python SDK](https://huggingface.co/docs/huggingface_hub/index)
