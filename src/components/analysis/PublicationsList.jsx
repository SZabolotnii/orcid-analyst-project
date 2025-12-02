import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Search, Filter } from 'lucide-react';

export default function PublicationsList({ publications = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [showCount, setShowCount] = useState(10);

    const types = [...new Set(publications.map(p => p.type).filter(Boolean))];
    const years = [...new Set(publications.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);

    const filtered = publications.filter(pub => {
        const matchesSearch = !searchTerm || 
            pub.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || pub.type === filterType;
        const matchesYear = filterYear === 'all' || pub.year?.toString() === filterYear;
        return matchesSearch && matchesType && matchesYear;
    });

    const displayed = filtered.slice(0, showCount);

    const formatType = (type) => {
        const names = {
            'journal-article': 'Стаття',
            'book': 'Книга',
            'book-chapter': 'Розділ',
            'conference-paper': 'Конференція',
            'dissertation': 'Дисертація',
            'preprint': 'Препринт',
            'report': 'Звіт'
        };
        return names[type] || type;
    };

    const getTypeColor = (type) => {
        const colors = {
            'journal-article': 'bg-indigo-100 text-indigo-700',
            'book': 'bg-emerald-100 text-emerald-700',
            'book-chapter': 'bg-teal-100 text-teal-700',
            'conference-paper': 'bg-amber-100 text-amber-700',
            'dissertation': 'bg-purple-100 text-purple-700',
            'preprint': 'bg-slate-100 text-slate-700'
        };
        return colors[type] || 'bg-slate-100 text-slate-700';
    };

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">
                    Список публікацій ({filtered.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Пошук за назвою..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-40">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Тип" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Всі типи</SelectItem>
                                {types.map(type => (
                                    <SelectItem key={type} value={type}>
                                        {formatType(type)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterYear} onValueChange={setFilterYear}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Рік" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Всі роки</SelectItem>
                                {years.map(year => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    {displayed.map((pub, index) => (
                        <div 
                            key={index}
                            className="p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-slate-800 line-clamp-2">
                                        {pub.title || 'Без назви'}
                                    </h4>
                                    {pub.journal && (
                                        <p className="text-sm text-slate-500 mt-1 truncate">
                                            {pub.journal}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {pub.year && (
                                        <Badge variant="outline" className="font-mono">
                                            {pub.year}
                                        </Badge>
                                    )}
                                    {pub.type && (
                                        <Badge className={getTypeColor(pub.type)}>
                                            {formatType(pub.type)}
                                        </Badge>
                                    )}
                                    {pub.doi && (
                                        <a
                                            href={`https://doi.org/${pub.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length > showCount && (
                    <Button
                        variant="outline"
                        onClick={() => setShowCount(prev => prev + 10)}
                        className="w-full"
                    >
                        Показати ще ({filtered.length - showCount} залишилось)
                    </Button>
                )}

                {filtered.length === 0 && (
                    <div className="py-12 text-center text-slate-400">
                        Публікацій не знайдено
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
