import path from 'path';
import fs from 'fs-extra';
import { app } from 'electron';

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

// Default path for Vintage Story mods
const DEFAULT_CONFIG = {
    // Usually %appdata%/VintagestoryData/Mods
    gamePath: path.join(app.getPath('appData'), 'VintagestoryData', 'Mods'),
    version: '0.0.0'
};

export async function loadConfig() {
    try {
        await fs.ensureFile(CONFIG_PATH);
        const current = await fs.readJson(CONFIG_PATH).catch(() => ({}));
        return { ...DEFAULT_CONFIG, ...current };
    } catch (e) {
        return DEFAULT_CONFIG;
    }
}

export async function saveConfig(newConfig) {
    const current = await loadConfig();
    await fs.writeJson(CONFIG_PATH, { ...current, ...newConfig }, { spaces: 2 });
}
