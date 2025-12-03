# Roadmap: Інтеграція ORCID Analyst з DSpace-CRIS

## Загальна стратегія

Поетапний розвиток проекту від standalone аналітичного інструменту до повноцінної CRIS-системи з інтеграцією DSpace.

---

## Фаза 1: Базова інтеграція (1-2 місяці)

### Мета: Забезпечити експорт даних для імпорту в DSpace

### 1.1 Експорт метаданих

**Задачі:**
- [ ] Імплементувати експорт у Dublin Core формат (XML)
- [ ] Додати експорт у CERIF XML
- [ ] Створити CSV експорт з усіма метаданими
- [ ] Додати JSON-LD експорт для linked data

**Файли для створення:**
```
src/
  utils/
    export/
      dublinCore.js      # Dublin Core XML експорт
      cerifXml.js        # CERIF XML експорт
      csvExport.js       # Розширений CSV експорт
      jsonLd.js          # JSON-LD експорт
  components/
    analysis/
      ExportMenu.jsx     # UI для вибору формату експорту
```

**Технічні деталі:**
- Підтримка Dublin Core елементів: dc.title, dc.creator, dc.date, dc.identifier.doi
- CERIF 1.6 XML schema compliance
- Batch export для групових аналізів

### 1.2 Розширення метаданих з ORCID

**Задачі:**
- [ ] Додати парсинг funding information
- [ ] Отримувати повну інформацію про співавторів
- [ ] Збирати affiliation history
- [ ] Додати keywords/subjects з публікацій

**API endpoints для використання:**
```
/person/funding
/person/education
/person/employments
/person/peer-reviews
```

### 1.3 API Documentation

**Задачі:**
- [ ] Створити OpenAPI/Swagger специфікацію
- [ ] Документувати формати експорту
- [ ] Приклади інтеграції з DSpace
- [ ] Інструкція для адміністраторів репозиторіїв

**Файли:**
```
docs/
  api/
    openapi.yaml
    integration-guide.md
    dspace-import-tutorial.md
```

---

## Фаза 2: Пряма інтеграція DSpace (3-4 місяці)

### Мета: Автоматичний імпорт даних у DSpace репозиторії

### 2.1 DSpace REST API клієнт

**Задачі:**
- [ ] Імплементувати DSpace 7+ REST API клієнт
- [ ] Підтримка автентифікації (JWT tokens)
- [ ] Створення items через API
- [ ] Оновлення існуючих items
- [ ] Batch операції

**Файли:**
```
src/
  api/
    dspace/
      client.js          # Базовий DSpace REST клієнт
      auth.js            # Автентифікація
      items.js           # Робота з items
      collections.js     # Робота з колекціями
      metadata.js        # Маппінг метаданих
```

**Приклад коду:**
```javascript
// src/api/dspace/client.js
export class DSpaceClient {
  constructor(baseUrl, credentials) {
    this.baseUrl = baseUrl;
    this.token = null;
  }
  
  async authenticate() {
    // JWT authentication
  }
  
  async createItem(collectionId, metadata) {
    // POST /api/core/items
  }
  
  async updateItem(itemId, metadata) {
    // PATCH /api/core/items/{itemId}
  }
}
```

### 2.2 UI для налаштування DSpace

**Задачі:**
- [ ] Сторінка Settings з DSpace конфігурацією
- [ ] Збереження credentials в безпечному вигляді
- [ ] Вибір target collection
- [ ] Тестування з'єднання
- [ ] Mapping полів ORCID → DSpace

**UI компоненти:**
```
src/
  pages/
    Settings.jsx
  components/
    settings/
      DSpaceConnection.jsx
      FieldMapping.jsx
      CollectionSelector.jsx
```

### 2.3 Автоматичний імпорт

**Задачі:**
- [ ] Кнопка "Push to DSpace" після аналізу
- [ ] Batch import для групових аналізів
- [ ] Прогрес бар для довгих операцій
- [ ] Обробка помилок та повторні спроби
- [ ] Логування операцій

**Features:**
- Вибір публікацій для імпорту (checkboxes)
- Попередній перегляд метаданих
- Конфлікт resolution (якщо item вже існує)
- Success/error notifications

---

## Фаза 3: Розширення типів контенту (4-6 місяців)

### Мета: Підтримка всіх типів дослідницької діяльності

