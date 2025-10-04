// src/stores/useMsStore.ts
import { defineStore } from 'pinia'
import type { Machine, MsType, Weapon } from '@/types/ms'

const seedWeapons: Weapon[] = [
  { id: 'beam-rifle', name: 'ビーム・ライフル', weight: 2 },
  { id: 'beam-saber', name: 'ビーム・サーベル', weight: 1 },
  { id: 'bazooka',    name: 'バズーカ',         weight: 3 },
]

export const useMsStore = defineStore('ms', {
  state: () => ({
    ms: <Machine>{
      name: '',
      type: 'E' as MsType,
      TLv: 6,
      mobility: 3,
      armor: 1,
      load: 3,
      loadout: [],
    },
    weapons: seedWeapons as Weapon[],
  }),
  getters: {
    totalWeaponWeight(state): number {
      return state.ms.loadout.reduce((sum, i) => {
        const w = state.weapons.find(w => w.id === i.weaponId)
        return sum + (w ? w.weight * i.count : 0)
      }, 0)
    },
    checkMobilityLoad(state): number {
      return state.ms.mobility + state.ms.load - state.ms.TLv
    },
    checkArmorPayload(): number {
      return this.ms.armor + this.totalWeaponWeight - this.ms.load
    },
    isValid(): boolean {
      return this.checkMobilityLoad === 0 && this.checkArmorPayload === 0
    },
  },
  actions: {
    setType(t: MsType) { this.ms.type = t },
    setTLv(v: number)  { this.ms.TLv = Math.max(0, Math.floor(v || 0)) },
    setMobility(v: number) { this.ms.mobility = Math.max(0, Math.floor(v || 0)) },
    setArmor(v: number)    { this.ms.armor    = Math.max(0, Math.floor(v || 0)) },
    setLoad(v: number)     { this.ms.load     = Math.max(0, Math.floor(v || 0)) },

    addWeapon(weaponId: string) {
      const it = this.ms.loadout.find(i => i.weaponId === weaponId)
      if (it) it.count++
      else this.ms.loadout.push({ weaponId, count: 1 })
    },
    subWeapon(weaponId: string) {
      const it = this.ms.loadout.find(i => i.weaponId === weaponId)
      if (!it) return
      it.count--
      if (it.count <= 0) this.ms.loadout = this.ms.loadout.filter(i => i.weaponId !== weaponId)
    },
    resetAll() {
      this.ms = { name:'', type:'E', TLv:6, mobility:3, armor:1, load:3, loadout: [] }
    },
  }
})
