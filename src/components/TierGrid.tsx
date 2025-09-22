import { Character } from '../data/types';
import CharacterCard from './CharacterCard';
import { cn } from '@/lib/utils';
import { TIER_COLORS, TIER_BG_COLORS, ELEMENT_COLORS, LAYOUT } from '../constants/theme';
import { elements } from '../data/types';
import { elementImages } from '../data/elements';
import { useLanguage } from '../contexts/LanguageContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';


interface TierGridProps {
  allTiers: string[];
  charactersPerTier: { [tier: string]: Character[] };
  onTierAssignment: (dragName: string, dropName: string | null, tier: string, direction: 'left' | 'right') => void;
  onRemoveFromTier: (dragName: string) => void;
}

const TierGrid = ({
  allTiers,
  charactersPerTier,
  onTierAssignment,
  onRemoveFromTier
}: TierGridProps) => {
  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    hoveredCardId,
    hoverDirection
  } = useDragAndDrop({
    onTierAssignment,
    onRemoveFromTier
  });

  return (
    <div className="relative">
      <TierHeader />

      {allTiers.map(tier => (
        <TierRow
          key={tier}
          tier={tier}
          characters={charactersPerTier[tier] || []}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDoubleClick={onRemoveFromTier}
          hoveredCardId={hoveredCardId}
          hoverDirection={hoverDirection}
        />
      ))}
    </div>
  );
};

const TierHeader = () => {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-[4rem_1fr]">
      <div></div>
      <div className={cn(
        "grid bg-gray-800/30",
        LAYOUT.GRID_COLUMNS
      )}>
        {elements.map((element) => (
          <div
            key={element}
            className={cn(
              "flex items-center justify-center gap-2 p-2 text-center font-bold text-white",
              ELEMENT_COLORS[element],
              "rounded-tl-md rounded-tr-md",
              "border-r border-b border-gray-700"
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
  );
};

interface TierRowProps {
  tier: string;
  characters: Character[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, character: Character) => void;
  onDoubleClick: (clickName: string) => void;
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
  onDoubleClick,
  hoveredCardId = null,
  hoverDirection = null
}: TierRowProps) => {
  const { t } = useLanguage();
  return (
    <div className={cn('grid grid-cols-[4rem_1fr]', LAYOUT.MIN_ROW_HEIGHT)}>
      <div className={cn(
        'flex items-center justify-center font-bold',
        tier === 'Pool' ? 'text-lg' : 'text-2xl',
        TIER_COLORS[tier as keyof typeof TIER_COLORS],
        'text-gray-100 border-b border-r border-gray-700 rounded-l-md',
        'px-1 py-1 text-center break-words'
      )}>
        <span className="leading-tight text-center">
          {t.tiers[tier as keyof typeof t.tiers] || tier}
        </span>
      </div>

      <div
        className={cn(
          "grid bg-gray-800/30",
          LAYOUT.GRID_COLUMNS
        )}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {elements.map((element) => (
          <div
            key={`${tier}-${element}`}
            className={cn(
              "flex flex-col gap-2 p-2 w-full",
              TIER_BG_COLORS[tier as keyof typeof TIER_BG_COLORS],
              "backdrop-blur-sm",
              "border-b border-r border-gray-700",
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
                    key={character.name}
                    character={character}
                    draggable={true}
                    hoverDirection={hoveredCardId === character.name ? hoverDirection : null}
                    onDragStart={(e) => onDragStart(e, character)}
                    onDoubleClick={() => onDoubleClick(character.name)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierGrid;
