# 🔒 Безпека API ключів для Netlify Deploy

## ⚠️ ВАЖЛИВО: API ключ скомпрометовано!

Якщо ви бачите цей файл, API ключ `AIzaSyB5_l-Raie881vvKLcM06lgWl2mL0gFblI` потрапив у публічний репозиторій.

**ТЕРМІНОВО:**
1. Перейдіть на https://aistudio.google.com/app/apikey
2. Видаліть старий API ключ
3. Згенеруйте новий ключ
4. Додайте новий ключ у Netlify Environment Variables

---

## 📋 Налаштування для Netlify Deploy

### Крок 1: Отримати новий API ключ

1. Відкрийте https://aistudio.google.com/app/apikey
2. Натисніть "Create API Key"
3. Скопіюйте згенерований ключ

### Крок 2: Додати Environment Variable у Netlify

1. Відкрийте ваш сайт у Netlify Dashboard
2. Перейдіть: **Site configuration → Environment variables**
3. Натисніть **Add a variable**
4. Додайте:
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: ваш новий API ключ
   - **Scopes**: Виберіть "Same value for all deploy contexts"
5. Натисніть **Save**

### Крок 3: Redeploy

1. Перейдіть: **Deploys → Trigger deploy**
2. Натисніть **Deploy site**

---

## 🛡️ Чому це безпечно?

### VITE_ префікс і client-side код

- Vite **автоматично включає** всі змінні з префіксом `VITE_` у фронтенд bundle
- Це **нормальна поведінка** для публічних API ключів (наприклад, Google Maps, Firebase)
- API ключ обмежується на стороні Google через:
  - Application restrictions (HTTP referrers)
  - API restrictions (тільки Gemini API)
  - Quota limits

### Netlify Secrets Scanning

Netlify за замовчуванням блокує будь-які secrets у build output. Ми відключили це для `VITE_*` змінних через:

```toml
[build.environment]
  SECRETS_SCAN_OMIT_KEYS = "VITE_*"
```

---

## 🔐 Обмеження API ключа (рекомендовано)

Після створення нового ключа, обмежте його використання:

1. У Google AI Studio → API Keys → ваш ключ → **Edit**
2. **Application restrictions**:
   - Виберіть "HTTP referrers (web sites)"
   - Додайте домени:
     - `http://localhost:*/*`
     - `https://your-netlify-domain.netlify.app/*`
     - `https://your-custom-domain.com/*` (якщо є)
3. **API restrictions**:
   - Виберіть "Restrict key"
   - Увімкніть тільки: **Gemini API**
4. Збережіть зміни

---

## 📝 Локальна розробка

1. Скопіюйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Відредагуйте `.env` і додайте ваш API ключ:
```env
VITE_GEMINI_API_KEY=your_new_api_key_here
```

3. **НІКОЛИ** не комітьте `.env` файл!

---

## ✅ Чеклист безпеки

- [ ] Старий API ключ видалено з Google AI Studio
- [ ] Новий API ключ створено
- [ ] Новий ключ доданий у Netlify Environment Variables
- [ ] Application restrictions налаштовані (HTTP referrers)
- [ ] API restrictions налаштовані (тільки Gemini API)
- [ ] `.env` файл у `.gitignore`
- [ ] Netlify deploy пройшов успішно
- [ ] AI чат працює на продакшн сайті

---

## 🆘 Troubleshooting

### Build fails з "Secrets scanning found secrets"

**Причина:** Netlify виявив API ключ у build output.

**Рішення:**
1. Перевірте, чи `SECRETS_SCAN_OMIT_KEYS = "VITE_*"` є в `netlify.toml`
2. Trigger new deploy
3. Якщо все ще не працює, додайте в Netlify UI:
   - Site settings → Build & deploy → Environment → Environment variables
   - Додайте variable: `SECRETS_SCAN_OMIT_KEYS` = `VITE_*`

### AI чат не працює після deploy

**Причина:** Environment variable не налаштована.

**Рішення:**
1. Перевірте Netlify Dashboard → Site configuration → Environment variables
2. Переконайтесь, що `VITE_GEMINI_API_KEY` існує та має правильне значення
3. Redeploy сайт

### Помилка "API key not configured"

**Причина:** API ключ не передається через environment variable.

**Рішення:**
1. У `src/lib/gemini.js` перевірте:
```javascript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```
2. У Netlify додайте змінну з префіксом `VITE_`
3. Redeploy

---

## 📚 Корисні посилання

- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Netlify Secrets Scanning](https://docs.netlify.com/configure-builds/environment-variables/#secrets-scanning)

