import { useState, useRef } from 'react';
import { Character, tiers, elements } from '../data/types';
import { elementImages } from '../data/elements';
import TierRow from './TierRow';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { ELEMENT_COLORS, LAYOUT } from '../constants/theme';
import { cn } from '../lib/utils';
import { TierAssignment, saveTierList, loadTierList } from '../data/savefile';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeaponVisibility } from '../contexts/WeaponVisibilityContext';

interface TierListProps {
  characters: Character[];
}

const TierList = ({ characters }: TierListProps) => {
  const [tierAssignments, setTierAssignments] = useState<TierAssignment>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const { showWeapons, setShowWeapons } = useWeaponVisibility();

  const handleTierAssignment = (draggedId: string, dropId: string | null, tier: string, direction: 'left' | 'right') => {
    setTierAssignments(prev => {
      const newAssignments = { ...prev };
      const draggedChar = characters.find(c => c.name === draggedId);
      if (!draggedChar) return prev;

      const oldAssignment = prev[draggedId];
      const isSameTier = oldAssignment?.tier === tier;

      // Get all characters in the same element and tier, sorted by position
      const elementChars = Object.entries(prev)
        .filter(([id, assignment]) => {
          const char = characters.find(c => c.name === id);
          return char?.element === draggedChar.element &&
            assignment.tier === tier;
        })
        .map(([name, assignment]) => ({
          name,
          position: assignment.position
        }))
        .sort((a, b) => a.position - b.position);

      // If no drop target, append to the end
      if (!dropId) {
        const newPosition = direction === 'left' ? 0
          : elementChars.length > 0 ? Math.max(...elementChars.map(c => c.position)) + 1
            : 0;
        newAssignments[draggedId] = { tier, position: newPosition };

        // If inserting at the beginning, shift all other cards right
        if (direction === 'left') {
          elementChars.forEach(card => {
            newAssignments[card.name] = { tier, position: card.position + 1 };
          });
        }
        return newAssignments;
      }

      // Find the drop target's current position
      const dropTargetIndex = elementChars.findIndex(card => card.name === dropId);
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
      newAssignments[draggedId] = { tier, position: newPosition };

      return newAssignments;
    });
  };

  const handleRemoveFromTier = (character: Character) => {
    setTierAssignments(prev => {
      const newAssignments = { ...prev };
      const oldAssignment = prev[character.name];

      if (oldAssignment) {
        // Get all characters in the same tier and element, sorted by position
        const elementChars = Object.entries(prev)
          .filter(([name, assignment]) => {
            const char = characters.find(c => c.name === name);
            return char?.element === character.element &&
              assignment.tier === oldAssignment.tier;
          })
          .map(([name, assignment]) => ({
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

  const handleSaveTierList = () => {
    saveTierList(tierAssignments, language);
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
      const loadedAssignments = await loadTierList(file, language);
      setTierAssignments(loadedAssignments);
    } catch (error) {
      // Error already handled in loadTierList function
    }

    // Reset the input so the same file can be loaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    handleRemoveFromTier: handleRemove,
    hoveredCardId,
    hoverDirection
  } = useDragAndDrop({
    onTierAssignment: handleTierAssignment,
    onRemoveFromTier: handleRemoveFromTier
  });

  const getCharactersForTier = (tier: string) => {
    return characters
      .filter(char => tierAssignments[char.name]?.tier === tier)
      .sort((a, b) => {
        const posA = tierAssignments[a.name]?.position ?? 0;
        const posB = tierAssignments[b.name]?.position ?? 0;
        return posA - posB;
      });
  };

  const poolCharacters = characters.filter(char => !tierAssignments[char.name]);

  const allTiers = [...tiers, 'Pool'];

  return (
    <div className="flex flex-col w-full max-w-[90vw] mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-200">{t.title}</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
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
            onClick={handleSaveTierList}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {t.buttons.save}
          </Button>
          <Button
            variant="default"
            onClick={handleLoadTierList}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t.buttons.load}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <Button
            variant="destructive"
            onClick={resetTierList}
          >
            {t.buttons.reset}
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <div className="flex w-full border-b border-gray-700">
          <div className="w-16"></div>
          <div className={cn(
            "flex-grow grid",
            LAYOUT.GRID_COLUMNS,
            "gap-0"
          )}>
            {elements.map((element, index) => (
              <div
                key={element} 
                className={cn(
                  "p-2 text-center font-bold text-white",
                  ELEMENT_COLORS[element],
                  "rounded-tl-md rounded-tr-md",
                  "border-r border-gray-700 last:border-r-0",
                  "flex items-center justify-center gap-2"
                )}
              >
                <img
                  src={elementImages[element]}
                  alt={`${element} element`}
                  className="w-6 h-6 drop-shadow-lg filter brightness-110 contrast-125"
                />
                {t.elements[element]}
              </div>
            ))}
          </div>
        </div>

        <div className="border-r border-b border-gray-700">
          <div className="flex flex-col">
            {allTiers.map(tier => (
              <TierRow
                key={tier}
                tier={tier}
                characters={tier === 'Pool' ? poolCharacters : getCharactersForTier(tier)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
                onRemoveFromTier={handleRemove}
                className={tier === 'Pool' ? 'bg-gray-800/50' : undefined}
                hoveredCardId={hoveredCardId}
                hoverDirection={hoverDirection}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierList;
