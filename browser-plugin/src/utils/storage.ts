import type { ExtensionSettings, Position } from '../types/chrome';

export class ExtensionStorage {
    static async getSettings(): Promise<ExtensionSettings> {
        const result = await chrome.storage.local.get(['settings']);
        const settings = result.settings as Partial<ExtensionSettings> | undefined;
        return {
            enabled: true,
            theme: 'light',
            fontSize: 14,
            highlightColor: '#ffff00',
            position: { x: 0, y: 100 },
            adsorption: 'left',
            ...settings
        };
    }

    static async getPosition(): Promise<Position> {
        const settings = await this.getSettings();
        return settings.position;
    }

    static async savePosition(position: Position): Promise<void> {
        await this.saveSettings({ position });
    }

    static async getAdsorption(): Promise<'left' | 'right'> {
        const settings = await this.getSettings();
        return settings.adsorption;
    }

    static async saveAdsorption(adsorption: 'left' | 'right'): Promise<void> {
        await this.saveSettings({ adsorption });
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
