
import { Character } from '../data/characters';
import CharacterCard from './CharacterCard';
import { cn } from '@/lib/utils';

interface TierRowProps {
  tier: string;
  characters: Character[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, tier: string) => void;
  onDragStart: (e: React.DragEvent, character: Character) => void;
  onRemoveFromTier: (character: Character) => void;
  className?: string;
}

const TierRow = ({ 
  tier, 
  characters, 
  onDragOver, 
  onDrop, 
  onDragStart,
  onRemoveFromTier,
  className 
}: TierRowProps) => {
  // Get background color based on tier
  const getTierColor = () => {
    switch(tier) {
      case 'S': return 'bg-red-700/80';
      case 'A': return 'bg-orange-600/80';
      case 'B': return 'bg-yellow-600/80';
      case 'C': return 'bg-green-700/80';
      case 'D': return 'bg-blue-700/80';
      default: return 'bg-gray-800/80';
    }
  };

  return (
    <div className={cn('flex w-full h-auto', className)}>
      {/* Fixed width tier label that stays vertically centered */}
      <div className={`min-w-[3rem] w-12 flex-shrink-0 flex items-center justify-center font-bold text-2xl ${getTierColor()} text-gray-100 rounded-l-md shadow-md`}>
        {tier}
      </div>
      
      {/* Grid container with fixed column widths */}
      <div 
        className="flex-grow grid grid-cols-7 gap-1 min-h-[6rem] p-2 bg-gray-800/30 rounded-r-md shadow-md"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, tier)}
        style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
      >
        {/* Create a drop area for each element */}
        {['pyro', 'hydro', 'electro', 'cryo', 'anemo', 'geo', 'dendro'].map((element) => (
          <div 
            key={`${tier}-${element}`}
            className="flex flex-wrap gap-1 p-1 min-h-[6rem] rounded-md border border-genshin-${element}/30 bg-gray-800/50 backdrop-blur-sm transition-all hover:bg-gray-700/40 overflow-hidden"
            data-tier={tier}
            data-element={element}
          >
            {characters
              .filter((char) => char.element === element)
              .map((character) => (
                <CharacterCard 
                  key={character.id} 
                  character={character}
                  draggable={true}
                  onDragStart={(e) => onDragStart(e, character)}
                  onDoubleClick={() => onRemoveFromTier(character)}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierRow;
