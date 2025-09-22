export const TIER_COLORS = {
    S: 'bg-[#D84351]/85',
    A: 'bg-[#DD8559]/85',
    B: 'bg-[#E6B44D]/85',
    C: 'bg-[#43AD8B]/85',
    D: 'bg-[#4A85CD]/85',
    Pool: 'bg-[#757575]/80'
} as const;

export const TIER_BG_COLORS = {
    S: 'bg-[#D84351]/10',
    A: 'bg-[#DD8559]/10',
    B: 'bg-[#E6B44D]/10',
    C: 'bg-[#43AD8B]/10',
    D: 'bg-[#4A85CD]/10',
    Pool: 'bg-[#757575]/10'
} as const;

export const RARITY_COLORS = {
    4: 'bg-[#9B6B9E]', // Purple for 4-star
    5: 'bg-[#C89B3C]'  // Gold for 5-star
} as const;

export const ELEMENT_COLORS = {
    Pyro: 'bg-genshin-pyro/70', // More transparent for better contrast
    Hydro: 'bg-genshin-hydro/70',
    Electro: 'bg-genshin-electro/70',
    Cryo: 'bg-genshin-cryo/70',
    Anemo: 'bg-genshin-anemo/70',
    Geo: 'bg-genshin-geo/70',
    Dendro: 'bg-genshin-dendro/70'
} as const;

export const LAYOUT = {
    CHARACTER_CARD_SIZE: 'w-16 h-16',
    TIER_LABEL_WIDTH: 'w-12',
    GRID_COLUMNS: 'grid-cols-7',
    MIN_ROW_HEIGHT: 'min-h-[5rem]'
} as const; 