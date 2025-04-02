import { toast } from 'sonner';

export interface TierAssignment {
    [characterId: string]: {
        tier: string;
        position: number;
    };
}

export const saveTierList = (tierAssignments: TierAssignment): void => {
    try {
        const dataStr = JSON.stringify(tierAssignments, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `genshin-tier-list-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        toast.success('Tier list saved successfully');
    } catch (error) {
        console.error('Error saving tier list:', error);
        toast.error('Failed to save tier list');
    }
};

export const loadTierList = (file: File): Promise<TierAssignment> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const loadedAssignments = JSON.parse(content) as TierAssignment;
                toast.success('Tier list loaded successfully');
                resolve(loadedAssignments);
            } catch (error) {
                console.error('Error loading tier list:', error);
                toast.error('Failed to load tier list');
                reject(error);
            }
        };

        reader.onerror = () => {
            toast.error('Error reading file');
            reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
    });
}; 