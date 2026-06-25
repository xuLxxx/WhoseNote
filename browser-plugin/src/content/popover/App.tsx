import { Button } from '@/components/ui/button';
import { DraggablePopOver } from '@/components/block/DraggablePopOver';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Send, Clipboard, BookOpen, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PopoverApp(): React.ReactNode {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [clipboardText, setClipboardText] = useState('');
    const [noteTitle, setNoteTitle] = useState('');

    const handleRagQuery = async () => {
        if (!question.trim()) return;
        setIsLoading(true);
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'ragQuery',
                data: { question: question.trim() }
            });
            if (response.success && response.data?.data?.answer) {
                setAnswer(response.data.data.answer);
            } else {
                setAnswer('查询失败: ' + (response.error || '未知错误'));
            }
        } catch (error) {
            setAnswer('查询失败: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveClipboard = async () => {
        if (!clipboardText.trim()) return;
        try {
            const pageInfo = await chrome.tabs.query({ active: true, currentWindow: true });
            const pageUrl = pageInfo[0]?.url || '';
            const pageTitle = pageInfo[0]?.title || '未知页面';

            const response = await chrome.runtime.sendMessage({
                action: 'saveWebContent',
                data: {
                    title: noteTitle || '网页摘录',
                    content: clipboardText,
                    pageUrl,
                    pageTitle
                }
            });

            if (response.success) {
                setClipboardText('');
                setNoteTitle('');
            }
        } catch (error) {
            console.error('保存失败:', error);
        }
    };

    const handleGetSelection = async () => {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getSelection'
            });
            if (response.success && response.data) {
                setClipboardText(response.data);
            }
        } catch (error) {
            console.log('无法获取选中内容');
        }
    };

    return (
        <>
            <DraggablePopOver width={360} initialPosition="right">
                <Tabs defaultValue="qa" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 mb-4">
                        <TabsTrigger value="qa" className="gap-1.5">
                            <Send className="w-4 h-4" />
                            <span className="text-xs">智能问答</span>
                        </TabsTrigger>
                        <TabsTrigger value="clipboard" className="gap-1.5">
                            <Clipboard className="w-4 h-4" />
                            <span className="text-xs">划词保存</span>
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-xs">我的笔记</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="qa" className="space-y-3 pt-0">
                        <Input
                            placeholder="输入问题，从笔记中查找答案..."
                            value={question}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleRagQuery()}
                        />
                        <Button
                            variant="default"
                            onClick={handleRagQuery}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? '查询中...' : '提问'}
                        </Button>
                        {answer && (
                            <ScrollArea className="h-48 rounded-lg border">
                                <div className="p-3 text-sm leading-relaxed">
                                    {answer}
                                </div>
                            </ScrollArea>
                        )}
                    </TabsContent>

                    <TabsContent value="clipboard" className="space-y-3 pt-0">
                        <Button variant="outline" onClick={handleGetSelection} className="w-full">
                            获取选中内容
                        </Button>
                        <Input
                            placeholder="笔记标题"
                            value={noteTitle}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoteTitle(e.target.value)}
                        />
                        <textarea
                            className="w-full h-32 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
                            placeholder="选中的网页内容..."
                            value={clipboardText}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setClipboardText(e.target.value)}
                        />
                        <Button
                            variant="default"
                            onClick={handleSaveClipboard}
                            className="w-full"
                            disabled={!clipboardText.trim()}
                        >
                            保存到笔记
                        </Button>
                    </TabsContent>

                    <TabsContent value="notes" className="space-y-3 pt-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">笔记列表</span>
                            <Button variant="ghost" size="sm" className="gap-1">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                        <ScrollArea className="h-64 rounded-lg border">
                            <div className="p-3 space-y-2">
                                <div className="px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                                    <div className="text-sm font-medium">欢迎使用</div>
                                    <div className="text-xs text-muted-foreground mt-1">2024-01-01</div>
                                </div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                                    <div className="text-sm font-medium">使用指南</div>
                                    <div className="text-xs text-muted-foreground mt-1">2024-01-02</div>
                                </div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                                    <div className="text-sm font-medium">知识库介绍</div>
                                    <div className="text-xs text-muted-foreground mt-1">2024-01-03</div>
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DraggablePopOver>
            <Toaster />
        </>
    );
}