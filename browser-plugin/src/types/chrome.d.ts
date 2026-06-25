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

// 消息类型定义
export interface ExtensionMessage {
    action: string;
    data?: any;
}

export interface ExtensionResponse {
    success: boolean;
    data?: any;
    error?: string;
}

// 存储数据类型
export interface ExtensionSettings {
    enabled: boolean;
    theme: 'light' | 'dark';
    fontSize: number;
    highlightColor: string;
}

export interface PageInfo {
    title: string;
    url: string;
    elementCount: number;
    linkCount: number;
}
