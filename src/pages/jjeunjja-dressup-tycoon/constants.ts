
import { Character, Item, Category } from './types';

export const CATEGORIES: Category[] = ['hair', 'top', 'bottom', 'outer', 'socks', 'shoes'];

export const CATEGORY_LABELS: Record<Category, string> = {
  hair: '머리카락',
  top: '윗도리',
  bottom: '하의',
  outer: '잠바',
  socks: '양말',
  shoes: '신발',
};

export const CHARACTERS: Character[] = [
  {
    id: 'derek',
    name: '데릭',
    description: '*노출증 주의* 하키채를 들고 서 있음',
    visualType: 'hockey',
  },
  {
    id: 'eric',
    name: '에릭',
    description: '뼈다귀만 남아있음',
    visualType: 'skeleton',
  },
  {
    id: 'brody',
    name: '브로디',
    description: '*데릭과 비슷함*(머리가 감자임)',
    visualType: 'potato',
  },
  {
    id: 'peter',
    name: '피터',
    description: '히말라야 롱패딩 (눈사람 수준)',
    visualType: 'himalaya',
  },
];

const generateItems = (): Item[] => {
  const items: Item[] = [];
  CATEGORIES.forEach((cat) => {
    // Generate 30 distinct colors for this category by iterating through the hue spectrum
    for (let i = 1; i <= 30; i++) {
        // Hue: 0 to 360
        const hue = Math.floor(((i - 1) / 30) * 360);
        // Saturation: 60-90% for vibrancy
        const saturation = 60 + (i % 4) * 10;
        // Lightness: 40-70% to ensure visible against white/black but not too pale/dark
        const lightness = 40 + (i % 3) * 15;
        
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      items.push({
        id: `${cat}-${i}`,
        name: `${CATEGORY_LABELS[cat]} #${i}`,
        category: cat,
        rarity: Math.ceil(Math.random() * 3),
        color: color,
      });
    }
  });
  return items;
};

export const ALL_ITEMS = generateItems();
export const ITEMS_PER_CATEGORY = 30;
