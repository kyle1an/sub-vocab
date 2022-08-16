<script setup lang="ts">
import { PropType, computed, ref, watch } from 'vue'
import { useElementBounding } from '@vueuse/core'

const emit = defineEmits(['input'])
const props = defineProps({
  'default': { type: Number, default: 0 },
  'name': { type: String, default: '' },
  'segments': { type: Array as PropType<string[]>, default: () => [''] },
})
watch(() => props.default, (id) => {
  selectedId.value = id
})
const selectedId = ref(props.default)
watch(selectedId, (id) => emit('input', id))

const pill = ref()
const { width } = useElementBounding(pill)
const pillName = `${props.name}-prev-pill-width`
const pillWidth = ref(props.name ? +(sessionStorage.getItem(pillName) || 0) : 0)
const pillTransformStyles = computed(() => `transform:translateX(${pillWidth.value * selectedId.value}px)`)
watch(width, (w) => {
  pillWidth.value = w
  sessionStorage.setItem(pillName, String(w))
})
</script>

<template>
  <div class="ffs-cv08 text-precision overflow-scrolling-touch m-0 box-border flex !touch-manipulation justify-center px-5 pt-3 pb-2 tracking-wide antialiased tap-transparent [&_*]:box-border">
    <div class="m-0 grid w-full select-none auto-cols-[1fr] grid-flow-col overflow-hidden rounded-[9px] border-0 bg-[#EFEFF0] p-0.5 leading-6 outline-none">
      <span
        ref="pill"
        :style="pillTransformStyles"
        class="z-[2] col-start-1 col-end-auto row-start-1 row-end-auto rounded-[7px] border-[.5px] border-black/[0.04] bg-white shadow-md transition-transform duration-300 ease-[ease] will-change-transform"
      />
      <div
        v-for="(title,index) of segments"
        :key="index"
        class="option relative cursor-pointer"
      >
        <input
          :id="index"
          v-model="selectedId"
          type="radio"
          :value="index"
          class="absolute inset-0 m-0 h-full w-full appearance-none border-0 p-0 opacity-0 outline-none"
        >
        <label
          :for="index"
          class="relative block cursor-[inherit] bg-transparent !p-0 px-[5vmin] text-center text-[14px]"
        >
          <span class="relative z-[2] flex justify-center text-black transition-all duration-200 ease-[ease] will-change-transform">{{ title }}</span>
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

input:checked {
  + label {
    cursor: default;

    &::before,
    &::after {
      background: rgba(239, 239, 240, 1);
      z-index: 1;
    }

    span {
      font-weight: 500;
    }
  }
}
</style>
