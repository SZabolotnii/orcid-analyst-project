import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, FileText, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function OrcidInput({ onSubmitSingle, onSubmitBatch, isLoading }) {
    const [singleOrcid, setSingleOrcid] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [parsedOrcids, setParsedOrcids] = useState([]);
    const [error, setError] = useState('');

    const validateOrcid = (orcid) => {
        const pattern = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
        return pattern.test(orcid.trim());
    };

    const handleSingleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const trimmed = singleOrcid.trim();
        if (!validateOrcid(trimmed)) {
            setError('Невірний формат ORCID. Приклад: 0000-0002-1825-0097');
            return;
        }
        onSubmitSingle(trimmed);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');
        setUploadedFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const headers = lines[0].toLowerCase().split(/[,;]/);
            const orcidIndex = headers.findIndex(h => h.trim() === 'orcid');

            if (orcidIndex === -1) {
                setError('Файл повинен містити колонку "orcid"');
                setParsedOrcids([]);
                return;
            }

            const orcids = [];
            const invalid = [];

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(/[,;]/);
                const orcid = cols[orcidIndex]?.trim();
                if (orcid) {
                    if (validateOrcid(orcid)) {
                        orcids.push(orcid);
                    } else {
                        invalid.push(orcid);
                    }
                }
            }

            setParsedOrcids(orcids);
            if (invalid.length > 0) {
                setError(`Пропущено ${invalid.length} невалідних ID: ${invalid.slice(0, 3).join(', ')}${invalid.length > 3 ? '...' : ''}`);
            }
        };
        reader.readAsText(file);
    };

    const handleBatchSubmit = () => {
        if (parsedOrcids.length === 0) {
            setError('Немає валідних ORCID ID для аналізу');
            return;
        }
        onSubmitBatch(parsedOrcids);
    };

    const clearFile = () => {
        setUploadedFile(null);
        setParsedOrcids([]);
        setError('');
    };

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800">
                    Введіть дані для аналізу
                </CardTitle>
                <CardDescription className="text-slate-500">
                    Аналізуйте публікаційну активність одного науковця або групи
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="single" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="single" className="flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            Один науковець
                        </TabsTrigger>
                        <TabsTrigger value="batch" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Група (CSV)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="single">
                        <form onSubmit={handleSingleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="orcid" className="text-slate-700">ORCID ID</Label>
                                <div className="flex gap-3">
                                    <Input
                                        id="orcid"
                                        placeholder="0000-0002-1825-0097"
                                        value={singleOrcid}
                                        onChange={(e) => setSingleOrcid(e.target.value)}
                                        className="font-mono text-base"
                                        disabled={isLoading}
                                    />
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading || !singleOrcid.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700 px-6"
                                    >
                                        {isLoading ? 'Аналіз...' : 'Аналізувати'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="batch">
                        <div className="space-y-4">
                            {!uploadedFile ? (
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                                    <Upload className="w-10 h-10 text-slate-400 mb-3" />
                                    <span className="text-sm text-slate-600 font-medium">
                                        Натисніть для завантаження CSV
                                    </span>
                                    <span className="text-xs text-slate-400 mt-1">
                                        Файл повинен містити колонку "orcid"
                                    </span>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                </label>
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-indigo-600" />
                                            <span className="font-medium text-slate-700">{uploadedFile.name}</span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={clearFile}
                                            className="h-8 w-8"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {parsedOrcids.length > 0 && (
                                        <div className="text-sm text-slate-600">
                                            Знайдено <span className="font-semibold text-indigo-600">{parsedOrcids.length}</span> валідних ORCID ID
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {parsedOrcids.length > 0 && (
                                <Button 
                                    onClick={handleBatchSubmit}
                                    disabled={isLoading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {isLoading ? 'Аналіз...' : `Аналізувати ${parsedOrcids.length} науковців`}
                                </Button>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