### 3.1 Розширені типи робіт

**Задачі:**
- [ ] Patents (патенти)
- [ ] Datasets (набори даних)
- [ ] Software (програмне забезпечення)
- [ ] Presentations (презентації)
- [ ] Technical reports
- [ ] Conference proceedings

**API інтеграції:**
- DataCite API для datasets
- Zenodo API
- GitHub API для software
- Patent databases (EPO, USPTO)

### 3.2 Funding tracking

**Задачі:**
- [ ] Парсинг funding з ORCID
- [ ] Інтеграція з Crossref Funder Registry
- [ ] OpenAIRE integration
- [ ] Візуалізація funding timeline
- [ ] Експорт funding звітів

**UI:**
```
components/
  funding/
    FundingTimeline.jsx
    GrantsList.jsx
    FundingStats.jsx
```

### 3.3 Collaboration network

**Задачі:**
- [ ] Граф співавторів
- [ ] Мережевий аналіз (centrality metrics)
- [ ] Візуалізація co-authorship network
- [ ] Експорт у Gephi/Cytoscape формат
- [ ] Institutional collaboration map

**Бібліотеки:**
- D3.js або Vis.js для графів
- Sigma.js для великих мереж

---

## Фаза 4: Institutional Features (6-9 місяців)

### Мета: Функції для управління на рівні інституції

### 4.1 Multi-tenant architecture

**Задачі:**
- [ ] Система організацій/інституцій
- [ ] User roles (admin, manager, researcher)
- [ ] Organizational branding
- [ ] Per-institution настройки
- [ ] Multi-institution aggregated analytics

**Database schema:**
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  logo_url VARCHAR(255),
  dspace_url VARCHAR(255),
  orcid_institutional_id VARCHAR(255)
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  orcid VARCHAR(19),
  organization_id UUID,
  role VARCHAR(50)
);
```

### 4.2 Institutional dashboard

**Задачі:**
- [ ] Загальна статистика інституції
- [ ] Rankings та benchmarking
- [ ] Department/Faculty breakdown
- [ ] Publication quality metrics
- [ ] Open Access compliance tracking
- [ ] Research output trends

**Візуалізації:**
- Heatmap публікацій по підрозділах
- Timeline загального зростання
- Порівняння з іншими інституціями
- TOP researchers/departments

### 4.3 Automated reporting

**Задачі:**
- [ ] Scheduled reports (щомісячні, квартальні)
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Custom report builder
- [ ] Integration з BI tools (Tableau, Power BI)

**Report types:**
- Annual research output
- OA compliance report
- Funding success rates
- Impact metrics report

---

## Фаза 5: Advanced Analytics (9-12 місяців)

### Мета: AI-driven аналітика та прогнозування

### 5.1 Enhanced AI features

**Задачі:**
- [ ] Автоматичне визначення research topics (NLP)
- [ ] Рекомендації для collaboration
- [ ] Prediction моделі (майбутні citations)
- [ ] Anomaly detection (unusual patterns)
- [ ] Автоматичне таггування публікацій

**AI Models:**
- BERT для topic modeling
- Graph Neural Networks для collaboration prediction
- Time series forecasting для trends

### 5.2 Citation analytics

**Задачі:**
- [ ] Інтеграція з OpenCitations
- [ ] Crossref cited-by data
- [ ] Citation network visualization
- [ ] h-index та інші метрики
- [ ] Altmetrics (social media impact)

**API інтеграції:**
- OpenCitations API
- Crossref Event Data
- Altmetric API
- Dimensions API

### 5.3 Research impact assessment

**Задачі:**
- [ ] Bibliometric indicators
- [ ] Field-normalized metrics
- [ ] Qualitative impact (policy влив, media mentions)
- [ ] SDG mapping (Sustainable Development Goals)
- [ ] Societal impact visualization

---

## Технічний стек (оновлений)

### Backend розширення

```
Поточний:  Frontend-only (React + Vite)
           Netlify Functions для Gemini API

Майбутній: Full-stack архітектура
           - Node.js + Express (або Fastify)
           - PostgreSQL для institutional data
           - Redis для кешування
           - Bull для job queues (batch imports)
