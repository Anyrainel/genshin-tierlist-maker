import { Character } from '../data/characters';
import CharacterCard from './CharacterCard';
import { cn } from '@/lib/utils';
import { TIER_COLORS, TIER_BG_COLORS, LAYOUT, ELEMENT_COLORS } from '../constants/theme';
import { elements } from '../data/characters';

interface TierRowProps {
  tier: string;
  characters: Character[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, tier: string) => void;
  onDragStart: (e: React.DragEvent, character: Character) => void;
  onRemoveFromTier: (character: Character) => void;
  className?: string;
  hoveredCardId?: string | null;
  hoverDirection?: 'left' | 'right' | null;
}

const TierRow = ({ 
  tier, 
  characters, 
  onDragOver, 
  onDrop, 
  onDragStart,
  onRemoveFromTier,
  className,
  hoveredCardId = null,
  hoverDirection = null
}: TierRowProps) => {
  return (
    <div className={cn('grid grid-cols-[4rem_1fr] gap-0 border-b border-gray-700 last:border-b-0', LAYOUT.MIN_ROW_HEIGHT, className)}>
      <div className={cn(
        'flex items-center justify-center font-bold text-2xl',
        TIER_COLORS[tier as keyof typeof TIER_COLORS],
        'text-gray-100 rounded-l-md border-r border-gray-700'
      )}>
        {tier}
      </div>

      <div 
        className={cn(
          "grid bg-gray-800/30",
          LAYOUT.GRID_COLUMNS,
          "gap-0"
        )}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, tier)}
      >
        {elements.map((element) => (
          <div 
            key={`${tier}-${element}`}
            className={cn(
              "flex flex-col gap-2 p-2 w-full",
              TIER_BG_COLORS[tier as keyof typeof TIER_BG_COLORS],
              "backdrop-blur-sm",
              "border-r border-gray-700 last:border-r-0",
              "hover:bg-opacity-80"
            )}
            data-tier={tier}
            data-element={element}
          >
            <div className="flex flex-wrap justify-center gap-2">
              {characters
                .filter((char) => char.element === element)
                .map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    draggable={true}
                    hoverDirection={hoveredCardId === character.id ? hoverDirection : null}
                    onDragStart={(e) => onDragStart(e, character)}
                    onDoubleClick={() => onRemoveFromTier(character)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierRow;
