import { Character } from '../data/types';
import { cn } from '@/lib/utils';
import { RARITY_COLORS, LAYOUT } from '../constants/theme';
import { weaponImages } from '../data/weapons';
import { useWeaponVisibility } from '../contexts/WeaponVisibilityContext';

interface CharacterCardProps {
  character: Character;
  isDragging?: boolean;
  draggable?: boolean;
  className?: string;
  hoverDirection?: 'left' | 'right' | null;
  onDragStart?: (e: React.DragEvent) => void;
  onDoubleClick?: () => void;
}

const CharacterCard = ({ 
  character, 
  isDragging, 
  draggable = false, 
  className,
  hoverDirection = null,
  onDragStart,
  onDoubleClick
}: CharacterCardProps) => {
  const { showWeapons } = useWeaponVisibility();
  const offset = hoverDirection === 'left' ? 3 : hoverDirection === 'right' ? -3 : 0;

  return (
    <div
      className={cn(
        LAYOUT.CHARACTER_CARD_SIZE,
        'rounded-md overflow-hidden transition-all relative',
        RARITY_COLORS[character.rarity],
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'scale-105 opacity-50' : '',
        'hover:scale-105',
        className
      )}
      style={{
        transform: `translate(${offset}px, 0) ${isDragging ? 'scale(1.05)' : ''}`
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDoubleClick={onDoubleClick}
      data-character-id={character.name}
      title={`${character.name} (Double-click to remove)`}
    >
      <img
        src={character.imageUrl}
        alt={character.name}
        title={character.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {showWeapons && !isDragging && (
        <div className="absolute -top-1 -right-1 w-7 h-7 flex items-center justify-center">
          <img
            src={weaponImages[character.weapon]}
            alt={character.weapon}
            className="w-5 h-5 object-contain filter brightness-110 drop-shadow-lg opacity-80 invert"
          />
        </div>
      )}
    </div>
  );
};

export default CharacterCard;
