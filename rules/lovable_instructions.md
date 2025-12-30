# Lovable.ai / Frontend Developer Instructions

**Project:** Vintage Story - Modpack Updater
**Context:** Electron Application (Backend is ready). You are building the **Renderer (Frontend)**.

## 🔌 API Contract (window.api)

The backend exposes a secure API via `window.api`. use these methods to interact with the system.

### 1. Window Controls
- **Minimize Window:** `window.api.minimize()`
- **Close App:** `window.api.close()`

### 2. Core Actions

#### Check for Updates
Call this on app mount.
```javascript
const result = await window.api.checkUpdate();
```
**Response Object:**
```typescript
{
  available: boolean;      // True if update is needed
  localVersion: string;    // e.g., "1.0.0"
  remoteVersion: string;   // e.g., "1.0.1"
  news: string;            // Release notes text
  error?: string;          // If present, something went wrong
}
```

#### Start Update
Call this when user clicks "UPDATE" or "REPAIR".
```javascript
const result = await window.api.startUpdate();
```
**Response Object:**
```typescript
{
  success: boolean;
  error?: string; // Failure reason (e.g., "Game is running")
}
```
**Important:** This process is asynchronous. You must listen to `onProgress` to show status.

#### Configuration
```javascript
// Get current settings
const config = await window.api.getConfig(); 
// Returns: { gamePath: string, version: string }

// Open Folder Dialog to change path
const newPath = await window.api.selectFolder();
// Returns: string (new path) or null (cancelled)
```

### 3. Events (Listeners)

#### Progress Stream
Listen to this during `startUpdate()`.
```javascript
window.api.onProgress((data) => {
  console.log(data.status);  // string: "Downloading... 15MB"
  console.log(data.percent); // number: 0-100
});
```

---

## 🎨 Design System (Liquid Glass)

**Theme:** "Riot Games Launcher" vibe. Dark, Premium, Hextech/Fantasy touches.

- **Background:** Dark Grey/Black with heavy transparency (Glassmorphism). *Note: The Electron window has transparency disabled for stability, so simulate glass with CSS/Images.*
- **Colors:**
  - **Primary:** `#1a1a1a` (Background)
  - **Accent:** `#cfb53b` (Gold/Amber - TarValon Theme)
  - **Text:** `#ffffff` (Headers), `#aaaaaa` (Status)
- **Typography:** Sans-serif, clean, uppercase headers.

## 🔄 User Flow (State Machine)

1.  **State: INITIALIZING**
    -   Action: Call `checkUpdate()`.
    -   UI: Loading Spinner.

2.  **State: UPDATE_AVAILABLE**
    -   Condition: `result.available === true`
    -   UI: Show "New Version Available". Display `result.news`.
    -   Action Button: "UPDATE" (Triggers `startUpdate`).

3.  **State: UP_TO_DATE**
    -   Condition: `result.available === false`
    -   UI: Show "Version: X.X.X".
    -   Action Button: "REPAIR" (Force update/Triggers `startUpdate`).

4.  **State: UPDATING**
    -   UI: **Disable** Action Button. Show **Progress Bar** and **Status Text**.
    -   Data: Update UI based on `onProgress` event.

5.  **State: ERROR**
    -   UI: Show Error alert/text.
    -   Action Button: "RETRY".

6.  **State: GAME_RUNNING_ERROR**
    -   If `startUpdate` returns error "Game is running".
    -   UI: Alert user to close Vintage Story.

## 🛠️ Technical Stack for Frontend
-   React, Vue, or Vanilla JS (Your choice).
-   Vite (Already configured).
-   **Important:** Use relative paths (`./`) for assets.
