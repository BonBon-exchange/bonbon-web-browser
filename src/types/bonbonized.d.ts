// src/types/electron-extensions.d.ts
import ElectronistBrowserWindow from "./_electronist"

export interface BrowserWindowType extends ElectronistBrowserWindow {
    setInStore: (key: string, value: any) => void
    getFromStore: (key: string, value: any) => any
}