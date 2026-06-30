// 扩展 Chrome API 类型定义
declare namespace chrome {
  namespace storage {
    interface StorageArea {
      get(keys?: string | string[] | null): Promise<any>;
      set(items: { [key: string]: any }): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    }
  }
}

declare global {
  interface Window {
    Summarizer?: {
      availability: () => Promise<"available" | "downloadable" | "unavailable">;
      create: (options?: {
        type?: "key-points" | "tldr" | "teaser" | "headline";
        format?: "markdown" | "plain-text";
        length?: "short" | "medium" | "long";
        monitor?: (manager: any) => void;
      }) => Promise<any>;
    };
  }
}

// 消息类型定义
export interface ExtensionMessage {
  action: string;
  data?: any;
}

export interface ExtensionResponse {
  success: boolean;
  action?: string;
  data?: any;
  error?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface ExtensionSettings {
  enabled: boolean;
  theme: "light" | "dark";
  fontSize: number;
  highlightColor: string;
  position: Position;
  adsorption: "left" | "right";
}

export interface PageInfo {
  title: string;
  url: string;
  elementCount: number;
  linkCount: number;
}
