<template>
  <main class="container py-6 space-y-6">
    <h1 class="page-title">A.R.S - Armament Request Sheet</h1>

    <!-- ───────────────── STATUS ───────────────── -->
    <section class="card">
      <h2 class="h3">STATUS</h2>

      <!-- 名前 / Type / TLv -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-3">
        <!-- 名前 -->
        <label class="block">
          <span class="form-label">機体名</span>
          <input
            class="input-underline input-cyber italic mt-1"
            v-model="form.name"
            placeholder=""
          />
        </label>

        <!-- Type: F / S / E -->
        <div class="block">
          <span class="form-label">Type</span>
          <div class="mt-1 flex items-center gap-2">
            <button
              v-for="t in ['F','S','E']"
              :key="t"
              class="holo-badge cursor-pointer select-none transition active:scale-95"
              :class="typeClass(t)"
              @click="form.type = t"
              :title="typeDesc[t]"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <!-- TLv（大表示：TLv.数字） -->
        <div class="block text-center">
          <span class="form-label"></span>
          <div class="mt-1">
            <span
              class="text-5xl sm:text-6xl font-mono font-bold italic text-cyan-300 drop-shadow-glow select-none transition-all duration-300"
            >
              TLv.{{ tlv }}
            </span>
          </div>
        </div>
      </div>

      <!-- 数値入力：機動/装甲/積載 + ツールチップ -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <!-- 機動 -->
        <div
          class="group relative"
          @touchstart="press('mob')" @touchend="release"
          @mouseenter="hover('mob')" @mouseleave="release"
        >
          <span class="form-label">機動</span>
          <input
            type="number"
            min="0"
            class="input-underline input-cyber input-cyber-mono italic mt-1 no-spinner"
            v-model.number="form.mob"
            placeholder="0"
          />
          <!-- tooltip -->
          <div
            class="absolute z-10 hidden group-hover:block"
            :class="{ 'block': tipKey === 'mob' }"
            style="top:-0.5rem;left:0;"
          >
            <div class="rounded-lg px-3 py-2 bg-slate-900/95 border border-cyan-400/20 text-cyan-100 text-xs shadow-lg">
              機体の機動力を表すステータス。この値によって行動順が決まる。防御計算時にも回避行動として使用できる。
            </div>
          </div>
        </div>

        <!-- 装甲 -->
        <div
          class="group relative"
          @touchstart="press('arm')" @touchend="release"
          @mouseenter="hover('arm')" @mouseleave="release"
        >
          <span class="form-label">装甲</span>
          <input
            type="number"
            min="0"
            class="input-underline input-cyber input-cyber-mono italic mt-1 no-spinner"
            v-model.number="form.arm"
            placeholder="0"
          />
          <div
            class="absolute z-10 hidden group-hover:block"
            :class="{ 'block': tipKey === 'arm' }"
            style="top:-0.5rem;left:0;"
          >
            <div class="rounded-lg px-3 py-2 bg-slate-900/95 border border-cyan-400/20 text-cyan-100 text-xs shadow-lg">
              機体の装甲の厚さを表すステータス。防御計算時に使用される。
            </div>
          </div>
        </div>

        <!-- 積載 -->
        <div
          class="group relative"
          @touchstart="press('cap')" @touchend="release"
          @mouseenter="hover('cap')" @mouseleave="release"
        >
          <span class="form-label">積載</span>
          <input
            type="number"
            min="0"
            class="input-underline input-cyber input-cyber-mono italic mt-1 no-spinner"
            v-model.number="form.cap"
            placeholder="0"
          />
          <div
            class="absolute z-10 hidden group-hover:block"
            :class="{ 'block': tipKey === 'cap' }"
            style="top:-0.5rem;left:0;"
          >
            <div class="rounded-lg px-3 py-2 bg-slate-900/95 border border-cyan-400/20 text-cyan-100 text-xs shadow-lg">
              積載している物品の総重量を表すステータス。
(装備WEAPON総重量)+(装甲)=(積載)である。
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────────── JSON Preview ─────────────── -->
    <section class="card">
      <h2 class="h3">プレビュー</h2>
      <pre class="bg-slate-900 text-lime-400 rounded-lg p-3 overflow-auto text-sm">{{ jsonPreview }}</pre>
      <div class="mt-3">
        <button
          class="holo-badge cursor-pointer select-none hover:brightness-110 active:scale-95 transition
                 bg-lime-400/10 border-lime-300/40 text-lime-200 shadow-lg"
          @click="copyJson"
        >COPY</button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const form = reactive({
  name: '',
  type: 'E' as 'F' | 'S' | 'E',
  mob: 0,   // 機動
  arm: 0,   // 装甲
  cap: 0,   // 積載
})

// Type の説明
const typeDesc: Record<'F'|'S'|'E', string> = {
  F: '近距離戦を得意とする高機動型',
  S: '遠距離戦を得意とする射撃型',
  E: '扱いやすく継戦能力が高い汎用型',
}

// TLv = 機動 + 積載（負数ガード）
const tlv = computed(() => Math.max(0, (form.mob || 0) + (form.cap || 0)))

// Type ボタンのクラス（点灯色：F=赤 S=青 E=緑）
function typeClass(t: 'F'|'S'|'E') {
  const on =
    t === 'F'
      ? 'bg-rose-400/10 border-rose-300/40 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,.35)]'
      : t === 'S'
      ? 'bg-sky-400/10 border-sky-300/40 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,.35)]'
      : 'bg-emerald-400/10 border-emerald-300/40 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,.35)]'

  const off = 'bg-slate-700/30 border-slate-400/30 text-slate-300'
  return form.type === t ? on : off
}

/* ======= Tooltip（PC: hover / スマホ: 長押し） ======= */
const tipKey = ref<null | 'mob' | 'arm' | 'cap'>(null)
let pressTimer: number | null = null
function hover(key: 'mob'|'arm'|'cap') { tipKey.value = key }
function release() {
  tipKey.value = null
  if (pressTimer) { clearTimeout(pressTimer); pressTimer = null }
}
function press(key: 'mob'|'arm'|'cap') {
  if (pressTimer) clearTimeout(pressTimer)
  // 350ms 長押しで表示
  pressTimer = window.setTimeout(() => (tipKey.value = key), 350)
}

/* ======= JSON プレビュー & コピー ======= */
const jsonPreview = computed(() =>
  JSON.stringify(
    {
      機体: {
        名前: form.name,
        Type: form.type,
        TLv: tlv.value,
        機動: form.mob,
        装甲: form.arm,
        積載: form.cap,
      },
    },
    null,
    2
  )
)

function copyJson() {
  navigator.clipboard.writeText(jsonPreview.value).catch(() => {})
}
</script>
