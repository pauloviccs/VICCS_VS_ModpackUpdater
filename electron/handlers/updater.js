import { ipcMain, app, shell, dialog } from 'electron';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import extract from 'extract-zip';
import { exec } from 'child_process';
import { loadConfig, saveConfig } from '../config';

// ⚠️ CUSTOM MANIFEST URL (GitHub Raw)
const MANIFEST_URL = 'https://pastebin.com/raw/anmQgXXs';

function isGameRunning() {
    return new Promise((resolve) => {
        exec('tasklist', (err, stdout) => {
            if (err) return resolve(false);
            resolve(stdout.toLowerCase().includes('vintagestory.exe'));
        });
    });
}

export async function setupHandlers() {
    // Check for updates
    ipcMain.handle('check-update', async () => {
        const config = await loadConfig();
        try {
            console.log('Checking update from:', MANIFEST_URL);
            const { data: remote } = await axios.get(MANIFEST_URL, { timeout: 5000 });

            // Basic semantic version check or string comparison
            const updateAvailable = remote.version !== config.version;

            return {
                available: updateAvailable,
                localVersion: config.version,
                remoteVersion: remote.version,
                news: remote.news || 'Sem notas de atualização.'
            };
        } catch (e) {
            console.error('Update check failed:', e.message);
            // Specific 404 handling
            if (e.response && e.response.status === 404) {
                return { error: 'Manifesto não encontrado (404). Verifique se o arquivo existe no GitHub.' };
            }
            // Return remote version as null to indicate error
            return { error: `Erro ao verificar atualizações: ${e.message}` };
        }
    });

    // Start Update Process
    ipcMain.handle('start-update', async (event) => {
        const config = await loadConfig();
        const modsPath = config.gamePath;

        // 0. Safety Check
        if (await isGameRunning()) {
            return { success: false, error: 'O jogo está aberto! Feche o Vintage Story antes de atualizar.' };
        }

        console.log('Starting update on:', modsPath);

        // 1. Get Manifest info again to be sure
        event.sender.send('update-progress', { status: 'Verificando versão...', percent: 5 });
        let remote;
        try {
            const res = await axios.get(MANIFEST_URL);
            remote = res.data;
        } catch (e) {
            return { success: false, error: 'Erro ao baixar manifesto.' };
        }

        if (!remote.downloadUrl) {
            return { success: false, error: 'URL de download não encontrada no manifesto.' };
        }

        // 2. Wipe Mods Folder
        event.sender.send('update-progress', { status: 'Limpando instalação antiga...', percent: 10 });
        try {
            // Ensure dir exists before trying to empty it, or just empty it
            await fs.ensureDir(modsPath);
            await fs.emptyDir(modsPath);
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Erro ao limpar pasta. Feche o jogo e tente novamente.' };
        }

        // 3. Download
        event.sender.send('update-progress', { status: 'Baixando Mods (Isso pode demorar)...', percent: 15 });
        const tempPath = path.join(app.getPath('temp'), 'vs_update.zip');

        try {
            const writer = fs.createWriteStream(tempPath);
            const response = await axios({
                url: remote.downloadUrl,
                method: 'GET',
                responseType: 'stream'
            });

            // Check if we got a ZIP or HTML (expired link)
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('text/html')) {
                throw new Error('O link de download retornou uma página HTML (possivelmente expirado/inválido). Use um link direto real.');
            }

            const totalLength = parseInt(response.headers['content-length'], 10);
            let downloaded = 0;

            response.data.on('data', (chunk) => {
                downloaded += chunk.length;
                if (totalLength) {
                    const progress = 15 + ((downloaded / totalLength) * 60); // 15% to 75%
                    event.sender.send('update-progress', {
                        status: `Baixando... ${Math.round((downloaded / 1024 / 1024) * 10) / 10} MB`,
                        percent: Math.round(progress)
                    });
                }
            });

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Erro no download. Verifique sua conexão.' };
        }

        // 4. Extract
        event.sender.send('update-progress', { status: 'Instalando novos mods...', percent: 80 });
        try {
            await extract(tempPath, { dir: modsPath });
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Erro ao extrair arquivos. Arquivo corrompido?' };
        }

        // 5. Cleanup & Save
        event.sender.send('update-progress', { status: 'Finalizando...', percent: 95 });
        await fs.remove(tempPath);
        await saveConfig({ version: remote.version });

        event.sender.send('update-progress', { status: 'Pronto para jogar!', percent: 100 });

        return { success: true };
    });

    // Config Handlers
    ipcMain.handle('get-config', loadConfig);
    ipcMain.handle('select-folder', async () => {
        const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
        if (!result.canceled && result.filePaths.length > 0) {
            const newPath = result.filePaths[0];
            await saveConfig({ gamePath: newPath });
            return newPath;
        }
        return null;
    });
}
