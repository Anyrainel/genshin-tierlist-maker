import { useState, useRef, useMemo, useEffect } from 'react';
import { Character, tiers, TierCustomization, TierListData } from '../data/types';
import { characters } from '../data/characters';
import TierGrid from './TierGrid';
import TierCustomizationDialog from './TierCustomizationDialog';
import ResetConfirmDialog from './ResetConfirmDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeaponVisibility } from '../contexts/WeaponVisibilityContext';
import { useTierListStore } from '../stores/useTierListStore';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import CharacterCardPreview from './CharacterCardPreview';

const TierList = () => {
  // Use Zustand store for persisted state
  const tierAssignments = useTierListStore((state) => state.tierAssignments);
  const tierCustomization = useTierListStore((state) => state.tierCustomization);
  const customTitle = useTierListStore((state) => state.customTitle);
  const setTierAssignments = useTierListStore((state) => state.setTierAssignments);
  const setTierCustomization = useTierListStore((state) => state.setTierCustomization);
  const setCustomTitle = useTierListStore((state) => state.setCustomTitle);
  const resetStoredTierList = useTierListStore((state) => state.resetTierList);
  const loadTierListData = useTierListStore((state) => state.loadTierListData);

  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const { showWeapons, setShowWeapons } = useWeaponVisibility();
  const [showTravelers, setShowTravelers] = useState<boolean>(() => {
    // Try to get traveler visibility from localStorage, default to false (skip travelers)
    const savedVisibility = localStorage.getItem('tierlist-show-travelers');
    return savedVisibility === 'true';
  });
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  // Track cursor position during drag for left/right detection
  const cursorPositionRef = useRef<{ x: number; y: number } | null>(null);
  // Track hover state for visual preview
  const [hoveredCardName, setHoveredCardName] = useState<string | null>(null);
  const [hoverDirection, setHoverDirection] = useState<'left' | 'right' | null>(null);
  // Track previous assignments to detect changes
  const prevAssignmentsRef = useRef<TierAssignment>(tierAssignments);
  // Track if we should show auto-save toast (skip on initial load and manual load)
  const shouldShowAutoSaveRef = useRef(false);

  // Save traveler visibility to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tierlist-show-travelers', showTravelers.toString());
  }, [showTravelers]);

  // Show toast when tier assignments change (auto-save)
  useEffect(() => {
    // Skip on initial mount
    if (!shouldShowAutoSaveRef.current) {
      shouldShowAutoSaveRef.current = true;
      prevAssignmentsRef.current = tierAssignments;
      return;
    }

    const prev = prevAssignmentsRef.current;
    const curr = tierAssignments;

    // Find what changed
    const allKeys = new Set([...Object.keys(prev), ...Object.keys(curr)]);
    const changes: { charName: string; fromTier?: string; toTier?: string }[] = [];

    allKeys.forEach(charName => {
      const prevAssignment = prev[charName];
      const currAssignment = curr[charName];

      // Character was added or moved
      if (currAssignment && (!prevAssignment || prevAssignment.tier !== currAssignment.tier)) {
        changes.push({
          charName,
          fromTier: prevAssignment?.tier,
          toTier: currAssignment.tier,
        });
      }
      // Character was removed
      else if (prevAssignment && !currAssignment) {
        changes.push({
          charName,
          fromTier: prevAssignment.tier,
        });
      }
    });

    // Show toast for changes
    if (changes.length > 0) {
      const change = changes[0]; // Show first change if multiple
      const character = characters.find(c => c.name === change.charName);
      if (!character) return;

      // Get localized character name
      const localizedName = language === 'zh' ? character.nameZh : character.name;

      if (change.toTier) {
        // Character moved
        const tierLabel = change.toTier === 'Pool' ? t.tiers.Pool : change.toTier;
        toast.success(t.messages.characterMoved(localizedName, tierLabel), {
          duration: 2000,
        });
      } else {
        // Character removed
        toast.success(t.messages.characterRemoved(localizedName), {
          duration: 2000,
        });
      }
    }

    prevAssignmentsRef.current = tierAssignments;
  }, [tierAssignments, t, language]);

  // Configure dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
      if (character.name.startsWith("Traveler") && !showTravelers) {
        return;
      }
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

  const charactersPerTier = useMemo(() => createCharactersPerTierMap(), [tierAssignments, tierCustomization, allTiers, showTravelers]);

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
        let newPosition = 0;
        elementChars.forEach((card) => {
          if (card.name !== character.name) {
            newAssignments[card.name] = {
              tier: oldAssignment.tier,
              position: newPosition
            };
            newPosition++;
          }
        });
      }

      return newAssignments;
    });
  };

  const resetTierList = () => {
    // Temporarily disable auto-save toast for the reset operation
    shouldShowAutoSaveRef.current = false;
    resetStoredTierList();
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
      // Temporarily disable auto-save toast for the load operation
      shouldShowAutoSaveRef.current = false;
      loadTierListData({
        tierAssignments: loadedData.tierAssignments,
        tierCustomization: loadedData.tierCustomization,
        customTitle: loadedData.customTitle || '',
      });
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

  // dnd-kit drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const character = active.data.current?.character as Character;
    if (character) {
      setActiveCharacter(character);
    }
    cursorPositionRef.current = null; // Reset cursor position

    // Add window-level pointer move listener to track actual cursor position
    const handlePointerMove = (e: PointerEvent) => {
      cursorPositionRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', handlePointerMove);

    // Store cleanup function
    const cleanup = () => window.removeEventListener('pointermove', handlePointerMove);
    // Store cleanup in a way we can access it later
    (window as any).__dragCleanup = cleanup;
  };

  // Shared function to calculate drop direction based on cursor position
  const calculateDropDirection = (targetCharacterName: string, cursorX: number): 'left' | 'right' | null => {
    const targetCardElement = document.querySelector(`[data-character-id="${targetCharacterName}"]`);
    if (!targetCardElement) return null;

    const rect = targetCardElement.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;

    return cursorX < midX ? 'left' : 'right';
  };

  // Shared function to calculate drop target info (used by both shadow and actual drop)
  const calculateDropTarget = (
    overId: string,
    overData: any,
    draggedCharacter: Character
  ): { targetCharacter: Character | null; direction: 'left' | 'right' } | null => {
    if (!cursorPositionRef.current) return null;

    const idParts = overId.split('-');

    // Case 1: Hovering over a character card (3-part ID: "tier-element-characterName")
    if (idParts.length === 3) {
      const targetCharacter = overData?.character as Character;
      if (targetCharacter && draggedCharacter.element === targetCharacter.element) {
        const direction = calculateDropDirection(targetCharacter.name, cursorPositionRef.current.x);
        if (direction) {
          return { targetCharacter, direction };
        }
      }
    }
    // Case 2: Hovering over an empty cell (2-part ID: "tier-element")
    else if (idParts.length === 2) {
      const [targetTier, targetElement] = idParts;
      // Validate element constraint
      if (draggedCharacter.element === targetElement) {
        // Find the last character in this cell to show shadow at the end
        const cellCharacters = charactersPerTier[targetTier]?.filter(
          char => char.element === targetElement
        ) || [];

        if (cellCharacters.length > 0) {
          // Show shadow at the end (right of last character)
          const lastChar = cellCharacters[cellCharacters.length - 1];
          return { targetCharacter: lastChar, direction: 'right' };
        }
        // Empty cell - no shadow to show, but drop is valid
        return { targetCharacter: null, direction: 'right' };
      }
    }

    return null;
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { over, active } = event;

    // Update hover state for visual preview
    if (over && cursorPositionRef.current) {
      const overId = over.id as string;
      const overData = over.data.current;
      const draggedCharacter = active.data.current?.character as Character;

      if (!draggedCharacter) {
        setHoveredCardName(null);
        setHoverDirection(null);
        return;
      }

      const dropTarget = calculateDropTarget(overId, overData, draggedCharacter);

      if (dropTarget && dropTarget.targetCharacter) {
        setHoveredCardName(dropTarget.targetCharacter.name);
        setHoverDirection(dropTarget.direction);
      } else {
        // Valid drop zone but no character to show shadow on (empty cell)
        setHoveredCardName(null);
        setHoverDirection(null);
      }
    } else {
      // Not hovering over anything
      setHoveredCardName(null);
      setHoverDirection(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCharacter(null);
    // Clear hover states
    setHoveredCardName(null);
    setHoverDirection(null);

    // Cleanup pointer move listener
    if ((window as any).__dragCleanup) {
      (window as any).__dragCleanup();
      delete (window as any).__dragCleanup;
    }

    if (!over) {
      // Dropped outside any droppable zone
      cursorPositionRef.current = null;
      return;
    }

    // Parse IDs: format is "tier-element-characterName" or "tier-element"
    const activeId = active.id as string;
    const overId = over.id as string;

    // Extract character data from active
    const draggedCharacter = active.data.current?.character as Character;
    if (!draggedCharacter) {
      cursorPositionRef.current = null;
      return;
    }

    // No-op if dropped on itself
    if (activeId === overId) {
      cursorPositionRef.current = null;
      return;
    }

    const overData = over.data.current;

    // Use the shared calculation function to get drop target
    const dropTarget = calculateDropTarget(overId, overData, draggedCharacter);

    if (!dropTarget) {
      // Invalid drop (e.g., element mismatch)
      cursorPositionRef.current = null;
      return;
    }

    // Extract tier from overId
    const [targetTier] = overId.split('-');

    if (targetTier === 'Pool') {
      handleRemoveFromTiers(draggedCharacter.name);
    } else {
      // Use the calculated drop target
      handleTierAssignment(
        draggedCharacter.name,
        dropTarget.targetCharacter?.name || null,
        targetTier,
        dropTarget.direction
      );
    }

    // Clear cursor position
    cursorPositionRef.current = null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTravelers(!showTravelers)}
                className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              >
                {showTravelers ? t.buttons.hideTravelers : t.buttons.showTravelers}
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

      <DragOverlay dropAnimation={{ duration: 200 }}>
        {activeCharacter ? <CharacterCardPreview character={activeCharacter} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TierList;
