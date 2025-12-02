import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Clock, FileText, Users, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function History() {
    const [analyses, setAnalyses] = React.useState([]);
    const [groups, setGroups] = React.useState([]);

    React.useEffect(() => {
        // Завантажити дані з localStorage або API
        const savedAnalyses = localStorage.getItem('orcid_analyses');
        const savedGroups = localStorage.getItem('orcid_groups');
        
        if (savedAnalyses) setAnalyses(JSON.parse(savedAnalyses));
        if (savedGroups) setGroups(JSON.parse(savedGroups));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        Історія аналізів
                    </h1>
                    <p className="text-slate-500">
                        Перегляд попередніх аналізів публікаційної активності
                    </p>
                </motion.div>

                <div className="space-y-8">
                    {groups.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Групові аналізи
                            </h2>
                            <div className="grid gap-4">
                                {groups.map((group, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-800 mb-2">
                                                            {group.name}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-4 h-4" />
                                                                {group.totalResearchers} науковців
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FileText className="w-4 h-4" />
                                                                {group.totalPublications} публікацій
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                {group.timestamp && format(new Date(group.timestamp), 'dd MMM yyyy, HH:mm', { locale: uk })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-violet-100 text-violet-700">
                                                        Ср. {group.avgPublications?.toFixed(1)} публ./особу
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {analyses.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Індивідуальні аналізи
                            </h2>
                            <div className="grid gap-4">
                                {analyses.map((analysis, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-semibold text-slate-800">
                                                                Аналіз
                                                            </h3>
                                                            <a
                                                                href={`https://orcid.org/${analysis.orcid_id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                                            >
                                                                {analysis.orcid_id}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <FileText className="w-4 h-4" />
                                                                {analysis.totalPublications} публікацій
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                {analysis.timestamp && format(new Date(analysis.timestamp), 'dd MMM yyyy, HH:mm', { locale: uk })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(analysis.byType || {})
                                                            .slice(0, 3)
                                                            .map(([type, count]) => (
                                                                <Badge key={type} variant="outline" className="text-xs">
                                                                    {type}: {count}
                                                                </Badge>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {analyses.length === 0 && groups.length === 0 && (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-16 text-center">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-600 mb-2">
                                    Історія порожня
                                </h3>
                                <p className="text-slate-400 mb-4">
                                    Проведіть перший аналіз публікаційної активності
                                </p>
                                <a 
                                    href="/"
                                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Перейти до аналізу →
                                </a>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
