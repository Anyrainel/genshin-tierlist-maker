
import { useState } from 'react';
import { Character, tierLabels, elements, elementLabels } from '../data/characters';
import TierRow from './TierRow';
import CharacterPool from './CharacterPool';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TierListProps {
  characters: Character[];
}

interface TierAssignment {
  [characterId: string]: string; // Maps character ID to tier
}

const TierList = ({ characters }: TierListProps) => {
  const [tierAssignments, setTierAssignments] = useState<TierAssignment>({});
  const [draggedCharacter, setDraggedCharacter] = useState<Character | null>(null);

  const handleDragStart = (e: React.DragEvent, character: Character) => {
    setDraggedCharacter(character);
    e.dataTransfer.setData('characterId', character.id);
    // Set the drag image to be the character image
    const img = new Image();
    img.src = character.imageUrl;
    e.dataTransfer.setDragImage(img, 25, 25);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    // Reset dragged character when drag operation ends
    setDraggedCharacter(null);
  };

  const handleDrop = (e: React.DragEvent, tier: string) => {
    e.preventDefault();
    
    if (!draggedCharacter) return;
    
    // Get the element from the drop target
    const dropElement = (e.target as HTMLElement).closest('[data-element]')?.getAttribute('data-element');
    
    if (!dropElement) {
      toast.error("Please drop on a valid element section");
      return;
    }
    
    // Check if character's element matches the drop area
    if (draggedCharacter.element !== dropElement) {
      toast.error(`${draggedCharacter.name} is ${elementLabels[draggedCharacter.element]}, not ${elementLabels[dropElement as any]}`);
      return;
    }
    
    // Update tier assignment
    setTierAssignments(prev => ({
      ...prev,
      [draggedCharacter.id]: tier
    }));
    
    toast.success(`${draggedCharacter.name} added to ${tier} tier`);
  };

  // Handle removing character from a tier (returning to pool)
  const handleRemoveFromTier = (character: Character) => {
    setTierAssignments(prev => {
      const newAssignments = {...prev};
      delete newAssignments[character.id];
      return newAssignments;
    });
    toast.info(`${character.name} removed from tier list`);
  };

  const resetTierList = () => {
    setTierAssignments({});
    toast.info("Tier list has been reset");
  };
  
  // Filter characters based on tier assignments
  const getCharactersForTier = (tier: string) => {
    return characters.filter(char => tierAssignments[char.id] === tier);
  };
  
  // Get unassigned characters
  const unassignedCharacters = characters.filter(char => !tierAssignments[char.id]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-200">Genshin Impact Tier List Maker</h1>
        <Button 
          variant="destructive" 
          onClick={resetTierList}
        >
          Reset Tier List
        </Button>
      </div>
      
      {/* Element Headers */}
      <div className="flex w-full">
        <div className="w-12"></div> {/* Empty space for tier label */}
        <div className="flex-grow grid grid-cols-7 gap-1">
          {elements.map(element => (
            <div 
              key={element} 
              className={`p-2 text-center font-bold text-white bg-genshin-${element} rounded-t-md`}
            >
              {elementLabels[element]}
            </div>
          ))}
        </div>
      </div>
      
      {/* Tier Rows */}
      <div className="flex flex-col gap-2">
        {tierLabels.map(tier => (
          <TierRow
            key={tier}
            tier={tier}
            characters={getCharactersForTier(tier)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onRemoveFromTier={handleRemoveFromTier}
          />
        ))}
      </div>
      
      {/* Character Pool */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-200">Characters</h2>
        <CharacterPool 
          characters={unassignedCharacters} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
};

export default TierList;
