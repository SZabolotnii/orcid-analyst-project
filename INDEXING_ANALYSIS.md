# Аналіз індексації публікацій для ORCID Analyst

## Дані з прикладу: ORCID 0000-0003-0242-2234

### 📊 Загальна статистика:

| Показник | Значення | Відсоток |
|----------|----------|----------|
| Всього публікацій | 69 | 100% |
| З DOI | 33 | 47.8% |
| Без DOI | 36 | 52.2% |
| Scopus indexed | 19 | 27.5% |
| WoS indexed | 3 | 4.3% |
| Обидва (Scopus + WoS) | 0 | 0% |
| Не індексовані | 47 | 68.1% |

### 📈 Розподіл по типам публікацій:

```
1. Journal Articles: 32 (46.4%)
2. Conference Abstracts: 15 (21.7%)
3. Conference Papers: 13 (18.8%)
4. Book Chapters: 4 (5.8%)
5. Dataset: 1 (1.4%)
6. Software: 1 (1.4%)
7. Preprint: 1 (1.4%)
8. Book: 1 (1.4%)
9. Patent: 1 (1.4%)
```

---

## 🎯 План імплементації в ORCID Analyst

### Фаза 1: Базова статистика індексації

#### 1.1 Додати нові метрики в `StatsOverview`

**Нові карточки:**
```javascript
// src/components/analysis/StatsOverview.jsx

const IndexingStats = ({ stats }) => (
  <>
    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          DOI Coverage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-green-600">
          {stats.with_doi}/{stats.total_works}
        </div>
        <p className="text-sm text-muted-foreground">
          {stats.doi_percentage}% з DOI
        </p>
      </CardContent>
    </Card>

    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          Scopus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-blue-600">
          {stats.scopus_indexed}
        </div>
        <p className="text-sm text-muted-foreground">
          {stats.scopus_percentage}% indexed
        </p>
      </CardContent>
    </Card>

    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-500" />
          Web of Science
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-purple-600">
          {stats.wos_indexed}
        </div>
        <p className="text-sm text-muted-foreground">
          {stats.wos_percentage}% indexed
        </p>
      </CardContent>
    </Card>
  </>
);
```

#### 1.2 Розширити функцію `parseWorks` в Home.jsx

```javascript
const parseWorks = (data) => {
    const publications = [];
    const byYear = {};
    const byType = {};
    
    // NEW: Indexing statistics
    let withDoi = 0;
    let scopusIndexed = 0;
    let wosIndexed = 0;
    const dois = [];
    const scopusEids = [];
    const wosUids = [];

    (data.group || []).forEach(group => {
        const summary = group['work-summary']?.[0];
        if (!summary) return;

        const year = summary['publication-date']?.year?.value;
        const type = summary.type || 'other';
        const title = summary.title?.title?.value || 'Без назви';
        
        let doi = null;
        let hasScopus = false;
        let hasWos = false;
        
        // Parse external IDs
        const externalIds = summary['external-ids']?.['external-id'] || [];
        externalIds.forEach(id => {
            const idType = id['external-id-type']?.toLowerCase();
            const idValue = id['external-id-value'];
            
            if (idType === 'doi') {
                doi = idValue;
                withDoi++;
                dois.push(idValue);
            } else if (idType === 'eid') {
                hasScopus = true;
                scopusIndexed++;
                scopusEids.push(idValue);
            } else if (idType === 'wosuid') {
                hasWos = true;
                wosIndexed++;
                wosUids.push(idValue);
            }
        });

        publications.push({
            title,
            year: year ? parseInt(year) : null,
            type,
            doi,
            journal: summary['journal-title']?.value || null,
            hasScopus,
            hasWos
        });

        if (year) {
            byYear[year] = (byYear[year] || 0) + 1;
        }
        byType[type] = (byType[type] || 0) + 1;
    });

    return {
        publications,
        byYear,
        byType,
        // NEW
        indexingStats: {
            total: publications.length,
            withDoi,
            withoutDoi: publications.length - withDoi,
            doiPercentage: publications.length > 0 ? 
                Math.round(withDoi / publications.length * 100 * 10) / 10 : 0,
            scopusIndexed,
            scopusPercentage: publications.length > 0 ? 
                Math.round(scopusIndexed / publications.length * 100 * 10) / 10 : 0,
            wosIndexed,
            wosPercentage: publications.length > 0 ? 
                Math.round(wosIndexed / publications.length * 100 * 10) / 10 : 0,
            bothIndexed: publications.filter(p => p.hasScopus && p.hasWos).length,
            notIndexed: publications.filter(p => !p.hasScopus && !p.hasWos).length,
            dois,
            scopusEids,
            wosUids
        }
    };
};
```

