import React, { useState, useEffect } from 'react';

import type { ExtensionSettings, PageInfo } from '../types/chrome';
import { ExtensionStorage } from '../utils/storage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';


const PopupApp: React.FC = () => {
  const [settings, setSettings] = useState<ExtensionSettings>({
    enabled: true,
    theme: 'light',
    fontSize: 14,
    highlightColor: '#ffff00',
    position: { x: 0, y: 100 },
    adsorption: 'left'
  });

  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await ExtensionStorage.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      toast.error('加载设置失败');
    }
  };

  // 保存设置
  const saveSettings = async (newSettings: Partial<ExtensionSettings>) => {
    try {
      await ExtensionStorage.saveSettings(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
      toast.success('设置已保存');
    } catch (error) {
      toast.error('保存设置失败');
    }
  };

  // 发送消息到 content script
  const sendMessageToCurrentTab = (message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        } else {
          reject(new Error('无法获取当前标签页'));
        }
      });
    });
  };

  // 高亮链接
  const handleHighlightLinks = async () => {
    setLoading(true);
    try {
      const response = await sendMessageToCurrentTab({
        action: 'highlight',
        data: { selector: 'a', color: settings.highlightColor }
      });

      if (response.success) {
        toast.success(`已高亮 ${response.data.count} 个链接`);
      }
    } catch (error) {
      toast.error('高亮操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 移除高亮
  const handleRemoveHighlight = async () => {
    try {
      await sendMessageToCurrentTab({ action: 'removeHighlight' });
      toast.success('已移除高亮');
    } catch (error) {
      toast.error('移除高亮失败');
    }
  };

  // 获取页面信息
  const handleGetPageInfo = async () => {
    setLoading(true);
    try {
      const response = await sendMessageToCurrentTab({ action: 'getPageInfo' });
      if (response.success) {
        setPageInfo(response.data);
        toast.success('页面信息获取成功');
      }
    } catch (error) {
      toast.error('获取页面信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换暗色模式
  const handleToggleDarkMode = async () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    await saveSettings({ theme: newTheme });

    try {
      await sendMessageToCurrentTab({
        action: 'toggleDarkMode',
        data: { enabled: newTheme === 'dark' }
      });
      toast.success('切换主题成功');
    } catch (error) {
      toast.error('切换主题失败');
    }
  };

  return (
    <div className='w-full'>
      <Button onClick={handleHighlightLinks}>高亮链接</Button>
      <Button onClick={handleRemoveHighlight}>移除高亮</Button>
      <Button onClick={handleGetPageInfo}>获取页面信息</Button>
      <Button onClick={handleToggleDarkMode}>切换暗色模式</Button>
    </div>
  );
};

export default PopupApp;
