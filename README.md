# ORCID Analyst

Аналіз публікаційної активності науковців на основі даних ORCID.

## Опис проекту

ORCID Analyst - це web-застосунок для аналізу публікаційної активності дослідників, використовуючи дані з ORCID (Open Researcher and Contributor ID) профілів.

### Основні можливості

- **Ручний аналіз**: Аналіз публікацій одного науковця за ORCID ID
- **Груповий аналіз**: Завантаження CSV файлу з кількома ORCID ID для агрегованого аналізу
- **Графіки та статистика**: Візуалізація публікацій за роками та типами
- **Список публікацій**: Детальний список всіх публікацій з можливістю фільтрації та пошуку
- **AI Асистент**: Чат-інтерфейс для взаємодії з AI-аналітиком публікацій
- **Історія аналізів**: Збереження та перегляд попередніх аналізів

## Встановлення та запуск

### Вимоги

- Node.js 16+ 
- npm або yarn

### Кроки встановлення

1. Клонуйте репозиторій:
```bash
git clone <repository-url>
cd orcid-analyst-project
```

2. Встановіть залежності:
```bash
npm install
```

3. Запустіть розробницький сервер:
```bash
npm run dev
```

4. Відкрийте браузер та перейдіть на `http://localhost:5173`

## Структура проекту

```
orcid-analyst-project/
├── src/
│   ├── components/
│   │   ├── analysis/
│   │   │   ├── OrcidInput.jsx
│   │   │   ├── PublicationCharts.jsx
│   │   │   ├── StatsOverview.jsx
│   │   │   └── PublicationsList.jsx
│   │   ├── chat/
│   │   │   ├── ChatInterface.jsx
│   │   │   └── MessageBubble.jsx
│   │   └── ui/
│   │       ├── button.jsx
│   │       ├── input.jsx
│   │       ├── card.jsx
│   │       └── index.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── History.jsx
│   ├── schemas/
│   │   ├── OrcidAnalysis.json
│   │   └── AnalysisGroup.json
│   ├── agents/
│   │   └── orcid_analyst.json
│   ├── Layout.jsx
│   ├── main.jsx
│   ├── index.css
│   └── lib/
│       └── utils.js
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Технологічний стек

- **React 18**: Бібліотека для побудови користувацького інтерфейсу
- **React Router**: Маршрутизація в програмі
- **Tailwind CSS**: Утилітарний CSS-фреймворк
- **Recharts**: Бібліотека для створення графіків
- **Framer Motion**: Анімаційна бібліотека
- **Vite**: Бібліотека збирання проекту
- **date-fns**: Робота з датами

## API Дані

Проект використовує публічний ORCID API для отримання даних про публікації:

```
https://pub.orcid.org/v3.0/{orcid_id}/works
```

## Основні компоненти

### OrcidInput
Компонент для введення ORCID ID або завантаження CSV файлу з кількома ID.

### PublicationCharts
Графіки динаміки публікацій по роках та розподілу за типами.

### StatsOverview
Карточки зі статистикою публікацій.

### PublicationsList
Таблиця зі списком публікацій з фільтрацією та пошуком.

### ChatInterface
Чат-інтерфейс для взаємодії з AI-аналітиком.

## Схеми даних

### OrcidAnalysis
Зберігає інформацію про аналіз одного науковця.

### AnalysisGroup
Зберігає агреговану інформацію про групу науковців.

## Локалізація

Проект повністю локалізований українською мовою.

## Ліцензія

MIT License

## Контакт

Для питань та пропозицій зв'яжіться з розробниками проекту.