```

### Нові залежності

```json
{
  "dependencies": {
    "@dspace/rest-api": "^7.0.0",
    "xml-js": "^1.6.11",
    "papaparse": "^5.4.1",
    "d3": "^7.8.5",
    "vis-network": "^9.1.0",
    "pdfkit": "^0.13.0",
    "node-cron": "^3.0.2"
  }
}
```

### Infrastructure

```
Development:  localhost + Netlify Functions
Staging:      Vercel або Railway
Production:   Kubernetes cluster або
              Dedicated server для інституцій
```

---

## Milestone Timeline

### Q1 2026 (Січень-Березень)
- ✅ Фаза 1.1: Експорт метаданих
- ✅ Фаза 1.2: Розширення ORCID даних
- ✅ Фаза 1.3: API документація

### Q2 2026 (Квітень-Червень)
- ✅ Фаза 2.1: DSpace REST клієнт
- ✅ Фаза 2.2: UI для налаштування
- ✅ Фаза 2.3: Автоматичний імпорт

### Q3 2026 (Липень-Вересень)
- ✅ Фаза 3.1: Розширені типи робіт
- ✅ Фаза 3.2: Funding tracking
- 🔄 Фаза 3.3: Collaboration network

### Q4 2026 (Жовтень-Грудень)
- 🔄 Фаза 4.1: Multi-tenant
- 📅 Фаза 4.2: Institutional dashboard
- 📅 Фаза 4.3: Automated reporting

### 2027
- 📅 Фаза 5: Advanced Analytics
- 📅 Масштабування та комерціалізація

---

## Пріоритети розробки

### High Priority (Наступні 2 місяці)
1. Dublin Core експорт
2. CERIF XML експорт
3. DSpace REST API basic client
4. UI для експорту результатів

### Medium Priority (3-6 місяців)
1. Пряма інтеграція з DSpace
2. Funding information
3. Patent та dataset підтримка
4. Collaboration network

### Low Priority (6+ місяців)
1. Multi-tenant features
2. Advanced AI analytics
3. Custom reporting
4. Mobile app

---

## Виклики та ризики

### Технічні виклики
- **DSpace версії**: Різні інституції можуть використовувати різні версії DSpace (4.x, 5.x, 6.x, 7.x)
- **Metadata mapping**: Різні інституції мають різні metadata schemas
- **Scalability**: Batch операції з тисячами публікацій
- **API rate limits**: ORCID та інші API мають ліміти

### Рішення
- Підтримка backwards compatibility
- Flexible metadata mapping engine
- Queue-based processing з retry logic
- Кешування та локальне зберігання даних

---

## Метрики успіху

### MVP (після Фази 2)
- 5+ інституцій тестують інтеграцію
- 1000+ публікацій імпортовано в DSpace
- < 5% error rate при імпорті
- Позитивний feedback від користувачів

### Full Product (після Фази 4)
- 50+ інституцій активно використовують
- 100,000+ публікацій в системі
- 1000+ активних користувачів
- Commercial partnerships з університетами

---

## Комерціалізація

### Business Model

**Freemium:**
- Free tier: до 10 дослідників, базовий аналіз
- Professional: $99/month - до 100 дослідників, DSpace інтеграція
- Enterprise: Custom pricing - необмежено, advanced analytics, підтримка

**Target audience:**
- Університетські бібліотеки
- Research offices
- Funding agencies
- Publishers

---

## Наступні кроки (цього тижня)

1. [ ] Створити `src/utils/export/dublinCore.js`
2. [ ] Додати кнопку "Export" в UI результатів аналізу
3. [ ] Імплементувати базовий Dublin Core XML експорт
4. [ ] Протестувати імпорт в DSpace 7 demo instance
5. [ ] Задокументувати процес імпорту

---

## Корисні ресурси

- [DSpace 7 REST API Documentation](https://wiki.lyrasis.org/display/DSDOC7x/REST+API)
- [CERIF Specification](https://eurocris.org/services/main-features-cerif)
- [Dublin Core Metadata Initiative](https://www.dublincore.org/)
- [ORCID Public API v3.0](https://info.orcid.org/documentation/api-tutorials/api-tutorial-read-data-on-a-record/)
- [OpenCitations API](https://opencitations.net/index/coci/api/v1)

---

**Автор:** ORCID Analyst Team  
**Дата:** 2 грудня 2025  
**Версія:** 1.0
