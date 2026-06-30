import type {
  ExtensionMessage,
  ExtensionResponse,
  PageInfo,
} from "../types/chrome";
// 全局状态
let isInjected = false;

// 初始化内容脚本
function init() {
  console.log("Content script 已加载");
  injectStyles();
  setupMessageListener();
}

// 注入样式
function injectStyles() {
  if (isInjected) return;

  const style = document.createElement("style");
  style.id = "react-extension-styles";
  style.textContent = `
    .react-extension-highlight {
      background-color: var(--highlight-color, #ffff00) !important;
      transition: background-color 0.3s ease;
      outline: 2px solid var(--highlight-color, #ffff00);
      outline-offset: 2px;
    }
    
    .react-extension-dark {
      filter: invert(1) hue-rotate(180deg);
    }
  `;

  document.head.appendChild(style);
  isInjected = true;
}

// 高亮元素
function highlightElements(selector: string, color?: string): number {
  const elements = document.querySelectorAll(selector);
  const root = document.documentElement;

  if (color) {
    root.style.setProperty("--highlight-color", color);
  }

  elements.forEach((el) => {
    el.classList.add("react-extension-highlight");
  });

  return elements.length;
}

// 移除高亮
function removeHighlight(): void {
  const elements = document.querySelectorAll(".react-extension-highlight");
  elements.forEach((el) => {
    el.classList.remove("react-extension-highlight");
  });
}

// 获取页面信息
function getPageInfo(): PageInfo {
  return {
    title: document.title,
    url: window.location.href,
    elementCount: document.querySelectorAll("*").length,
    linkCount: document.querySelectorAll("a").length,
  };
}

// 获取页面内容（用于摘要）
function getPageContent(): string {
  const selectors = [
    "article",
    "main",
    "[role='main']",
    ".article-content",
    ".post-content",
    ".entry-content",
    ".content",
    ".body-content",
    "#content",
    ".story-body",
    ".article-body",
    ".news-content",
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return (element as HTMLElement).innerText.trim();
    }
  }

  const bodyText = document.body.innerText;
  const textLength = bodyText.length;
  if (textLength > 5000) {
    return bodyText.substring(0, 5000) + "...";
  }
  return bodyText.trim();
}

// 获取选中内容
function getSelection(): string {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    return selection.toString().trim();
  }
  return "";
}

// 切换暗色模式
function toggleDarkMode(enabled: boolean): void {
  if (enabled) {
    document.documentElement.classList.add("react-extension-dark");
  } else {
    document.documentElement.classList.remove("react-extension-dark");
  }
}

function handleMessage(
  message: ExtensionMessage,
  sendResponse: (response: ExtensionResponse) => void,
): boolean {
  try {
    switch (message.action) {
      case "highlight":
        const count = highlightElements(
          message.data.selector,
          message.data.color,
        );
        sendResponse({ success: true, data: { count } });
        return true;

      case "removeHighlight":
        removeHighlight();
        sendResponse({ success: true });
        return true;

      case "getPageInfo":
        const pageInfo = getPageInfo();
        sendResponse({ success: true, data: pageInfo });
        return true;

      case "toggleDarkMode":
        toggleDarkMode(message.data.enabled);
        sendResponse({ success: true });
        return true;

      case "getPageContent":
        const pageContent = getPageContent();
        sendResponse({ success: true, data: pageContent });
        return true;

      case "getSelection":
        const selectionText = getSelection();
        sendResponse({ success: true, data: selectionText });
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error("Content script error:", error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    });
    return true;
  }
}

function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender, sendResponse) => {
      return handleMessage(message, sendResponse);
    },
  );
}

// 页面卸载时清理资源
function cleanup(): void {
  // 移除注入的样式
  const injectedStyle = document.getElementById("react-extension-styles");
  if (injectedStyle) {
    injectedStyle.remove();
  }

  // 移除所有高亮
  removeHighlight();

  // 移除暗色模式
  document.documentElement.classList.remove("react-extension-dark");

  isInjected = false;
}

// 监听页面卸载事件
window.addEventListener("beforeunload", cleanup);

// 初始化内容脚本
init();
