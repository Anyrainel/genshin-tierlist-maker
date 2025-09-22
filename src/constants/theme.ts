export const TIER_COLORS = {
    S: 'bg-tier-s/85',
    A: 'bg-tier-a/85',
    B: 'bg-tier-b/85',
    C: 'bg-tier-c/85',
    D: 'bg-tier-d/85',
    Pool: 'bg-tier-pool/85',
} as const;

export const TIER_BG_COLORS = {
    S: 'bg-tier-s/10',
    A: 'bg-tier-a/10',
    B: 'bg-tier-b/10',
    C: 'bg-tier-c/10',
    D: 'bg-tier-d/10',
    Pool: 'bg-tier-pool/10',
} as const;

export const RARITY_COLORS = {
    4: 'bg-rarity-4',
    5: 'bg-rarity-5',
} as const;

export const ELEMENT_COLORS = {
    Pyro: 'bg-genshin-pyro/70',
    Hydro: 'bg-genshin-hydro/70',
    Electro: 'bg-genshin-electro/70',
    Cryo: 'bg-genshin-cryo/70',
    Anemo: 'bg-genshin-anemo/70',
    Geo: 'bg-genshin-geo/70',
    Dendro: 'bg-genshin-dendro/70',
} as const;

export const LAYOUT = {
    TIER_LABEL_WIDTH: 'w-12',
    MIN_ROW_HEIGHT: 'min-h-[5rem]',
    GRID_BORDER: 'border-r border-b border-gray-600 bg-clip-padding',
    CENTER_BOX: 'flex items-center justify-center p-2',
    LABEL_TEXT: 'text-center break-words font-bold text-gray-100',
} as const; 