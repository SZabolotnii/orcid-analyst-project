import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

export default function PublicationCharts({ byYear, byType, title = "Статистика публікацій" }) {
    const yearData = Object.entries(byYear || {})
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year - b.year);

    const typeData = Object.entries(byType || {})
        .map(([type, count]) => ({ 
            name: formatTypeName(type), 
            value: count,
            originalType: type 
        }))
        .sort((a, b) => b.value - a.value);

    function formatTypeName(type) {
        const names = {
            'journal-article': 'Статті',
            'book': 'Книги',
            'book-chapter': 'Розділи книг',
            'conference-paper': 'Конференції',
            'dissertation': 'Дисертації',
            'preprint': 'Препринти',
            'report': 'Звіти',
            'other': 'Інше'
        };
        return names[type] || type.replace(/-/g, ' ');
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white px-4 py-2 shadow-lg rounded-lg border border-slate-100">
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-sm text-indigo-600">
                        {payload[0].value} публікацій
                    </p>
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white px-4 py-2 shadow-lg rounded-lg border border-slate-100">
                    <p className="text-sm font-medium text-slate-800">{payload[0].name}</p>
                    <p className="text-sm text-indigo-600">
                        {payload[0].value} ({((payload[0].value / typeData.reduce((s, t) => s + t.value, 0)) * 100).toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-800">
                        Динаміка по роках
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {yearData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={yearData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="year" 
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <YAxis 
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="count" 
                                    fill="#6366f1" 
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                            Немає даних для відображення
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-800">
                        Розподіл за типом
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {typeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                                <Legend 
                                    layout="vertical" 
                                    align="right" 
                                    verticalAlign="middle"
                                    formatter={(value) => (
                                        <span className="text-sm text-slate-600">{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                            Немає даних для відображення
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
