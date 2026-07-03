export type Category = 'hair' | 'top' | 'bottom' | 'outer' | 'socks' | 'shoes';

export interface Item {
  id: string;
  name: string;
  category: Category;
  rarity: number; // 1-3 stars
  color: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  visualType: 'hockey' | 'skeleton' | 'potato' | 'himalaya';
}

export type Inventory = Record<string, number>; // ItemID -> Count
export type Wardrobe = Record<Category, string | null>; // Category -> ItemID (equipped)
