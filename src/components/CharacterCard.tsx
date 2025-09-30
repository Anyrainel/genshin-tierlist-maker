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
  onDragEnd?: (e: React.DragEvent) => void;
  onDoubleClick?: () => void;
}

const CharacterCard = ({ 
  character, 
  isDragging, 
  draggable = true, 
  className,
  hoverDirection = null,
  onDragStart,
  onDragEnd,
  onDoubleClick
}: CharacterCardProps) => {
  const { showWeapons } = useWeaponVisibility();
  const offset = hoverDirection === 'left' ? 3 : hoverDirection === 'right' ? -3 : 0;

  return (
    <div
      className={cn(
        'w-16 h-16 rounded-md overflow-hidden transition-all relative',
        RARITY_COLORS[character.rarity],
        'cursor-grab active:cursor-grabbing',
        isDragging ? 'scale-105 opacity-50' : '',
        'hover:scale-105',
        className
      )}
      style={{
        transform: `translate(${offset}px, 0) ${isDragging ? 'scale(1.05)' : ''}`
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDoubleClick={onDoubleClick}
      data-character-id={character.name}
    >
      <img
        src={character.imagePath}
        alt={character.name}
        title={character.name}
        className="w-full h-full object-cover"
        loading="lazy"
        draggable={false} // Prevent image from being dragged separately
      />
      {showWeapons && !isDragging && (
        <div className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center">
          <div className="relative bg-black/30 rounded-full backdrop-blur-sm">
            <img
              src={weaponImages[character.weapon]}
              alt={character.weapon}
              className="w-5 h-5 object-contain filter brightness-125 contrast-150 drop-shadow-lg"
              draggable={false} // Prevent weapon icon from being dragged
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCard;
