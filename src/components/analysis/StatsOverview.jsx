import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, TrendingUp, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsOverview({ stats, isGroup = false }) {
    const items = isGroup ? [
        {
            label: 'Науковців',
            value: stats.totalResearchers || 0,
            icon: Users,
            color: 'bg-violet-500',
            lightColor: 'bg-violet-50'
        },
        {
            label: 'Всього публікацій',
            value: stats.totalPublications || 0,
            icon: FileText,
            color: 'bg-indigo-500',
            lightColor: 'bg-indigo-50'
        },
        {
            label: 'Середня кількість',
            value: (stats.avgPublications || 0).toFixed(1),
            icon: TrendingUp,
            color: 'bg-emerald-500',
            lightColor: 'bg-emerald-50'
        },
        {
            label: 'Період активності',
            value: stats.yearRange || '-',
            icon: Calendar,
            color: 'bg-amber-500',
            lightColor: 'bg-amber-50'
        }
    ] : [
        {
            label: 'Всього публікацій',
            value: stats.totalPublications || 0,
            icon: FileText,
            color: 'bg-indigo-500',
            lightColor: 'bg-indigo-50'
        },
        {
            label: 'Типів публікацій',
            value: Object.keys(stats.byType || {}).length || 0,
            icon: TrendingUp,
            color: 'bg-emerald-500',
            lightColor: 'bg-emerald-50'
        },
        {
            label: 'Період активності',
            value: stats.yearRange || '-',
            icon: Calendar,
            color: 'bg-amber-500',
            lightColor: 'bg-amber-50'
        }
    ];

    return (
        <div className={`grid gap-4 ${isGroup ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {items.map((item, index) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">
                                        {item.label}
                                    </p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {item.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${item.lightColor}`}>
                                    <item.icon className={`w-5 h-5 ${item.color.replace('bg-', 'text-')}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
