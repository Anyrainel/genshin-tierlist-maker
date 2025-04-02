
export type Element = 'pyro' | 'hydro' | 'electro' | 'cryo' | 'anemo' | 'geo' | 'dendro';

export type Character = {
  id: string;
  name: string;
  element: Element;
  imageUrl: string;
};

// This is a simplified list of characters with placeholder image URLs
// In a real implementation, you would use actual character images
export const characters: Character[] = [
  // Pyro Characters
  { id: 'diluc', name: 'Diluc', element: 'pyro', imageUrl: 'https://i.imgur.com/8M0uSpT.png' },
  { id: 'klee', name: 'Klee', element: 'pyro', imageUrl: 'https://i.imgur.com/S9odmvX.png' },
  { id: 'hutao', name: 'Hu Tao', element: 'pyro', imageUrl: 'https://i.imgur.com/XNfA28J.png' },
  { id: 'xiangling', name: 'Xiangling', element: 'pyro', imageUrl: 'https://i.imgur.com/yzDf6jX.png' },
  { id: 'bennett', name: 'Bennett', element: 'pyro', imageUrl: 'https://i.imgur.com/HLYKdx7.png' },
  { id: 'amber', name: 'Amber', element: 'pyro', imageUrl: 'https://i.imgur.com/gvvnUZD.png' },
  { id: 'xinyan', name: 'Xinyan', element: 'pyro', imageUrl: 'https://i.imgur.com/2UUfzqm.png' },
  { id: 'yanfei', name: 'Yanfei', element: 'pyro', imageUrl: 'https://i.imgur.com/O7uAm6A.png' },
  { id: 'yoimiya', name: 'Yoimiya', element: 'pyro', imageUrl: 'https://i.imgur.com/YZzwpwJ.png' },
  { id: 'thoma', name: 'Thoma', element: 'pyro', imageUrl: 'https://i.imgur.com/k6cwdrl.png' },
  
  // Hydro Characters
  { id: 'mona', name: 'Mona', element: 'hydro', imageUrl: 'https://i.imgur.com/MzaPknW.png' },
  { id: 'xingqiu', name: 'Xingqiu', element: 'hydro', imageUrl: 'https://i.imgur.com/ZlBwMJh.png' },
  { id: 'barbara', name: 'Barbara', element: 'hydro', imageUrl: 'https://i.imgur.com/kTCeS9s.png' },
  { id: 'tartaglia', name: 'Tartaglia', element: 'hydro', imageUrl: 'https://i.imgur.com/Ur1CNNA.png' },
  { id: 'kokomi', name: 'Kokomi', element: 'hydro', imageUrl: 'https://i.imgur.com/DuFCg8j.png' },
  { id: 'ayato', name: 'Ayato', element: 'hydro', imageUrl: 'https://i.imgur.com/hNJ9my4.png' },
  { id: 'yelan', name: 'Yelan', element: 'hydro', imageUrl: 'https://i.imgur.com/XhsbQGG.png' },
  { id: 'candace', name: 'Candace', element: 'hydro', imageUrl: 'https://i.imgur.com/PWu55KF.png' },
  
  // Electro Characters
  { id: 'keqing', name: 'Keqing', element: 'electro', imageUrl: 'https://i.imgur.com/4Vg5tXh.png' },
  { id: 'fischl', name: 'Fischl', element: 'electro', imageUrl: 'https://i.imgur.com/6vwB8gG.png' },
  { id: 'beidou', name: 'Beidou', element: 'electro', imageUrl: 'https://i.imgur.com/KtUFEP9.png' },
  { id: 'razor', name: 'Razor', element: 'electro', imageUrl: 'https://i.imgur.com/dLBhIOS.png' },
  { id: 'lisa', name: 'Lisa', element: 'electro', imageUrl: 'https://i.imgur.com/N8BpHER.png' },
  { id: 'raiden', name: 'Raiden Shogun', element: 'electro', imageUrl: 'https://i.imgur.com/Q0Q5XUR.png' },
  { id: 'sara', name: 'Kujou Sara', element: 'electro', imageUrl: 'https://i.imgur.com/HzngPRj.png' },
  { id: 'yae', name: 'Yae Miko', element: 'electro', imageUrl: 'https://i.imgur.com/UuOz3QO.png' },
  { id: 'shinobu', name: 'Kuki Shinobu', element: 'electro', imageUrl: 'https://i.imgur.com/HGcMSYb.png' },
  { id: 'cyno', name: 'Cyno', element: 'electro', imageUrl: 'https://i.imgur.com/OTOuPx7.png' },
  { id: 'dori', name: 'Dori', element: 'electro', imageUrl: 'https://i.imgur.com/zqavyf4.png' },
  
  // Cryo Characters
  { id: 'qiqi', name: 'Qiqi', element: 'cryo', imageUrl: 'https://i.imgur.com/N9B6dT1.png' },
  { id: 'ganyu', name: 'Ganyu', element: 'cryo', imageUrl: 'https://i.imgur.com/Jy46DYB.png' },
  { id: 'diona', name: 'Diona', element: 'cryo', imageUrl: 'https://i.imgur.com/JmVKxrM.png' },
  { id: 'kaeya', name: 'Kaeya', element: 'cryo', imageUrl: 'https://i.imgur.com/WCl1D2N.png' },
  { id: 'chongyun', name: 'Chongyun', element: 'cryo', imageUrl: 'https://i.imgur.com/tmcULos.png' },
  { id: 'rosaria', name: 'Rosaria', element: 'cryo', imageUrl: 'https://i.imgur.com/r9CTzO0.png' },
  { id: 'ayaka', name: 'Ayaka', element: 'cryo', imageUrl: 'https://i.imgur.com/YCH9SvR.png' },
  { id: 'eula', name: 'Eula', element: 'cryo', imageUrl: 'https://i.imgur.com/Nb6zs5r.png' },
  { id: 'shenhe', name: 'Shenhe', element: 'cryo', imageUrl: 'https://i.imgur.com/pqbfmPc.png' },
  { id: 'layla', name: 'Layla', element: 'cryo', imageUrl: 'https://i.imgur.com/9jxwKHv.png' },

  // Anemo Characters
  { id: 'jean', name: 'Jean', element: 'anemo', imageUrl: 'https://i.imgur.com/rGqypGr.png' },
  { id: 'venti', name: 'Venti', element: 'anemo', imageUrl: 'https://i.imgur.com/Ky6YSGF.png' },
  { id: 'sucrose', name: 'Sucrose', element: 'anemo', imageUrl: 'https://i.imgur.com/eBCvBn4.png' },
  { id: 'xiao', name: 'Xiao', element: 'anemo', imageUrl: 'https://i.imgur.com/O7cLr8H.png' },
  { id: 'kazuha', name: 'Kazuha', element: 'anemo', imageUrl: 'https://i.imgur.com/L7HyLNP.png' },
  { id: 'sayu', name: 'Sayu', element: 'anemo', imageUrl: 'https://i.imgur.com/dZ0QdYE.png' },
  { id: 'heizou', name: 'Heizou', element: 'anemo', imageUrl: 'https://i.imgur.com/HNGiswO.png' },
  { id: 'faruzan', name: 'Faruzan', element: 'anemo', imageUrl: 'https://i.imgur.com/vC76ylF.png' },
  { id: 'wanderer', name: 'Wanderer', element: 'anemo', imageUrl: 'https://i.imgur.com/gNdl35F.png' },

  // Geo Characters
  { id: 'zhongli', name: 'Zhongli', element: 'geo', imageUrl: 'https://i.imgur.com/z2M9RpW.png' },
  { id: 'ningguang', name: 'Ningguang', element: 'geo', imageUrl: 'https://i.imgur.com/UriNICy.png' },
  { id: 'noelle', name: 'Noelle', element: 'geo', imageUrl: 'https://i.imgur.com/4RhLzx2.png' },
  { id: 'albedo', name: 'Albedo', element: 'geo', imageUrl: 'https://i.imgur.com/xVdUMQZ.png' },
  { id: 'itto', name: 'Arataki Itto', element: 'geo', imageUrl: 'https://i.imgur.com/1Jl3KBQ.png' },
  { id: 'gorou', name: 'Gorou', element: 'geo', imageUrl: 'https://i.imgur.com/7x1Ec5a.png' },
  { id: 'yunjin', name: 'Yun Jin', element: 'geo', imageUrl: 'https://i.imgur.com/5ZqhVHO.png' },

  // Dendro Characters
  { id: 'tighnari', name: 'Tighnari', element: 'dendro', imageUrl: 'https://i.imgur.com/Qj0M74r.png' },
  { id: 'collei', name: 'Collei', element: 'dendro', imageUrl: 'https://i.imgur.com/VvBhiXj.png' },
  { id: 'nahida', name: 'Nahida', element: 'dendro', imageUrl: 'https://i.imgur.com/HaRzHMa.png' },
  { id: 'baizhu', name: 'Baizhu', element: 'dendro', imageUrl: 'https://i.imgur.com/sLWdHG9.png' },
  { id: 'yaoyao', name: 'Yaoyao', element: 'dendro', imageUrl: 'https://i.imgur.com/GyQ0AFO.png' },
  { id: 'alhaitham', name: 'Alhaitham', element: 'dendro', imageUrl: 'https://i.imgur.com/HHDXJDg.png' },
  { id: 'kaveh', name: 'Kaveh', element: 'dendro', imageUrl: 'https://i.imgur.com/L9gg6JN.png' },
];

export const tierLabels = ['S', 'A', 'B', 'C', 'D'];

export const elements: Element[] = ['pyro', 'hydro', 'electro', 'cryo', 'anemo', 'geo', 'dendro'];

export const elementLabels: Record<Element, string> = {
  pyro: 'Pyro',
  hydro: 'Hydro',
  electro: 'Electro',
  cryo: 'Cryo',
  anemo: 'Anemo',
  geo: 'Geo',
  dendro: 'Dendro'
};
