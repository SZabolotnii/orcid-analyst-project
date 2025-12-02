import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInterface({ onSendMessage, isLoading = false }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        
        setMessages(prev => [...prev, { 
            role: 'user', 
            content: userMessage 
        }]);

        if (onSendMessage) {
            await onSendMessage(userMessage);
        }
    };

    const suggestions = [
        "Проаналізуй ORCID 0000-0002-1825-0097",
        "Покажи статистику публікацій",
        "Які типи публікацій найпоширеніші?",
        "Порівняй активність по роках"
    ];

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur flex flex-col h-[600px]">
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
                            Запитайте про публікаційну активність науковця, надавши його ORCID ID
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                            {suggestions.map((suggestion, i) => (
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
                    </AnimatePresence>
                )}
                
                {isLoading && (
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
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </Card>
    );
}
