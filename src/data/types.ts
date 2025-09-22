export type Element = 'Pyro' | 'Hydro' | 'Electro' | 'Cryo' | 'Anemo' | 'Geo' | 'Dendro';

export type Rarity = 4 | 5;

export type Weapon = 'Sword' | 'Claymore' | 'Polearm' | 'Catalyst' | 'Bow';

export type Region = 'Mondstadt' | 'Liyue' | 'Inazuma' | 'Sumeru' | 'Fontaine' | 'Natlan' | 'Snezhnaya' | 'Nod-Krai' | 'None';

export type Character = {
  name: string;
  element: Element;
  rarity: Rarity;
  weapon: Weapon;
  region: Region;
  releaseDate: string; // Format: YYYY-MM-DD
  imageUrl: string;
};

export const tiers = ['S', 'A', 'B', 'C', 'D'];

export const elements: Element[] = ['Pyro', 'Hydro', 'Electro', 'Cryo', 'Anemo', 'Geo', 'Dendro'];

export const weapons: Weapon[] = ['Sword', 'Claymore', 'Polearm', 'Catalyst', 'Bow'];

export const regions: Region[] = ['Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine', 'Natlan', 'Snezhnaya', 'Nod-Krai', 'None'];

export interface TierAssignment {
  [characterName: string]: {
    tier: string;
    position: number;
  };
}

export interface TierCustomization {
  [tier: string]: {
    displayName: string;
    hidden: boolean;
  };
}

export interface TierListData {
  tierAssignments: TierAssignment;
  tierCustomization: TierCustomization;
  customTitle?: string;
  language: 'en' | 'zh';
}