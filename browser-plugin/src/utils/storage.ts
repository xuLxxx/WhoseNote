import type { ExtensionSettings } from '../types/chrome';

export class ExtensionStorage {
    // 获取设置
    static async getSettings(): Promise<ExtensionSettings> {
        const result = await chrome.storage.local.get(['settings']);
        const settings = result.settings as ExtensionSettings | undefined;
        if (settings) {
            return settings;
        }
        return {
            enabled: true,
            theme: 'light',
            fontSize: 14,
            highlightColor: '#ffff00'
        };
    }

    // 保存设置
    static async saveSettings(settings: Partial<ExtensionSettings>): Promise<void> {
        const currentSettings = await this.getSettings();
        const newSettings = { ...currentSettings, ...settings };
        await chrome.storage.local.set({ settings: newSettings });
    }

    // 获取启用状态
    static async getEnabled(): Promise<boolean> {
        const settings = await this.getSettings();
        return settings.enabled;
    }

    // 设置启用状态
    static async setEnabled(enabled: boolean): Promise<void> {
        await this.saveSettings({ enabled });
    }
}
