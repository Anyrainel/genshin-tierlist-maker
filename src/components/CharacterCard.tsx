
import { Character } from '../data/characters';
import { cn } from '@/lib/utils';

interface CharacterCardProps {
  character: Character;
  isDragging?: boolean;
  draggable?: boolean;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
}

const CharacterCard = ({ 
  character, 
  isDragging, 
  draggable = false, 
  className,
  onDragStart 
}: CharacterCardProps) => {
  return (
    <div
      className={cn(
        'w-16 h-16 rounded-md overflow-hidden transition-transform',
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'scale-105 opacity-50' : '',
        className
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      data-character-id={character.id}
      data-element={character.element}
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
