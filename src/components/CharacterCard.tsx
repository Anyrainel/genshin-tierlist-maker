
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
  const elementColors = {
    pyro: 'border-genshin-pyro/70',
    hydro: 'border-genshin-hydro/70',
    electro: 'border-genshin-electro/70',
    cryo: 'border-genshin-cryo/70',
    anemo: 'border-genshin-anemo/70',
    geo: 'border-genshin-geo/70',
    dendro: 'border-genshin-dendro/70'
  };

  return (
    <div
      className={cn(
        'w-16 h-16 rounded-md overflow-hidden transition-all border-2 shadow-lg hover:scale-105',
        elementColors[character.element],
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'scale-105 opacity-50' : '',
        'hover:shadow-[0_0_8px_rgba(255,255,255,0.3)]',
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
