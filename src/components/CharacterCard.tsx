import { Character } from '../data/types';
import { cn } from '@/lib/utils';
import { RARITY_COLORS } from '../constants/theme';
import { weaponImages } from '../data/weapons';
import { useWeaponVisibility } from '../contexts/WeaponVisibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CharacterCardProps {
  character: Character;
  tier: string;
  hoverDirection?: 'left' | 'right' | null;
  onDoubleClick?: () => void;
}

const CharacterCard = ({
  character,
  tier,
  hoverDirection = null,
  onDoubleClick
}: CharacterCardProps) => {
  const { showWeapons } = useWeaponVisibility();
  const { language } = useLanguage();

  // Unique ID format: "tier-element-characterName"
  const id = `${tier}-${character.element}-${character.name}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      character,
      tier,
      element: character.element,
    },
  });

  // Calculate hover offset for shadow preview
  const hoverOffset = hoverDirection === 'left' ? 3 : hoverDirection === 'right' ? -3 : 0;

  // Combine dnd-kit transform with hover offset
  let combinedTransform = CSS.Transform.toString(transform);
  if (hoverOffset !== 0 && !isDragging) {
    // Only apply hover offset when not dragging
    const baseTransform = transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : '';
    combinedTransform = baseTransform ? `${baseTransform} translate(${hoverOffset}px, 0)` : `translate(${hoverOffset}px, 0)`;
  }

  const style = {
    transform: combinedTransform,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'w-16 h-16 rounded-md overflow-hidden transition-all relative',
        RARITY_COLORS[character.rarity],
        'cursor-grab active:cursor-grabbing',
        'hover:scale-105',
      )}
      onDoubleClick={onDoubleClick}
      data-character-id={character.name}
    >
      <img
        src={character.imagePath}
        alt={character.name}
        title={language === 'zh' ? character.nameZh : character.name}
        className="w-full h-full object-cover"
        loading="lazy"
        draggable={false}
      />
      {showWeapons && (
        <div className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center">
          <div className="relative bg-black/30 rounded-full backdrop-blur-sm">
            <img
              src={weaponImages[character.weapon]}
              alt={character.weapon}
              className="w-5 h-5 object-contain filter brightness-125 contrast-150 drop-shadow-lg"
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCard;
