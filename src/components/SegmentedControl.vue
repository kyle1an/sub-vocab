<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useElementBounding } from '@vueuse/core'
import { watched } from '@/composables/watch'

const {
  init = 0,
  name = '',
  segments = ['']
} = defineProps<{
  init: number,
  name: string,
  segments: string[],
}>()
const emit = defineEmits(['input'])
watch($$(init), (id) => selectedId = id)
let selectedId = $(watched(ref(init), (selectedId) => emit('input', selectedId)))
const pill = ref()
const pillName = `${name}-prev-pill-width`
let pillWidth = $ref(name ? +(sessionStorage.getItem(pillName) || 0) : 0)
const pillTransformStyles = computed(() => `transform:translateX(${pillWidth * selectedId}px)`)
const width = $(watched(useElementBounding(pill).width, (width) => {
  if (width === 0) return
  pillWidth = width
  sessionStorage.setItem(pillName, String(width))
}, { immediate: true }))
</script>

<template>
  <div class="text-precision overflow-scrolling-touch box-border flex !touch-manipulation px-5 pt-3 pb-2 tracking-wide antialiased tap-transparent ffs-['cv08'] [&_*]:box-border">
    <div class="grid w-full select-none auto-cols-[1fr] grid-flow-col overflow-hidden rounded-[9px] bg-[#EFEFF0] p-0.5 outline-none">
      <span
        ref="pill"
        :style="pillTransformStyles"
        class="z-10 col-start-1 col-end-auto row-start-1 row-end-auto rounded-[7px] border-[.5px] border-black/[0.04] bg-white shadow-md transition-transform duration-300 ease-[ease] will-change-transform"
      />
      <div
        v-for="(title,index) of segments"
        :key="index"
        class="option relative"
      >
        <input
          :id="index"
          v-model="selectedId"
          type="radio"
          :value="index"
          class="absolute inset-0 appearance-none opacity-0 outline-none [&+label]:checked:cursor-default [&+label_span]:checked:font-medium"
        >
        <label
          :for="index"
          class="relative block cursor-pointer bg-transparent text-center"
        >
          <span class="relative z-10 flex justify-center text-sm leading-6 text-black transition-all duration-200 ease-[ease] will-change-transform">{{ title }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.option {
  &:hover,
  &:active,
  &:focus {
    input:not(:checked) + label span {
      opacity: .2;
    }
  }

  &:active {
    input:not(:checked) + label span {
      transform: scale(.95);
    }
  }

  &:first-of-type {
    grid-column: 1;
    grid-row: 1;
    box-shadow: none;
  }

  &:first-of-type label::before,
  &:last-of-type label::after {
    opacity: 0;
  }
}

label {
  &::before,
  &::after {
    content: '';
    width: 1px;
    background: rgba(142, 142, 147, .15);
    position: absolute;
    top: 14%;
    bottom: 14%;
    border-radius: 10px;
    will-change: background;
    transition: background .2s ease;
  }

  &::before {
    left: 0;
    transform: translateX(-.5px);
  }

  &::after {
    right: 0;
    transform: translateX(.5px);
  }
}

input:checked + label {
  &::before,
  &::after {
    background: rgba(239, 239, 240, 1);
    z-index: 1;
  }
}
</style>
