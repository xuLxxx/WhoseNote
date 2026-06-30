import type { ExtensionMessage, ExtensionResponse } from "../types/chrome";
import { ExtensionStorage } from "../utils/storage";

interface UserInfo {
  islogin: boolean;
  username: string;
  avatar: string;
}

const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL;

let userInfo: UserInfo = {
  islogin: false,
  username: "",
  avatar: "",
};
// 插件安装时初始化
chrome.runtime.onInstalled.addListener(async () => {
  console.log("React 插件已安装");
  chrome.contextMenus.create({
    id: "openSidePanel",
    title: "Open side panel",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSidePanel") {
    // This will open the panel in all the pages on the current window.
    chrome.sidePanel.open({
      windowId: tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT,
    });
  }
});

// 监听来自其他脚本的消息
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // 保持消息通道开启
});

async function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: ExtensionResponse) => void,
) {
  try {
    switch (message.action) {
      case "getSettings":
        const settings = await ExtensionStorage.getSettings();
        sendResponse({ success: true, data: settings });
        break;

      case "saveSettings":
        await ExtensionStorage.saveSettings(message.data);
        sendResponse({ success: true });
        break;

      case "toggleEnabled":
        const currentSettings = await ExtensionStorage.getSettings();
        await ExtensionStorage.setEnabled(!currentSettings.enabled);
        sendResponse({ success: true, data: !currentSettings.enabled });
        break;

      case "toggleSidePanel":
        if (message.data) {
          chrome.sidePanel.open({
            windowId: sender.tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT,
          });
        } else {
          chrome.sidePanel.close({
            windowId: sender.tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT,
          });
        }
        sendResponse({ success: true });
        break;

      case "checkLoginStatus":
        try {
          const cookie = await chrome.cookies.get({
            url: `${backendApiUrl}`,
            name: "token",
          });
          if (!cookie?.value) {
            await ExtensionStorage.clearUserInfo();
            sendResponse({ success: true, data: null });
            break;
          }
          const cachedUserInfo = await ExtensionStorage.getUserInfo();
          if (cachedUserInfo?.islogin) {
            sendResponse({ success: true, data: cachedUserInfo });
            break;
          }
          const response = await fetch(`${backendApiUrl}/user`, {
            headers: {
              Authorization: `Bearer ${cookie.value}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            console.log("userData", userData);
            if (userData?.code === 200) {
              userInfo = {
                islogin: true,
                username: userData?.data?.user?.username ?? "",
                avatar: userData?.data?.user?.avatar ?? "",
              };
              console.log("userInfo", userInfo);
              await ExtensionStorage.saveUserInfo(userInfo);
              sendResponse({ success: true, data: userInfo });
            } else {
              sendResponse({ success: true, data: null });
            }
          } else {
            sendResponse({ success: true, data: null });
          }
        } catch (error) {
          console.error("获取用户信息失败:", error);
          sendResponse({ success: true, data: null });
        }
        break;

      default:
        sendResponse({
          success: false,
          action: message.action,
          data: message.data,
          error: "未知的操作类型",
        });
    }
  } catch (error) {
    // console.error("Background script error:", error);
    sendResponse({
      success: false,
      action: message.action,
      data: message.data,
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
}
