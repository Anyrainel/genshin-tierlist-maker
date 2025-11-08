import { Character } from '../data/types';
import { RARITY_COLORS } from '../constants/theme';
import { weaponImages } from '../data/weapons';
import { useWeaponVisibility } from '../contexts/WeaponVisibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface CharacterCardPreviewProps {
  character: Character;
}

/**
 * Presentational component for drag overlay preview.
 * Does NOT use any dnd-kit hooks (useDraggable/useSortable).
 */
const CharacterCardPreview = ({ character }: CharacterCardPreviewProps) => {
  const { showWeapons } = useWeaponVisibility();
  const { language } = useLanguage();

  return (
    <div
      className={`w-16 h-16 rounded-md overflow-hidden relative ${RARITY_COLORS[character.rarity]}`}
      style={{
        opacity: 0.8,
        transform: 'scale(1.05)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        cursor: 'grabbing',
      }}
    >
      <img
        src={character.imagePath}
        alt={character.name}
        title={language === 'zh' ? character.nameZh : character.name}
        className="w-full h-full object-cover"
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

export default CharacterCardPreview;