#### 1.3 Візуалізація індексації в PublicationsList

**Додати badge для кожної публікації:**

```javascript
// src/components/analysis/PublicationsList.jsx

const IndexingBadges = ({ hasScopus, hasWos, doi }) => (
  <div className="flex gap-1 flex-wrap">
    {doi && (
      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
        <Link2 className="w-3 h-3 mr-1" />
        DOI
      </Badge>
    )}
    {hasScopus && (
      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
        <Database className="w-3 h-3 mr-1" />
        Scopus
      </Badge>
    )}
    {hasWos && (
      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
        <Globe className="w-3 h-3 mr-1" />
        WoS
      </Badge>
    )}
  </div>
);

// В таблиці публікацій:
<TableCell>
  <div className="space-y-1">
    <div className="font-medium">{pub.title}</div>
    <IndexingBadges hasScopus={pub.hasScopus} hasWos={pub.hasWos} doi={pub.doi} />
  </div>
</TableCell>
```

---

### Фаза 2: Графіки індексації

#### 2.1 Новий компонент `IndexingCharts.jsx`

```javascript
// src/components/analysis/IndexingCharts.jsx

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Legend, Tooltip } from 'recharts';

export default function IndexingCharts({ indexingStats, byType }) {
    // Pie chart data for indexing coverage
    const indexingData = [
        { name: 'Scopus', value: indexingStats.scopusIndexed, color: '#3b82f6' },
        { name: 'WoS', value: indexingStats.wosIndexed, color: '#8b5cf6' },
        { name: 'Not indexed', value: indexingStats.notIndexed, color: '#cbd5e1' }
    ];

    // Bar chart: indexing by publication type
    const typeIndexingData = Object.entries(byType).map(([type, count]) => ({
        type,
        total: count,
        // Calculate how many of this type are indexed (would need extended data)
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Indexing Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                    <PieChart width={300} height={300}>
                        <Pie
                            data={indexingData}
                            cx={150}
                            cy={150}
                            outerRadius={100}
                            dataKey="value"
                            label
                        >
                            {indexingData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                    </PieChart>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>DOI vs No DOI</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>With DOI</span>
                            <span className="font-bold text-green-600">
                                {indexingStats.withDoi} ({indexingStats.doiPercentage}%)
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-green-500 h-3 rounded-full"
                                style={{ width: `${indexingStats.doiPercentage}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Without DOI</span>
                            <span>{indexingStats.withoutDoi} ({100 - indexingStats.doiPercentage}%)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
```

---

### Фаза 3: Експорт з індексацією

#### 3.1 Розширений CSV експорт

```javascript
// src/utils/export/csvExport.js

