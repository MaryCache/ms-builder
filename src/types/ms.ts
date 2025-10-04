// src/types/ms.ts
export type MsType = 'F' | 'S' | 'E';

export interface Weapon {
  id: string;
  name: string;
  weight: number; // 単体重量
  // 将来: range, dmg, category 等
}

export interface LoadoutItem {
  weaponId: string;
  count: number;
}

export interface Machine {
  name: string;
  type: MsType;
  TLv: number;
  mobility: number; // 機動
  armor: number;    // 装甲
  load: number;     // 積載
  loadout: LoadoutItem[];
}
