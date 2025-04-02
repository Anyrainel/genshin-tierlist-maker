
import { characters } from "../data/characters";
import TierList from "../components/TierList";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 bg-opacity-95 p-4 bg-[url('/bg-dark-pattern.png')] bg-repeat">
      <div className="container mx-auto">
        <TierList characters={characters} />
      </div>
    </div>
  );
};

export default Index;
