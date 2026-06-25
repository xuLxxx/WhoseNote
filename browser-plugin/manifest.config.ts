import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
    manifest_version: 3,
    name: pkg.name,
    version: pkg.version,
    icons: {
        16: 'public/icons/icon16.png',
        32: 'public/icons/icon32.png',
        48: 'public/icons/icon48.png',
        128: 'public/icons/icon128.png',
    },
    background: {
        service_worker: 'src/background/index.ts',
        type: 'module',
    },
    action: {
        default_icon: {
            16: 'public/icons/icon16.png',
            32: 'public/icons/icon32.png',
            48: 'public/icons/icon48.png',
            128: 'public/icons/icon128.png',
        },
        default_popup: 'src/popup/index.html',
    },
    options_ui: {
        page: 'src/options/index.html',
    },
    content_scripts: [{
        js: ['src/content/main.tsx', 'src/content/index.ts'],
        matches: ['https://*/*'],
    }],
    permissions: [
        'sidePanel',
        'tabs',
        'storage',
        'contentSettings',
    ],
    side_panel: {
        default_path: 'src/sidepanel/index.html',
    },
})

