import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Sparkles, AlertCircle, Database, Users, RotateCcw } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWithGemini, isGeminiConfigured } from '@/lib/gemini';

export default function ChatInterface({ analysisResult, groupResult, messages, setMessages }) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingText]);

    const handleClearChat = () => {
        if (window.confirm('Розпочати нову розмову? Поточна історія буде видалена.')) {
            setMessages([]);
            setStreamingText('');
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        if (!isGeminiConfigured()) {
            setMessages(prev => [...prev, 
                { role: 'user', content: input.trim() },
                { 
                    role: 'assistant', 
                    content: '⚠️ Gemini API не налаштовано. Будь ласка, додайте VITE_GEMINI_API_KEY у файл .env\n\nОтримати API ключ можна тут: https://aistudio.google.com/app/apikey' 
                }
            ]);
            setInput('');
            return;
        }

        const userMessage = input.trim();
        setInput('');
        
        setMessages(prev => [...prev, { 
            role: 'user', 
            content: userMessage 
        }]);

        setIsLoading(true);
        setStreamingText('');

        try {
            const finalText = await generateWithGemini(
                userMessage,
                (chunk, fullText) => {
                    setStreamingText(fullText);
                },
                messages,
                analysisResult,
                groupResult
            );

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: finalText
            }]);
            setStreamingText('');

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ Помилка: ${error.message}\n\nПеревірте налаштування API ключа або спробуйте пізніше.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        "Проаналізуй ORCID 0000-0002-1825-0097",
        "Покажи статистику публікацій",
        "Які типи публікацій найпоширеніші?",
        "Порівняй активність по роках"
    ];

    const dataLoadedSuggestions = [
        "Проаналізуй ці дані та дай висновки",
        "Які тренди публікаційної активності?",
        "Порівняй показники по роках",
        "Які рекомендації для покращення?"
    ];

    const currentSuggestions = (analysisResult || groupResult) ? dataLoadedSuggestions : suggestions;

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur flex flex-col h-[600px]">
            {!isGeminiConfigured() && (
                <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <strong>API не налаштовано:</strong> Додайте VITE_GEMINI_API_KEY у файл .env для активації AI асистента.
                    </div>
                </div>
            )}
            
            {messages.length > 0 && !analysisResult && !groupResult && (
                <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between gap-2">
                    <div className="text-sm text-slate-600">
                        Історія розмови збережена
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearChat}
                        className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                    >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Нова розмова
                    </Button>
                </div>
            )}
            
            {(analysisResult || groupResult) && (
                <div className="bg-indigo-50 border-b border-indigo-200 p-3 flex items-center justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                        {analysisResult ? (
                            <>
                                <Database className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-indigo-800">
                                    <strong>Дані завантажено:</strong> ORCID {analysisResult.orcid_id} • {analysisResult.totalPublications} публікацій • {analysisResult.yearRange}
                                </div>
                            </>
                        ) : (
                            <>
                                <Users className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-indigo-800">
                                    <strong>Дані завантажено:</strong> Група з {groupResult.totalResearchers} дослідників • {groupResult.totalPublications} публікацій • {groupResult.yearRange}
                                </div>
                            </>
                        )}
                    </div>
                    {messages.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearChat}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
                        >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Нова розмова
                        </Button>
                    )}
                </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            AI-аналітик публікацій
                        </h3>
                        <p className="text-slate-500 text-sm max-w-md mb-6">
                            {analysisResult || groupResult 
                                ? "Запитайте про завантажені дані публікацій або виконайте новий аналіз"
                                : "Спочатку виконайте аналіз на вкладці 'Ручний аналіз', потім поверніться сюди для AI-асистування"
                            }
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                            {currentSuggestions.map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(suggestion)}
                                    className="p-3 text-sm text-left text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <MessageBubble message={msg} />
                            </motion.div>
                        ))}
                        
                        {streamingText && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <MessageBubble message={{ role: 'assistant', content: streamingText }} isStreaming={true} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
                
                {isLoading && !streamingText && (
                    <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Аналізую...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Введіть ORCID ID або запитання..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </div>
        </Card>
    );
}
