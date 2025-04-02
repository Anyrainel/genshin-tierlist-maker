
import { Character } from '../data/characters';
import { cn } from '@/lib/utils';

interface CharacterCardProps {
  character: Character;
  isDragging?: boolean;
  draggable?: boolean;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDoubleClick?: () => void;
}

const CharacterCard = ({ 
  character, 
  isDragging, 
  draggable = false, 
  className,
  onDragStart,
  onDragEnd,
  onDoubleClick
}: CharacterCardProps) => {
  return (
    <div
      className={cn(
        'w-16 h-16 rounded-md overflow-hidden transition-transform border border-gray-700 shadow-lg hover:scale-105',
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'scale-105 opacity-50' : '',
        className
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDoubleClick={onDoubleClick}
      data-character-id={character.id}
      data-element={character.element}
      title={`${character.name} (Double-click to remove)`}
    >
      <img
        src={character.imageUrl}
        alt={character.name}
        title={character.name}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default CharacterCard;
