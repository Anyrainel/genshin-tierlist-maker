
import { Character, Element } from '../data/characters';
import CharacterCard from './CharacterCard';
import { cn } from '@/lib/utils';

interface CharacterPoolProps {
  characters: Character[];
  onDragStart: (e: React.DragEvent, character: Character) => void;
  onDragEnd: () => void;
  className?: string;
}

const CharacterPool = ({ characters, onDragStart, onDragEnd, className }: CharacterPoolProps) => {
  // Group characters by element
  const charactersByElement: Record<Element, Character[]> = {
    pyro: [],
    hydro: [],
    electro: [],
    cryo: [],
    anemo: [],
    geo: [],
    dendro: []
  };

  characters.forEach(char => {
    charactersByElement[char.element].push(char);
  });

  return (
    <div className={cn('w-full grid grid-cols-7 gap-4', className)}>
      {Object.entries(charactersByElement).map(([element, chars]) => (
        <div key={element} className="flex flex-col">
          <div className={`p-2 text-center font-bold text-white bg-genshin-${element} rounded-t-md`}>
            {element.charAt(0).toUpperCase() + element.slice(1)}
          </div>
          <div className={`p-2 flex flex-wrap gap-1 justify-center bg-gray-800 rounded-b-md border border-genshin-${element}/30`}>
            {chars.map(character => (
              <CharacterCard
                key={character.id}
                character={character}
                draggable
                onDragStart={(e: React.DragEvent) => onDragStart(e, character)}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CharacterPool;