export function exportPublicationsWithIndexing(publications, filename) {
    const headers = [
        'Title',
        'Year',
        'Type',
        'Journal',
        'DOI',
        'Has DOI',
        'Scopus Indexed',
        'WoS Indexed',
        'Scopus EID',
        'WoS UID'
    ];

    const rows = publications.map(pub => [
        pub.title,
        pub.year || '',
        pub.type || '',
        pub.journal || '',
        pub.doi || '',
        pub.doi ? 'Yes' : 'No',
        pub.hasScopus ? 'Yes' : 'No',
        pub.hasWos ? 'Yes' : 'No',
        pub.scopusEid || '',
        pub.wosUid || ''
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || `publications_with_indexing_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}
```

---

### Фаза 4: API інтеграції (Advanced)

#### 4.1 Crossref API для верифікації DOI

```javascript
// src/api/crossref.js

export async function validateDOI(doi) {
    try {
        const response = await fetch(`https://api.crossref.org/works/${doi}`);
        if (response.ok) {
            const data = await response.json();
            return {
                valid: true,
                citations: data.message['is-referenced-by-count'],
                title: data.message.title[0],
                publisher: data.message.publisher
            };
        }
    } catch (error) {
        return { valid: false };
    }
}
```

#### 4.2 Scopus API (потрібен API key)

```javascript
// src/api/scopus.js

export async function getScopusCitations(scopusId, apiKey) {
    const response = await fetch(
        `https://api.elsevier.com/content/abstract/scopus_id/${scopusId}`,
        {
            headers: {
                'X-ELS-APIKey': apiKey,
                'Accept': 'application/json'
            }
        }
    );
    
    if (response.ok) {
        const data = await response.json();
        return {
            citations: data['abstracts-retrieval-response']?.['coredata']?.['citedby-count'],
            title: data['abstracts-retrieval-response']?.['coredata']?.['dc:title']
        };
    }
}
```

---

## 🎨 UI Mockup

### Нова секція "Indexing Quality"

```
┌─────────────────────────────────────────────────────────────┐
│                    Indexing Quality                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ DOI: 47.8%│  │ Scopus:  │  │  WoS:    │  │  Both:   │  │
│  │    ✓     │  │  27.5%   │  │  4.3%    │  │  0.0%    │  │
│  │  33/69   │  │  19/69   │  │  3/69    │  │  0/69    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  Recommendations:                                           │
│  • 52% of works lack DOI - consider retroactive DOI        │
│    assignment through Crossref or DataCite                  │
│  • Low WoS coverage (4.3%) - focus on higher impact        │
│    journals for future publications                         │
│  • 68% not indexed - review publication venues              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Структура даних

### Розширена схема аналізу:

```json
{
  "orcid_id": "0000-0003-0242-2234",
  "fullName": "Serhii Zabolotnii",
  "totalPublications": 69,
  "indexingStats": {
    "total": 69,
    "withDoi": 33,
    "doiPercentage": 47.8,
    "scopusIndexed": 19,
    "scopusPercentage": 27.5,
    "wosIndexed": 3,
    "wosPercentage": 4.3,
    "bothIndexed": 0,
    "notIndexed": 47,
    "recommendations": [
      "Consider DOI assignment for 36 works",
      "Target higher impact journals for WoS indexing"
    ]
  },
  "publications": [
    {
      "title": "...",
      "year": 2025,
      "type": "journal-article",
      "doi": "10.xxx/xxx",
      "hasScopus": true,
      "hasWos": false,
      "scopusEid": "2-s2.0-xxx",
      "citations": 5
    }
  ]
}
```

---

## 🚀 Пріоритети імплементації

### High Priority (цей тиждень):
1. ✅ Розширити `parseWorks()` для збору індексації
2. ✅ Додати нові карточки в `StatsOverview`
3. ✅ Badges в `PublicationsList`

### Medium Priority (наступний тиждень):
4. 📊 Графіки індексації `IndexingCharts`
5. 📥 Експорт з індексацією
6. 💡 Рекомендації на основі індексації

### Low Priority (майбутнє):
7. 🔗 Crossref API для citations
8. 📚 Scopus API (вимагає ключа)
9. 🌐 OpenAlex API як альтернатива

---

## 💡 Додаткові ідеї

### 1. Quality Score
```javascript
const calculateQualityScore = (indexingStats) => {
    const weights = {
        doi: 0.3,
        scopus: 0.4,
        wos: 0.3
    };
    
    return (
        indexingStats.doiPercentage * weights.doi +
        indexingStats.scopusPercentage * weights.scopus +
        indexingStats.wosPercentage * weights.wos
    ) / 100;
};

// Quality Score: 0.31 (31%) - "Needs Improvement"
// Quality Score: 0.65 (65%) - "Good"
// Quality Score: 0.85 (85%) - "Excellent"
```

### 2. Temporal Analysis
- Чи покращується індексація з роками?
- Тренд DOI adoption

### 3. Comparison
- Порівняння з середніми показниками по галузі
- Бенчмаркінг проти інших дослідників

### 4. Alerts
- "15 publications need DOI assignment"
- "Consider submitting to Scopus-indexed journals"

---

**Автор:** ORCID Analyst Team  
**Дата:** 3 грудня 2025  
**Версія:** 1.0
