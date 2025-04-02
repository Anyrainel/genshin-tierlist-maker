import { characters } from "../data/characters";
import TierList from "../components/TierList";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 bg-opacity-95 bg-[url('/bg-dark-pattern.png')] bg-repeat">
      <TierList characters={characters} />
    </div>
  );
};

export default Index;
