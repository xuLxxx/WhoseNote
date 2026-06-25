import { Button } from '@/components/ui/button';
import { DraggablePopOver } from '@/components/block/DraggablePopOver';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Send, Clipboard, BookOpen, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SidePannel() {
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
            <Toaster />
        </>
    );
}