import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, MessageSquare, BarChart3, Loader2 } from 'lucide-react';
import OrcidInput from '../components/analysis/OrcidInput';
import ResearcherInfo from '../components/analysis/ResearcherInfo';
import StatsOverview from '../components/analysis/StatsOverview';
import PublicationCharts from '../components/analysis/PublicationCharts';
import PublicationsList from '../components/analysis/PublicationsList';
import ChatInterface from '../components/chat/ChatInterface';

export default function Home() {
    const [activeTab, setActiveTab] = useState('manual');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [groupResult, setGroupResult] = useState(null);
    const [chatMessages, setChatMessages] = useState(() => {
        // Завантажуємо історію з localStorage при ініціалізації
        try {
            const saved = localStorage.getItem('orcid-chat-history');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load chat history:', error);
            return [];
        }
    });

    // Зберігаємо історію в localStorage при кожній зміні
    useEffect(() => {
        try {
            localStorage.setItem('orcid-chat-history', JSON.stringify(chatMessages));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }, [chatMessages]);

    const fetchOrcidData = async (orcidId) => {
        const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/works`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Не вдалося отримати дані з ORCID');
        return await response.json();
    };

    const fetchOrcidPerson = async (orcidId) => {
        const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/person`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) return null;
        const data = await response.json();
        
        // Extract name
        const givenNames = data.name?.['given-names']?.value || '';
        const familyName = data.name?.['family-name']?.value || '';
        const fullName = `${familyName} ${givenNames}`.trim();
        
        // Extract primary affiliation
        const employments = data['employment-summary'] || [];
        const primaryEmployment = employments[0];
        const affiliation = primaryEmployment?.organization?.name || null;
        
        return { fullName, affiliation };
    };

    const parseWorks = (data) => {
        const publications = [];
        const byYear = {};
        const byType = {};

        (data.group || []).forEach(group => {
            const summary = group['work-summary']?.[0];
            if (!summary) return;

            const year = summary['publication-date']?.year?.value;
            const type = summary.type || 'other';
            const title = summary.title?.title?.value || 'Без назви';
            
            let doi = null;
            let scopusEid = null;
            let wosUid = null;
            
            (summary['external-ids']?.['external-id'] || []).forEach(id => {
                const idType = id['external-id-type']?.toLowerCase();
                const idValue = id['external-id-value'];
                
                if (idType === 'doi') {
                    doi = idValue;
                } else if (idType === 'eid') {
                    scopusEid = idValue;
                } else if (idType === 'wosuid') {
                    wosUid = idValue;
                }
            });

            publications.push({
                title,
                year: year ? parseInt(year) : null,
                type,
                doi,
                journal: summary['journal-title']?.value || null,
                scopusEid,
                wosUid,
                hasScopus: !!scopusEid,
                hasWos: !!wosUid
            });

            if (year) {
                byYear[year] = (byYear[year] || 0) + 1;
            }
            byType[type] = (byType[type] || 0) + 1;
        });

        // Calculate indexing statistics
        const total = publications.length;
        const withDoi = publications.filter(p => p.doi).length;
        const scopusIndexed = publications.filter(p => p.hasScopus).length;
        const wosIndexed = publications.filter(p => p.hasWos).length;
        const bothIndexed = publications.filter(p => p.hasScopus && p.hasWos).length;
        const indexed = publications.filter(p => p.hasScopus || p.hasWos).length;
        const notIndexed = publications.filter(p => !p.hasScopus && !p.hasWos).length;

        const indexingStats = {
            total,
            withDoi,
            doiPercentage: total > 0 ? (withDoi / total) * 100 : 0,
            scopusIndexed,
            scopusPercentage: total > 0 ? (scopusIndexed / total) * 100 : 0,
            wosIndexed,
            wosPercentage: total > 0 ? (wosIndexed / total) * 100 : 0,
            bothIndexed,
            bothPercentage: total > 0 ? (bothIndexed / total) * 100 : 0,
            indexed,
            indexedPercentage: total > 0 ? (indexed / total) * 100 : 0,
            notIndexed,
            notIndexedPercentage: total > 0 ? (notIndexed / total) * 100 : 0
        };

        return { publications, byYear, byType, indexingStats };
    };

    const handleSingleAnalysis = async (orcidId) => {
        setIsLoading(true);
        setAnalysisResult(null);
        setGroupResult(null); // Clear group analysis when starting single

        try {
            const [worksData, personData] = await Promise.all([
                fetchOrcidData(orcidId),
                fetchOrcidPerson(orcidId)
            ]);
            
            const { publications, byYear, byType, indexingStats } = parseWorks(worksData);
            
            const years = Object.keys(byYear).map(Number).filter(y => y);
            const yearRange = years.length > 0 
                ? `${Math.min(...years)} - ${Math.max(...years)}` 
                : '-';

            const result = {
                orcid_id: orcidId,
                fullName: personData?.fullName || null,
                affiliation: personData?.affiliation || null,
                totalPublications: publications.length,
                byYear,
                byType,
                publications,
                yearRange,
                indexingStats
            };

            setAnalysisResult(result);
        } catch (error) {
            console.error('Error analyzing ORCID:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBatchAnalysis = async (orcidIds) => {
        setIsLoading(true);
        setAnalysisResult(null); // Clear single analysis when starting batch
        setGroupResult(null);

        try {
            const allPublications = [];
            const aggregatedByYear = {};
            const aggregatedByType = {};
            let successCount = 0;
            let failedOrcids = [];

            for (const orcidId of orcidIds) {
                try {
                    const data = await fetchOrcidData(orcidId);
                    const { publications, byYear, byType, indexingStats } = parseWorks(data);
                    
                    allPublications.push(...publications);
                    
                    Object.entries(byYear).forEach(([year, count]) => {
                        aggregatedByYear[year] = (aggregatedByYear[year] || 0) + count;
                    });
                    Object.entries(byType).forEach(([type, count]) => {
                        aggregatedByType[type] = (aggregatedByType[type] || 0) + count;
                    });
                    
                    successCount++;
                } catch (error) {
                    console.warn(`Failed to fetch data for ORCID ${orcidId}:`, error);
                    failedOrcids.push(orcidId);
                }
            }

            const years = Object.keys(aggregatedByYear).map(Number).filter(y => y);
            const yearRange = years.length > 0 
                ? `${Math.min(...years)} - ${Math.max(...years)}` 
                : '-';

            const result = {
                totalResearchers: successCount,
                totalPublications: allPublications.length,
                avgPublications: successCount > 0 ? allPublications.length / successCount : 0,
                byYear: aggregatedByYear,
                byType: aggregatedByType,
                publications: allPublications,
                yearRange,
                failedOrcids
            };

            console.log('Group analysis result:', result);
            if (failedOrcids.length > 0) {
                console.warn(`Warning: ${failedOrcids.length} ORCID(s) failed:`, failedOrcids);
            }
            
            setGroupResult(result);
        } catch (error) {
            console.error('Error analyzing batch:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
                        ORCID Analyst
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        Аналіз публікаційної активності науковців на основі даних ORCID
                    </p>
                </motion.div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
                        <TabsTrigger value="manual" className="flex items-center gap-2 text-base">
                            <BarChart3 className="w-4 h-4" />
                            Ручний аналіз
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="flex items-center gap-2 text-base">
                            <MessageSquare className="w-4 h-4" />
                            AI Асистент
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-6">
                        <OrcidInput 
                            onSubmitSingle={handleSingleAnalysis}
                            onSubmitBatch={handleBatchAnalysis}
                            isLoading={isLoading}
                        />

                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                                <p className="text-slate-500">Завантаження даних з ORCID...</p>
                            </div>
                        )}

                        {analysisResult && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <ResearcherInfo 
                                    orcidId={analysisResult.orcid_id}
                                    fullName={analysisResult.fullName}
                                    affiliation={analysisResult.affiliation}
                                />
                                
                                <StatsOverview stats={analysisResult} isGroup={false} />
                                <PublicationCharts 
                                    byYear={analysisResult.byYear} 
                                    byType={analysisResult.byType} 
                                />
                                <PublicationsList publications={analysisResult.publications} />
                            </motion.div>
                        )}

                        {groupResult && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {console.log('Rendering group result:', groupResult)}
                                <div className="flex items-center gap-2 text-slate-600">
                                    <BookOpen className="w-5 h-5" />
                                    <span className="font-medium">Агрегований аналіз групи</span>
                                </div>
                                
                                <StatsOverview stats={groupResult} isGroup={true} />
                                <PublicationCharts 
                                    byYear={groupResult.byYear} 
                                    byType={groupResult.byType} 
                                />
                                <PublicationsList publications={groupResult.publications} />
                            </motion.div>
                        )}
                    </TabsContent>

                    <TabsContent value="chat">
                        <div className="max-w-3xl mx-auto">
                            <ChatInterface 
                                analysisResult={analysisResult}
                                groupResult={groupResult}
                                messages={chatMessages}
                                setMessages={setChatMessages}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
