
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
  return (
    <div className={cn('flex w-full', className)}>
      <div className="w-12 h-24 flex items-center justify-center font-bold text-2xl bg-gray-800 text-gray-100 rounded-l-md">
        {tier}
      </div>
      <div 
        className="flex-grow grid grid-cols-7 gap-1 min-h-[6rem] p-2 bg-gray-900 rounded-r-md"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, tier)}
      >
        {/* Create a drop area for each element */}
        {['pyro', 'hydro', 'electro', 'cryo', 'anemo', 'geo', 'dendro'].map((element) => (
          <div 
            key={`${tier}-${element}`}
            className={`flex flex-wrap gap-1 p-1 min-h-[6rem] rounded-md border-2 border-dashed border-genshin-${element}/30 bg-gray-800/70`}
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
