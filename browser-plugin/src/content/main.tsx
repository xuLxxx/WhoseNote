import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PopoverApp as ShadowDOMApp } from "./popover/App";
import shadowDOMStyle from "./popover/app.css?raw";
// import radixPrimitivesStyle from './popover/radix-primitives.css?raw'

// 创建一个 shadow root 容器
const container = document.createElement("div");
container.id = "whose-note-draggablepopover-animation";
container.style.all = "initial";
container.style.position = "fixed";
container.style.top = "0";
container.style.left = "0";
container.style.zIndex = "2147483637";
const shadowRoot = container.attachShadow({ mode: "open" });
const shadowDOMStyleSheet = new CSSStyleSheet();
// const radixPrimitivesStyleSheet = new CSSStyleSheet();

// radixPrimitivesStyleSheet.replace(radixPrimitivesStyle); // 使用 replace 方法加载 CSS 文本
shadowDOMStyleSheet.replace(shadowDOMStyle); // 使用 replace 方法加载 CSS 文本
shadowRoot.adoptedStyleSheets = [shadowDOMStyleSheet];

document.documentElement.appendChild(container);

createRoot(shadowRoot).render(
  <StrictMode>
    <ShadowDOMApp />
  </StrictMode>,
);
