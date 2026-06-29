import type { ExtensionMessage, ExtensionResponse } from '../types/chrome';
import { ExtensionStorage } from '../utils/storage';

// 插件安装时初始化
chrome.runtime.onInstalled.addListener(async () => {
    console.log('React 插件已安装');
});

// 监听来自其他脚本的消息
chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender, sendResponse) => {
        console.log('Received message:', message);
        handleMessage(message, sender, sendResponse);
        return true; // 保持消息通道开启
    }
);

chrome.contextMenus.create({
    id: "searchBaidu",
    title: "使用百度搜索：%s",
    contexts: ["selection"],
    onclick: function (info) {
        window.open("https://www.baidu.com/s?wd=" + info.selectionText);
    }
});

async function handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionResponse) => void
) {
    try {
        switch (message.action) {
            case 'getSettings':
                const settings = await ExtensionStorage.getSettings();
                sendResponse({ success: true, data: settings });
                break;

            case 'saveSettings':
                await ExtensionStorage.saveSettings(message.data);
                sendResponse({ success: true });
                break;

            case 'toggleEnabled':
                const currentSettings = await ExtensionStorage.getSettings();
                await ExtensionStorage.setEnabled(!currentSettings.enabled);
                sendResponse({ success: true, data: !currentSettings.enabled });
                break;

            case 'toggleSidePanel':
                console.log('toggleSidePanel', message.data);
                if (message.data) {
                    chrome.sidePanel.open({
                        windowId: sender.tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT
                    });
                } else {
                    chrome.sidePanel.close({
                        windowId: sender.tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT
                    });
                }
                sendResponse({ success: true });
                break;

            default:
                sendResponse({ success: false, error: '未知的操作类型' });
        }
    } catch (error) {
        console.error('Background script error:', error);
        sendResponse({
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
}
