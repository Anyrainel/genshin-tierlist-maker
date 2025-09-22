import { toast } from 'sonner';
import { translations } from './translations';

export interface TierAssignment {
    [characterName: string]: {
        tier: string;
        position: number;
    };
}

export const saveTierList = (tierAssignments: TierAssignment, language: 'en' | 'zh' = 'en'): void => {
    try {
        const dataStr = JSON.stringify(tierAssignments, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `genshin-tier-list-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        toast.success(translations[language].messages.tierListSaved);
    } catch (error) {
        console.error('Error saving tier list:', error);
        toast.error(translations[language].messages.tierListSaveFailed);
    }
};

export const loadTierList = (file: File, language: 'en' | 'zh' = 'en'): Promise<TierAssignment> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const loadedAssignments = JSON.parse(content) as TierAssignment;
                toast.success(translations[language].messages.tierListLoaded);
                resolve(loadedAssignments);
            } catch (error) {
                console.error('Error loading tier list:', error);
                toast.error(translations[language].messages.tierListLoadFailed);
                reject(error);
            }
        };

        reader.onerror = () => {
            toast.error(translations[language].messages.fileReadError);
            reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
    });
}; 