import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, AlertCircle, Bot, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    
    return (
        <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                </div>
            )}
            <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
                {message.content && (
                    <div className={cn(
                        "rounded-2xl px-4 py-3",
                        isUser 
                            ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white" 
                            : "bg-white border border-slate-200 shadow-sm"
                    )}>
                        {isUser ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                        ) : (
                            <ReactMarkdown 
                                className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                                components={{
                                    code: ({ inline, className, children, ...props }) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <div className="relative group/code">
                                                <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto my-2">
                                                    <code className={className} {...props}>{children}</code>
                                                </pre>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(String(children));
                                                        toast.success('Скопійовано');
                                                    }}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 text-xs font-mono">
                                                {children}
                                            </code>
                                        );
                                    },
                                    a: ({ children, ...props }) => (
                                        <a {...props} target="_blank" rel="noopener noreferrer" 
                                            className="text-indigo-600 hover:text-indigo-800 underline">{children}</a>
                                    ),
                                    p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-slate-700">{children}</li>,
                                    h1: ({ children }) => <h1 className="text-lg font-bold my-3 text-slate-800">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-base font-bold my-2 text-slate-800">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-bold my-2 text-slate-800">{children}</h3>,
                                    strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto my-3">
                                            <table className="min-w-full border-collapse text-sm">{children}</table>
                                        </div>
                                    ),
                                    th: ({ children }) => <th className="border border-slate-200 px-3 py-2 bg-slate-50 font-medium text-left">{children}</th>,
                                    td: ({ children }) => <td className="border border-slate-200 px-3 py-2">{children}</td>,
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>
                )}
            </div>
            {isUser && (
                <div className="h-8 w-8 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                </div>
            )}
        </div>
    );
}
