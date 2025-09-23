import { useState, useRef, useMemo } from 'react';
import { Character, tiers, TierCustomization, TierAssignment, TierListData } from '../data/types';
import { characters } from '../data/characters';
import TierGrid from './TierGrid';
import TierCustomizationDialog from './TierCustomizationDialog';
import ResetConfirmDialog from './ResetConfirmDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeaponVisibility } from '../contexts/WeaponVisibilityContext';

const TierList = () => {
  const [tierAssignments, setTierAssignments] = useState<TierAssignment>({});
  const [tierCustomization, setTierCustomization] = useState<TierCustomization>({});
  const [customTitle, setCustomTitle] = useState<string>('');
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const { showWeapons, setShowWeapons } = useWeaponVisibility();

  // Filter out hidden tiers from allTiers
  const allTiers = useMemo(() => {
    return [...tiers, 'Pool'].filter(tier => !tierCustomization[tier]?.hidden);
  }, [tierCustomization]);

  const createCharactersPerTierMap = (): { [tier: string]: Character[] } => {
    const charactersPerTier: { [tier: string]: Character[] } = {};

    // Initialize all visible tiers with empty arrays
    allTiers.forEach(tier => {
      charactersPerTier[tier] = [];
    });

    // Process all characters once and group them by tier
    characters.forEach(character => {
      const assignment = tierAssignments[character.name];
      if (assignment) {
        // Character is assigned to a tier - only add if tier is visible
        if (!tierCustomization[assignment.tier]?.hidden) {
          charactersPerTier[assignment.tier].push(character);
        } else {
          // If tier is hidden, move character back to pool
          charactersPerTier['Pool'].push(character);
        }
      } else {
        // Character is in the pool
        charactersPerTier['Pool'].push(character);
      }
    });

    // Sort characters within each tier by position
    allTiers.forEach(tier => {
      charactersPerTier[tier].sort((a, b) => {
        const assignmentA = tierAssignments[a.name];
        const assignmentB = tierAssignments[b.name];
        const posA = assignmentA?.position ?? 0;
        const posB = assignmentB?.position ?? 0;
        return posA - posB;
      });
    });

    return charactersPerTier;
  };

  const charactersPerTier = useMemo(() => createCharactersPerTierMap(), [tierAssignments, tierCustomization, allTiers]);

  const handleTierAssignment = (dragName: string, dropName: string | null, tier: string, direction: 'left' | 'right') => {
    setTierAssignments(prev => {
      const newAssignments = { ...prev };
      const draggedChar = characters.find(c => c.name === dragName);
      if (!draggedChar) return prev;

      const oldAssignment = prev[dragName];
      const isSameTier = oldAssignment?.tier === tier;

      // Get all characters in the same element and tier, sorted by position
      const elementChars = Object.entries(prev)
        .filter(([id, assignment]: [string, { tier: string; position: number }]) => {
          const char = characters.find(c => c.name === id);
          return char?.element === draggedChar.element &&
            assignment.tier === tier;
        })
        .map(([name, assignment]: [string, { tier: string; position: number }]) => ({
          name,
          position: assignment.position
        }))
        .sort((a, b) => a.position - b.position);

      // If no drop target, append to the end
      if (!dropName) {
        const newPosition = direction === 'left' ? 0
          : elementChars.length > 0 ? Math.max(...elementChars.map(c => c.position)) + 1
            : 0;
        newAssignments[dragName] = { tier, position: newPosition };

        // If inserting at the beginning, shift all other cards right
        if (direction === 'left') {
          elementChars.forEach(card => {
            newAssignments[card.name] = { tier, position: card.position + 1 };
          });
        }
        return newAssignments;
      }

      // Find the drop target's current position
      const dropTargetIndex = elementChars.findIndex(card => card.name === dropName);
      if (dropTargetIndex === -1) return prev;

      // Calculate the new position based on direction
      const newPosition = direction === 'left'
        ? elementChars[dropTargetIndex].position
        : elementChars[dropTargetIndex].position + 1;

      // If moving within the same tier, remove the dragged card first
      if (isSameTier) {
        const oldPosition = oldAssignment?.position ?? 0;
        elementChars.forEach(card => {
          if (card.position > oldPosition) {
            newAssignments[card.name] = { tier, position: card.position - 1 };
          }
        });
      }

      // Shift positions of affected cards
      elementChars.forEach(card => {
        if (card.position >= newPosition) {
          newAssignments[card.name] = { tier, position: card.position + 1 };
        }
      });

      // Set the dragged card's new position
      newAssignments[dragName] = { tier, position: newPosition };

      return newAssignments;
    });
  };

  const handleRemoveFromTiers = (dragName: string) => {
    setTierAssignments(prev => {
      const newAssignments = { ...prev };
      const oldAssignment = prev[dragName];
      const character = characters.find(c => c.name === dragName);
      if (!character) return prev;

      if (oldAssignment) {
        // Get all characters in the same tier and element, sorted by position
        const elementChars = Object.entries(prev)
          .filter(([name, assignment]: [string, { tier: string; position: number }]) => {
            const char = characters.find(c => c.name === name);
            return char?.element === character.element &&
              assignment.tier === oldAssignment.tier;
          })
          .map(([name, assignment]: [string, { tier: string; position: number }]) => ({
            name,
            position: assignment.position
          }))
          .sort((a, b) => a.position - b.position);

        // Remove the dragged card
        delete newAssignments[character.name];
        // toast.info(`${character.name} removed from tier list`);

        // Reassign positions sequentially
        elementChars.forEach((card, index) => {
          if (card.name !== character.name) {
            newAssignments[card.name] = {
              tier: oldAssignment.tier,
              position: index
            };
          }
        });
      }

      return newAssignments;
    });
  };

  const resetTierList = () => {
    setTierAssignments({});
    toast.info(t.messages.tierListReset);
  };

  const handleResetConfirm = () => {
    resetTierList();
    setIsResetConfirmOpen(false);
  };

  const handleTierCustomizationSave = (customization: TierCustomization, customTitle?: string) => {
    // Remove characters from hidden tiers
    const newAssignments = { ...tierAssignments };
    const hiddenTiers = Object.keys(customization).filter(tier => customization[tier]?.hidden);

    hiddenTiers.forEach(tier => {
      Object.keys(newAssignments).forEach(characterName => {
        if (newAssignments[characterName].tier === tier) {
          delete newAssignments[characterName];
        }
      });
    });

    setTierAssignments(newAssignments);
    setTierCustomization(customization);
    if (customTitle !== undefined) {
      setCustomTitle(customTitle);
    }

    toast.success(t.messages.customizationsSaved);
  };

  const saveTierList = (data: TierListData): void => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `genshin-tier-list-${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast.success(t.messages.tierListSaved);
    } catch (error) {
      console.error('Error saving tier list:', error);
      toast.error(t.messages.tierListSaveFailed);
    }
  };

  const loadTierList = (file: File): Promise<TierListData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData = JSON.parse(content) as TierListData;

          toast.success(t.messages.tierListLoaded);
          resolve(parsedData);
        } catch (error) {
          console.error('Error loading tier list:', error);
          toast.error(t.messages.tierListLoadFailed);
          reject(error);
        }
      };

      reader.onerror = () => {
        toast.error(t.messages.fileReadError);
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  };

  const handleSaveTierList = () => {
    const data: TierListData = {
      tierAssignments,
      tierCustomization,
      customTitle: customTitle || undefined,
      language
    };
    saveTierList(data);
  };

  const handleLoadTierList = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const loadedData = await loadTierList(file);
      setTierAssignments(loadedData.tierAssignments);
      setTierCustomization(loadedData.tierCustomization);
      setCustomTitle(loadedData.customTitle || '');
      // Update language if it was different in the loaded file
      if (loadedData.language !== language) {
        setLanguage(loadedData.language);
      }
    } catch (error) {
      // Error already handled in loadTierList function
    }

    // Reset the input so the same file can be loaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const { hoveredCardName, hoverDirection, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useDragAndDrop({
    onTierAssignment: handleTierAssignment,
    onRemoveFromTiers: handleRemoveFromTiers,
  });

  return (
    <div className="flex flex-col w-full min-w-[800px] max-w-[99vw] mx-auto px-16 py-8 max-h-[99vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-200">{customTitle || t.title}</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              <span className="flex items-center gap-1">
                <span className={language === 'zh' ? 'font-bold text-white' : 'text-gray-400'}>
                  中
                </span>
                <span className="text-gray-500">/</span>
                <span className={language === 'en' ? 'font-bold text-white' : 'text-gray-400'}>
                  EN
                </span>
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWeapons(!showWeapons)}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              {showWeapons ? t.buttons.hideWeapons : t.buttons.showWeapons}
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={() => setIsCustomizeDialogOpen(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-md"
          >
            {t.buttons.customize}
          </Button>
          <Button
            variant="default"
            onClick={handleSaveTierList}
            className="bg-emerald-600 hover:bg-emerald-700 text-md"
          >
            {t.buttons.save}
          </Button>
          <Button
            variant="default"
            onClick={handleLoadTierList}
            className="bg-blue-600 hover:bg-blue-700 text-md"
          >
            {t.buttons.load}
          </Button>
          <Button
            variant="default"
            onClick={() => setIsResetConfirmOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-md"
          >
            {t.buttons.reset}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>
      
      <TierGrid
        allTiers={allTiers}
        charactersPerTier={charactersPerTier}
        tierCustomization={tierCustomization}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        onRemoveFromTiers={handleRemoveFromTiers}
        hoveredCardName={hoveredCardName}
        hoverDirection={hoverDirection}
      />

      <TierCustomizationDialog
        isOpen={isCustomizeDialogOpen}
        onClose={() => setIsCustomizeDialogOpen(false)}
        onSave={handleTierCustomizationSave}
        initialCustomization={tierCustomization}
        initialCustomTitle={customTitle}
      />

      <ResetConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetConfirm}
      />
    </div>
  );
};

export default TierList;
