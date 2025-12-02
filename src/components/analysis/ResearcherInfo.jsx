import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User, Building2, Hash } from 'lucide-react';

export default function ResearcherInfo({ orcidId, fullName, affiliation }) {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-white">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                        {fullName && (
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Дослідник</p>
                                    <p className="text-xl font-semibold text-slate-800">{fullName}</p>
                                </div>
                            </div>
                        )}
                        
                        {affiliation && (
                            <div className="flex items-start gap-3">
                                <Building2 className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Афіліація</p>
                                    <p className="text-base text-slate-700">{affiliation}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-start gap-3">
                            <Hash className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">ORCID iD</p>
                                <a 
                                    href={`https://orcid.org/${orcidId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base text-indigo-600 hover:text-indigo-800 font-mono"
                                >
                                    {orcidId}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
