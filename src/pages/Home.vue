<!-- src/pages/MsBuilder.vue -->
<template>
  <main class="container py-6 space-y-6">
    <h1 class="page-title">機体作成</h1>

    <!-- ヘッダ -->
    <section class="card">
      <h2 class="h3">基本情報</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-3">
        <label class="block">
          <span class="form-label">機体名</span>
          <input class="input-underline input-cyber mt-1" v-model="ms.name" placeholder="例：RX-78-2"/>
        </label>
        <label class="block">
          <span class="form-label">Type</span>
          <select class="input-underline mt-1" v-model="ms.type">
            <option value="F">F（近接得意）</option>
            <option value="S">S（遠距離得意）</option>
            <option value="E">E（扱いやすい）</option>
          </select>
        </label>
        <label class="block">
          <span class="form-label">TLv</span>
          <input type="number" class="input-underline no-spinner mt-1" v-model.number="ms.TLv" min="0"/>
        </label>
      </div>
    </section>

    <!-- STATUS -->
    <section class="card">
      <div class="flex items-center justify-between mb-3">
        <h2 class="h3">─=≡STATUS≡=─</h2>

        <!-- 不一致なら danger -->
        <div class="flex gap-2">
          <span class="holo-badge" :class="{ danger: checkMobilityLoad!==0 }">
            機動+積載 − TLv：{{ signed(checkMobilityLoad) }}
          </span>
          <span class="holo-badge" :class="{ danger: checkArmorPayload!==0 }">
            装甲+武装 − 積載：{{ signed(checkArmorPayload) }}
          </span>
        </div>
      </div>

      <div class="divide-y divide-cyan-400/10">
        <StatRow label="機動">
          <StatTrack :value="ms.mobility" @set="setMobility" :max="ms.TLv"/>
        </StatRow>
        <StatRow label="装甲">
          <StatTrack :value="ms.armor" @set="setArmor" :max="ms.TLv"/>
        </StatRow>
        <StatRow label="積載">
          <StatTrack :value="ms.load" @set="setLoad" :max="ms.TLv"/>
        </StatRow>
      </div>
    </section>

    <!-- 武装 -->
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="h3">WEAPON</h2>
        <span class="holo-badge">総重量：{{ totalWeaponWeight }}</span>
      </div>

      <div class="grid md:grid-cols-2 gap-4 mt-3">
        <!-- カタログ -->
        <div>
          <div class="h4 mb-2">カタログ</div>
          <div class="space-y-2">
            <div v-for="w in weapons" :key="w.id" class="flex items-center justify-between">
              <div class="text-cyan-100">{{ w.name }} <span class="text-xs text-cyan-200/70">({{ w.weight }})</span></div>
              <button class="holo-badge cursor-pointer" @click="addWeapon(w.id)">ADD</button>
            </div>
          </div>
        </div>

        <!-- 搭載中 -->
        <div>
          <div class="h4 mb-2">搭載中</div>
          <div v-if="ms.loadout.length===0" class="text-cyan-300/60 text-sm">未搭載</div>
          <div v-else class="space-y-2">
            <div v-for="it in ms.loadout" :key="it.weaponId" class="flex items-center justify-between">
              <div>
                <span class="text-cyan-100">{{ getWeapon(it.weaponId)?.name }}</span>
                <span class="text-xs text-cyan-200/70">
                  × {{ it.count }}（{{ (getWeapon(it.weaponId)?.weight ?? 0) * it.count }}）
                </span>
              </div>
              <div class="flex gap-2">
                <button class="holo-badge" @click="subWeapon(it.weaponId)">−</button>
                <button class="holo-badge" @click="addWeapon(it.weaponId)">＋</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- プレビュー & リセット -->
    <section class="card">
      <h2 class="h3 mb-3">プレビュー</h2>
      <pre class="bg-slate-900 text-lime-400 rounded-lg p-3 overflow-auto text-sm">{{ exportJson }}</pre>
      <div class="mt-3 flex gap-2">
        <button
          class="holo-badge cursor-pointer select-none bg-lime-400/10 border-lime-300/40 text-lime-200"
          @click="copyJson"
        >COPY</button>

        <button
          class="holo-badge danger cursor-pointer select-none"
          @click="resetAll"
        >RESET</button>
      </div>
    </section>

    <!-- 浮遊バッジ -->
    <div class="fixed z-50 bottom-4 right-4 pointer-events-none print:hidden">
      <div class="pointer-events-auto holo-badge" :class="{ danger: !isValid }">
        バランス：{{ isValid ? 'OK' : 'NG' }}
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMsStore } from '@/stores/useMsStore'
import StatTrack from '@/pages/_StatTrack.vue'   // 既存のゲージを流用
import StatRow   from '@/pages/_StatRow.vue'     // ラベル行のラッパ（既存流用）

const s = useMsStore()
const ms = computed(() => s.ms)
const weapons = computed(() => s.weapons)

const totalWeaponWeight = computed(() => s.totalWeaponWeight)
const checkMobilityLoad = computed(() => s.checkMobilityLoad)
const checkArmorPayload = computed(() => s.checkArmorPayload)
const isValid = computed(() => s.isValid)

const setMobility = (v:number) => s.setMobility(v)
const setArmor    = (v:number) => s.setArmor(v)
const setLoad     = (v:number) => s.setLoad(v)

const addWeapon = (id:string) => s.addWeapon(id)
const subWeapon = (id:string) => s.subWeapon(id)
const getWeapon = (id:string) => weapons.value.find(w => w.id === id)

const exportJson = computed(() => JSON.stringify({
  機体名: ms.value.name, Type: ms.value.type, TLv: ms.value.TLv,
  ステータス: { 機動: ms.value.mobility, 装甲: ms.value.armor, 積載: ms.value.load },
  武装: ms.value.loadout.map(i => ({
    名称: getWeapon(i.weaponId)?.name ?? i.weaponId,
    個数: i.count,
    重量合計: (getWeapon(i.weaponId)?.weight ?? 0) * i.count
  })),
}, null, 2))

function copyJson(){ navigator.clipboard.writeText(exportJson.value).catch(()=>{}) }
function resetAll(){ s.resetAll() }
function signed(n:number){ return n>0?`+${n}`:`${n}` }
</script>
