/// <reference types="vite/client" />

interface Window {
    api: {
        minimize: () => void;
        close: () => void;
        checkUpdate: () => Promise<{
            available: boolean;
            localVersion: string;
            remoteVersion: string;
            news?: string;
            error?: string;
        }>;
        startUpdate: () => Promise<{ success: boolean; error?: string }>;
        getConfig: () => Promise<{ gamePath: string; version: string }>;
        selectFolder: () => Promise<string | null>;
        onProgress: (callback: (data: { status: string; percent: number }) => void) => void;
        removeProgressListeners: () => void;
    };
}
