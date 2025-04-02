
import { characters } from "../data/characters";
import TierList from "../components/TierList";

const Index = () => {
  return (
    <div className="min-h-screen bg-genshin-bg p-4">
      <div className="container mx-auto">
        <TierList characters={characters} />
      </div>
    </div>
  );
};

export default Index;
