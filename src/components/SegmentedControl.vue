<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementBounding } from '@vueuse/core'

const {
  value = '',
  name = '',
  segments = [{ value: '', label: '' }],
  onChoose
} = defineProps<{
  value: string,
  name: string,
  segments: { value: string, label: string }[],
  onChoose: (arg: string) => void
}>()
const pill = ref()
const { width } = $(useElementBounding(pill))
const pillWidth = computed(() => {
  if (width === 0) return name ? +(sessionStorage.getItem(name) || 0) : 0
  name && sessionStorage.setItem(name, String(width))
  return width
})
</script>

<template>
  <div class="text-precision overflow-scrolling-touch box-border flex !touch-manipulation px-5 pt-3 pb-2 tracking-wide antialiased tap-transparent ffs-['cv08'] [&_*]:box-border">
    <div class="grid w-full select-none auto-cols-[1fr] grid-flow-col overflow-hidden rounded-[9px] bg-[#EFEFF0] p-0.5 outline-none">
      <span
        ref="pill"
        :style="{transform:`translateX(${pillWidth * segments.findIndex((seg) => seg.value === value)}px)`}"
        class="z-10 col-start-1 col-end-auto row-start-1 row-end-auto rounded-[7px] border-[.5px] border-black/[0.04] bg-white shadow-md transition-transform duration-300 ease-[ease] will-change-transform"
      />
      <div
        v-for="(item,index) of segments"
        :key="index"
        class="option relative"
      >
        <input
          :id="item.value"
          type="radio"
          :value="item.value"
          :checked="item.value===value"
          class="absolute inset-0 appearance-none opacity-0 outline-none [&+label]:checked:cursor-default [&+label_span]:checked:font-medium"
          @input="(ev)=>onChoose(ev.target.value)"
        >
        <label
          :for="item.value"
          class="relative block cursor-pointer bg-transparent text-center"
        >
          <span class="relative z-10 flex justify-center text-sm leading-6 text-black transition-all duration-200 ease-[ease] will-change-transform">{{ item.label }}</span>
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
