export type Language = 'en' | 'zh';

export interface Translations {
  title: string;
  buttons: {
    save: string;
    load: string;
    reset: string;
    showWeapons: string;
    hideWeapons: string;
    showTravelers: string;
    hideTravelers: string;
    customize: string;
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
    customizationsSaved: string;
  };
  resetConfirmDialog: {
    title: string;
    message: string;
    confirm: string;
    cancel: string;
  };
  customizeDialog: {
    title: string;
    description: string;
    customTitle: string;
    tierName: string;
    hideTier: string;
    save: string;
    cancel: string;
    reset: string;
    defaultPrefix: string;
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
      showTravelers: 'Show Travelers',
      hideTravelers: 'Hide Travelers',
      customize: 'Customize',
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
      customizationsSaved: 'Customizations saved successfully',
    },
    resetConfirmDialog: {
      title: 'Reset Tier List',
      message: 'Are you sure you want to reset the tier list? This will remove all character assignments and cannot be undone.',
      confirm: 'Reset',
      cancel: 'Cancel',
    },
    customizeDialog: {
      title: 'Customize Tiers',
      description: 'Customize tier names and visibility settings.',
      customTitle: 'Tier List Title',
      tierName: 'Tier Name',
      hideTier: 'Hide Tier',
      save: 'Save',
      cancel: 'Cancel',
      reset: 'Reset',
      defaultPrefix: 'Default: ',
    },
  },
  zh: {
    title: '原神榜单工具',
    buttons: {
      save: '保存',
      load: '加载',
      reset: '重置',
      showWeapons: '显示武器类型',
      hideWeapons: '隐藏武器类型',
      showTravelers: '显示旅行者',
      hideTravelers: '隐藏旅行者',
      customize: '自定义',
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
      tierListReset: '榜单已重置',
      tierListSaved: '保存成功',
      tierListSaveFailed: '保存失败',
      tierListLoaded: '加载成功',
      tierListLoadFailed: '加载失败',
      fileReadError: '文件读取错误',
      customizationsSaved: '自定义设置保存成功',
    },
    resetConfirmDialog: {
      title: '重置榜单',
      message: '确定要重置榜单吗？这将删除所有角色分配，且无法撤销。',
      confirm: '重置',
      cancel: '取消',
    },
    customizeDialog: {
      title: '自定义梯度',
      description: '自定义梯度名称和可见性设置。',
      customTitle: '榜单标题',
      tierName: '梯度名称',
      hideTier: '隐藏梯度',
      save: '保存',
      cancel: '取消',
      reset: '重置',
      defaultPrefix: '默认: ',
    },
  },
};
