export type Element = 'pyro' | 'hydro' | 'electro' | 'cryo' | 'anemo' | 'geo' | 'dendro';

export type Rarity = 4 | 5;

export type Character = {
  id: string;
  name: string;
  element: Element;
  imageUrl: string;
  rarity: Rarity;
};

// Updated character list with new image URLs and rarity values
export const characters: Character[] = [
  // Pyro Characters
  { id: 'diluc', name: 'Diluc', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/dilucicon-1.png', rarity: 5 },
  { id: 'klee', name: 'Klee', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/2-klee.png', rarity: 5 },
  { id: 'hutao', name: 'Hu Tao', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/8-hutaoicon.png', rarity: 5 },
  { id: 'xiangling', name: 'Xiangling', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/xianglingicon.png', rarity: 4 },
  { id: 'bennett', name: 'Bennett', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/bennetticon.png', rarity: 4 },
  { id: 'amber', name: 'Amber', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/ambericon.png', rarity: 4 },
  { id: 'xinyan', name: 'Xinyan', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/xinyanicon.png', rarity: 4 },
  { id: 'yanfei', name: 'Yanfei', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/yanfeiicon.png', rarity: 4 },
  { id: 'yoimiya', name: 'Yoimiya', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/12-yoimiyaicon.png', rarity: 5 },
  { id: 'thoma', name: 'Thoma', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/thomaicon.png', rarity: 4 },
  { id: 'dehya', name: 'Dehya', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/dehyaicon.png', rarity: 5 },
  { id: 'lyney', name: 'Lyney', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/26-lyneyicon.png', rarity: 5 },
  { id: 'arlecchino', name: 'Arlecchino', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/33-arlecchinoicon.png', rarity: 5 },
  { id: 'mavuika', name: 'Mavuika', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/42-mavuikaicon.png', rarity: 5 },
  { id: 'gaming', name: 'Gaming', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/gamingicon.png', rarity: 4 },

  // Hydro Characters
  { id: 'mona', name: 'Mona', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/monaicon.png', rarity: 5 },
  { id: 'xingqiu', name: 'Xingqiu', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/xingqiuicon.png', rarity: 4 },
  { id: 'barbara', name: 'Barbara', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/barbaraicon.png', rarity: 4 },
  { id: 'tartaglia', name: 'Tartaglia', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/3-tartaglia.png', rarity: 5 },
  { id: 'kokomi', name: 'Kokomi', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/14-sangonomiyakokomiicon.png', rarity: 5 },
  { id: 'ayato', name: 'Ayato', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/18-kamisatoayatoicon.png', rarity: 5 },
  { id: 'yelan', name: 'Yelan', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/19-yelanicon.png', rarity: 5 },
  { id: 'candace', name: 'Candace', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/candaceicon.png', rarity: 4 },
  { id: 'nilou', name: 'Nilou', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/21-nilouicon.png', rarity: 5 },
  { id: 'neuvillette', name: 'Neuvillette', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/27-neuvilletteicon.png', rarity: 5 },
  { id: 'furina', name: 'Furina', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/29-furinaicon.png', rarity: 5 },
  { id: 'sigewinne', name: 'Sigewinne', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/35-sigewinneicon.png', rarity: 5 },
  { id: 'mualani', name: 'Mualani', element: 'hydro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/37-mualaniicon.png', rarity: 5 },

  // Electro Characters
  { id: 'keqing', name: 'Keqing', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/keqingicon.png', rarity: 5 },
  { id: 'fischl', name: 'Fischl', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/fischlicon.png', rarity: 4 },
  { id: 'beidou', name: 'Beidou', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/beidouicon.png', rarity: 4 },
  { id: 'razor', name: 'Razor', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/razoricon.png', rarity: 4 },
  { id: 'lisa', name: 'Lisa', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/lisaicon.png', rarity: 4 },
  { id: 'raiden', name: 'Raiden Shogun', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/13-raidenshogunicon.png', rarity: 5 },
  { id: 'sara', name: 'Kujou Sara', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/kujousaraicon.png', rarity: 4 },
  { id: 'yae', name: 'Yae Miko', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/17-yaemikoicon.png', rarity: 5 },
  { id: 'shinobu', name: 'Kuki Shinobu', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/kukishinobuicon.png', rarity: 4 },
  { id: 'cyno', name: 'Cyno', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/20-cynoicon.png', rarity: 5 },
  { id: 'dori', name: 'Dori', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/doriicon.png', rarity: 4 },
  { id: 'clorinde', name: 'Clorinde', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/34-clorindeicon.png', rarity: 5 },
  { id: 'sethos', name: 'Sethos', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/sethosicon.png', rarity: 4 },
  { id: 'ororon', name: 'Ororon', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/ororonicon.png', rarity: 4 },
  { id: 'varesa', name: 'Varesa', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/43-varesaicon.png', rarity: 5 },
  { id: 'iansan', name: 'Iansan', element: 'electro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/iansanicon.png', rarity: 4 },
  
  // Cryo Characters
  { id: 'qiqi', name: 'Qiqi', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/qiqiicon.png', rarity: 5 },
  { id: 'ganyu', name: 'Ganyu', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/6-ganyu.png', rarity: 5 },
  { id: 'diona', name: 'Diona', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/dionaicon.png', rarity: 4 },
  { id: 'kaeya', name: 'Kaeya', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/kaeyaicon.png', rarity: 4 },
  { id: 'chongyun', name: 'Chongyun', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/chongyunicon.png', rarity: 4 },
  { id: 'rosaria', name: 'Rosaria', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/rosariaicon.png', rarity: 4 },
  { id: 'ayaka', name: 'Ayaka', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/11-kamisatoayakaicon.png', rarity: 5 },
  { id: 'eula', name: 'Eula', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/9-eulaicon.png', rarity: 5 },
  { id: 'shenhe', name: 'Shenhe', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/16-shenheicon.png', rarity: 5 },
  { id: 'layla', name: 'Layla', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/laylaicon.png', rarity: 4 },
  { id: 'mika', name: 'Mika', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/mikaicon.png', rarity: 4 },
  { id: 'wriothesley', name: 'Wriothesley', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/28-wriothesleyicon.png', rarity: 5 },
  { id: 'charlotte', name: 'Charlotte', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/charlotteicon.png', rarity: 4 },
  { id: 'citlali', name: 'Citlali', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/41-citlaliicon.png', rarity: 5 },

  // Anemo Characters
  { id: 'jean', name: 'Jean', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/jeanicon.png', rarity: 5 },
  { id: 'venti', name: 'Venti', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/1-venti.png', rarity: 5 },
  { id: 'sucrose', name: 'Sucrose', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/sucroseicon.png', rarity: 4 },
  { id: 'xiao', name: 'Xiao', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/7-xiao.png', rarity: 5 },
  { id: 'kazuha', name: 'Kazuha', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/10-kaedeharakazuhaicon.png', rarity: 5 },
  { id: 'sayu', name: 'Sayu', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/sayuicon.png', rarity: 4 },
  { id: 'heizou', name: 'Heizou', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/shikanoinheizouicon.png', rarity: 4 },
  { id: 'faruzan', name: 'Faruzan', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/faruzanicon.png', rarity: 4 },
  { id: 'wanderer', name: 'Wanderer', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/23-wanderericon.png', rarity: 5 },
  { id: 'freminet', name: 'Freminet', element: 'cryo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/fremineticon.png', rarity: 4 },
  { id: 'lynette', name: 'Lynette', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/lynetteicon.png', rarity: 4 },
  { id: 'xianyun', name: 'Xianyun', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/31-xianyunicon.png', rarity: 5 },
  { id: 'chasca', name: 'Chasca', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/40-chascaicon.png', rarity: 5 },
  { id: 'lanyan', name: 'Lanyan', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/lanyanicon.png', rarity: 4 },
  { id: 'yumemizuki', name: 'Yumemizuki Mizuki', element: 'anemo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/yumemizukimizukiicon.png', rarity: 5 },

  // Geo Characters
  { id: 'zhongli', name: 'Zhongli', element: 'geo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/4-zhongli.png', rarity: 5 },
  { id: 'ningguang', name: 'Ningguang', element: 'geo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/ningguangicon.png', rarity: 4 },
  { id: 'noelle', name: 'Noelle', element: 'geo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/noelleicon.png', rarity: 4 },
  { id: 'albedo', name: 'Albedo', element: 'geo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/5-albedo.png', rarity: 5 },
  { id: 'itto', name: 'Arataki Itto', element: 'geo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/15-aratakiittoicon.png', rarity: 5 },
  { id: 'gorou', name: 'Gorou', element: 'geo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/gorouicon.png', rarity: 4 },
  { id: 'yunjin', name: 'Yun Jin', element: 'geo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/yunjinicon.png', rarity: 4 },
  { id: 'navia', name: 'Navia', element: 'geo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/30-naviaicon.png', rarity: 5 },
  { id: 'chevreuse', name: 'Chevreuse', element: 'pyro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/chevreuseicon.png', rarity: 4 },
  { id: 'xilonen', name: 'Xilonen', element: 'geo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/39-xilonenicon.png', rarity: 5 },
  { id: 'chiori', name: 'Chiori', element: 'geo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/32-chioriicon.png', rarity: 5 },
  { id: 'kachina', name: 'Kachina', element: 'geo', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/kachinaicon.png', rarity: 4 },

  // Dendro Characters
  { id: 'tighnari', name: 'Tighnari', element: 'dendro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/tighnariicon.png', rarity: 5 },
  { id: 'collei', name: 'Collei', element: 'dendro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/colleiicon.png', rarity: 4 },
  { id: 'nahida', name: 'Nahida', element: 'dendro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/22-nahidaicon.png', rarity: 5 },
  { id: 'baizhu', name: 'Baizhu', element: 'dendro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/25-baizhuicon.png', rarity: 5 },
  { id: 'yaoyao', name: 'Yaoyao', element: 'dendro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/yaoyaoicon.png', rarity: 4 },
  { id: 'alhaitham', name: 'Alhaitham', element: 'dendro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/24-alhaithamicon.png', rarity: 5 },
  { id: 'kaveh', name: 'Kaveh', element: 'dendro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/kavehicon.png', rarity: 4 },
  { id: 'kirara', name: 'Kirara', element: 'dendro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/kiraraicon.png', rarity: 4 },
  { id: 'kinich', name: 'Kinich', element: 'dendro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/38-kinichicon.png', rarity: 5 },
  { id: 'emilie', name: 'Emilie', element: 'dendro', imageUrl: 'https://tiermaker.com/images/media/template_images/2024/17537194/genshin-impact--all-playable-character-17537194-2/36-emilieicon.png', rarity: 5 },
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
