import { writeTextFile, readTextFile, exists, createDir } from '@tauri-apps/api/fs';
import { appDataDir, join } from '@tauri-apps/api/path';

export interface AppData {
  language: string;
  showWeapons: boolean;
  tierLists: Record<string, any>;
  lastUpdated: string;
}

class DataManager {
  private dataDir: string | null = null;
  private dataFile: string | null = null;
  private isTauri = false;

  async initialize(): Promise<void> {
    try {
      // Check if we're running in Tauri
      this.isTauri = typeof window !== 'undefined' && window.__TAURI__;
      
      if (this.isTauri) {
        // Get the app data directory (deterministic user directory)
        this.dataDir = await appDataDir();
        this.dataFile = await join(this.dataDir, 'genshin-tierlist-maker', 'app-data.json');
        
        // Ensure data directory exists
        const dataDirPath = await join(this.dataDir, 'genshin-tierlist-maker');
        if (!(await exists(dataDirPath))) {
          await createDir(dataDirPath, { recursive: true });
        }

        // Migrate from localStorage if needed
        await this.migrateFromLocalStorage();
      }
    } catch (error) {
      console.error('Failed to initialize data manager:', error);
      // Fallback to localStorage if file system fails
    }
  }

  private async migrateFromLocalStorage(): Promise<void> {
    try {
      // Check if we already have file-based data
      if (this.dataFile && await exists(this.dataFile)) {
        return; // Already migrated
      }

      // Check if we have localStorage data to migrate
      const language = localStorage.getItem('tierlist-language');
      const showWeapons = localStorage.getItem('tierlist-show-weapons');
      
      if (language || showWeapons) {
        const appData: AppData = {
          language: language || 'en',
          showWeapons: showWeapons !== 'false',
          tierLists: {},
          lastUpdated: new Date().toISOString()
        };

        await this.saveData(appData);
        
        // Clear localStorage after successful migration
        localStorage.removeItem('tierlist-language');
        localStorage.removeItem('tierlist-show-weapons');
        
        console.log('Successfully migrated data from localStorage to file system');
      }
    } catch (error) {
      console.error('Failed to migrate from localStorage:', error);
    }
  }

  async saveData(data: AppData): Promise<void> {
    try {
      if (this.isTauri && this.dataFile) {
        data.lastUpdated = new Date().toISOString();
        await writeTextFile(this.dataFile, JSON.stringify(data, null, 2));
      } else {
        // Fallback to localStorage
        localStorage.setItem('tierlist-language', data.language);
        localStorage.setItem('tierlist-show-weapons', data.showWeapons.toString());
      }
    } catch (error) {
      console.error('Failed to save data:', error);
      // Fallback to localStorage
      localStorage.setItem('tierlist-language', data.language);
      localStorage.setItem('tierlist-show-weapons', data.showWeapons.toString());
    }
  }

  async loadData(): Promise<AppData> {
    try {
      if (this.isTauri && this.dataFile && await exists(this.dataFile)) {
        const content = await readTextFile(this.dataFile);
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Failed to load data from file:', error);
    }

    // Fallback to localStorage
    return {
      language: localStorage.getItem('tierlist-language') || 'en',
      showWeapons: localStorage.getItem('tierlist-show-weapons') !== 'false',
      tierLists: {},
      lastUpdated: new Date().toISOString()
    };
  }

  async saveTierList(name: string, data: any): Promise<void> {
    const appData = await this.loadData();
    appData.tierLists[name] = {
      ...data,
      savedAt: new Date().toISOString()
    };
    await this.saveData(appData);
  }

  async loadTierList(name: string): Promise<any> {
    const appData = await this.loadData();
    return appData.tierLists[name] || null;
  }

  async getAllTierLists(): Promise<Record<string, any>> {
    const appData = await this.loadData();
    return appData.tierLists;
  }

  async deleteTierList(name: string): Promise<void> {
    const appData = await this.loadData();
    delete appData.tierLists[name];
    await this.saveData(appData);
  }

  async exportData(): Promise<string> {
    const appData = await this.loadData();
    return JSON.stringify(appData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const importedData = JSON.parse(jsonData) as AppData;
      await this.saveData(importedData);
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }

  async getDataDirectory(): Promise<string> {
    return this.dataDir || '';
  }

  isFileSystemAvailable(): boolean {
    return this.isTauri;
  }
}

export const dataManager = new DataManager();
