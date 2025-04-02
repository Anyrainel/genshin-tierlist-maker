import { Character } from '../data/characters';
import { cn } from '@/lib/utils';
import { RARITY_COLORS, LAYOUT } from '../constants/theme';

interface CharacterCardProps {
  character: Character;
  isDragging?: boolean;
  draggable?: boolean;
  className?: string;
  hoverDirection?: 'left' | 'right' | null;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDoubleClick?: () => void;
}

const CharacterCard = ({ 
  character, 
  isDragging, 
  draggable = false, 
  className,
  hoverDirection = null,
  onDragStart,
  onDragEnd,
  onDoubleClick
}: CharacterCardProps) => {
  const offset = hoverDirection === 'left' ? 3 : hoverDirection === 'right' ? -3 : 0;

  return (
    <div
      className={cn(
        LAYOUT.CHARACTER_CARD_SIZE,
        'rounded-md overflow-hidden transition-all',
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
      onDragEnd={onDragEnd}
      onDoubleClick={onDoubleClick}
      data-character-id={character.id}
      title={`${character.name} (Double-click to remove)`}
    >
      <img
        src={character.imageUrl}
        alt={character.name}
        title={character.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};

export default CharacterCard;
