export type Language = 'en' | 'zh';

export interface Translations {
  title: string;
  buttons: {
    save: string;
    load: string;
    reset: string;
    showWeapons: string;
    hideWeapons: string;
  };
  elements: {
    Pyro: string;
    Hydro: string;
    Electro: string;
    Cryo: string;
    Anemo: string;
    Geo: string;
    Dendro: string;
  };
  tiers: {
    S: string;
    A: string;
    B: string;
    C: string;
    D: string;
    Pool: string;
  };
  messages: {
    tierListReset: string;
    tierListSaved: string;
    tierListSaveFailed: string;
    tierListLoaded: string;
    tierListLoadFailed: string;
    fileReadError: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    title: 'Genshin Tier List Tool',
    buttons: {
      save: 'Save',
      load: 'Load',
      reset: 'Reset',
      showWeapons: 'Show Weapon Types',
      hideWeapons: 'Hide Weapon Types',
    },
    elements: {
      Pyro: 'Pyro',
      Hydro: 'Hydro',
      Electro: 'Electro',
      Cryo: 'Cryo',
      Anemo: 'Anemo',
      Geo: 'Geo',
      Dendro: 'Dendro',
    },
    tiers: {
      S: 'S',
      A: 'A',
      B: 'B',
      C: 'C',
      D: 'D',
      Pool: 'Pool',
    },
    messages: {
      tierListReset: 'Tier list has been reset',
      tierListSaved: 'Tier list saved successfully',
      tierListSaveFailed: 'Failed to save tier list',
      tierListLoaded: 'Tier list loaded successfully',
      tierListLoadFailed: 'Failed to load tier list',
      fileReadError: 'Error reading file',
    },
  },
  zh: {
    title: '原神强度榜工具',
    buttons: {
      save: '保存',
      load: '加载',
      reset: '重置',
      showWeapons: '显示武器类型',
      hideWeapons: '隐藏武器类型',
    },
    elements: {
      Pyro: '火',
      Hydro: '水',
      Electro: '雷',
      Cryo: '冰',
      Anemo: '风',
      Geo: '岩',
      Dendro: '草',
    },
    tiers: {
      S: 'S',
      A: 'A',
      B: 'B',
      C: 'C',
      D: 'D',
      Pool: '角色池',
    },
    messages: {
      tierListReset: '强度榜已重置',
      tierListSaved: '保存成功',
      tierListSaveFailed: '保存失败',
      tierListLoaded: '加载成功',
      tierListLoadFailed: '加载失败',
      fileReadError: '文件读取错误',
    },
  },
};
