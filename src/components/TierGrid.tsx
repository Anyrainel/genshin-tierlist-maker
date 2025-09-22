import React from 'react';
import { Character } from '../data/types';
import CharacterCard from './CharacterCard';
import { cn } from '@/lib/utils';
import { TIER_COLORS, TIER_BG_COLORS, ELEMENT_COLORS, LAYOUT } from '../constants/theme';
import { elements } from '../data/types';
import { elementImages } from '../data/elements';
import { useLanguage } from '../contexts/LanguageContext';


interface TierGridProps {
  allTiers: string[];
  charactersPerTier: { [tier: string]: Character[] };
  onDragStart: (e: React.DragEvent, character: Character) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onRemoveFromTiers: (dragName: string) => void;
  hoveredCardName: string | null;
  hoverDirection: 'left' | 'right' | null;
}

const TierGrid = ({
  allTiers,
  charactersPerTier,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemoveFromTiers,
  hoveredCardName,
  hoverDirection,
}: TierGridProps) => {
  const { t } = useLanguage();

  const TierHeader = () => {
    return (
      <React.Fragment key={'header'}>
        {elements.map((element) => (
          <div
            key={element}
            className={cn(
              LAYOUT.CENTER_BOX,
              ELEMENT_COLORS[element],
              LAYOUT.GRID_BORDER,
              'rounded-tl-md rounded-tr-md',
            )}
          >
            <img
              src={elementImages[element]}
              className='w-6 h-6 pr-2 brightness-110 contrast-125'
            />
            <span className={cn(LAYOUT.LABEL_TEXT, 'text-lg')}>
              {t.elements[element]}
            </span>
          </div>
        ))}
      </React.Fragment>
    );
  };

  const TierRow = ({ tier, characters }: { tier: string; characters: Character[] }) => {
    return (
      <React.Fragment key={`${tier}-row`}>
        <div key={`${tier}`}
          className={cn(
            LAYOUT.CENTER_BOX,
            LAYOUT.MIN_ROW_HEIGHT,
            TIER_COLORS[tier as keyof typeof TIER_COLORS],
            LAYOUT.GRID_BORDER,
            'rounded-l-md'
          )}>
          <span className={cn(LAYOUT.LABEL_TEXT, 'text-2xl')}>
            {t.tiers[tier as keyof typeof t.tiers] || tier}
          </span>
        </div>
        {elements.map((element) => (
          <div
            key={`${tier}-${element}`}
            className={cn(
              'p-2',
              LAYOUT.MIN_ROW_HEIGHT,
              TIER_BG_COLORS[tier as keyof typeof TIER_BG_COLORS],
              LAYOUT.GRID_BORDER,
            )}
            data-tier={tier}
            data-element={element}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <div className='flex flex-wrap justify-center gap-2'>
              {characters
                .filter((char) => char.element === element)
                .map((character) => (
                  <CharacterCard
                    key={character.name}
                    character={character}
                    draggable={true}
                    hoverDirection={hoveredCardName === character.name ? hoverDirection : null}
                    onDragStart={(e) => onDragStart(e, character)}
                    onDragEnd={onDragEnd}
                    onDoubleClick={() => onRemoveFromTiers(character.name)}
                  />
                ))}
            </div>
          </div>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className='grid grid-cols-[4rem_repeat(7,1fr)] select-none'>
      <div key={'empty'} />
      <TierHeader />

      {allTiers.map(tier => (
        <TierRow
          key={tier}
          tier={tier}
          characters={charactersPerTier[tier] || []}
        />
      ))}
    </div>
  );
};


export default TierGrid;
