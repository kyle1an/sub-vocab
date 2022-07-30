<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const emit = defineEmits(['input'])
const props = defineProps({
  'default': { type: Number, default: 0 },
  'segments': { type: Array, default: () => [''] },
})
const selectedSegmentWidth = ref(0)
const selectedId = ref(props.default)
onMounted(() => {
  emboldenSelectedTitle(selectedId.value)
  setTimeout(() => {
    recalculateSelectedSegmentWidth()
  }, 1000)
})
window.addEventListener('resize', recalculateSelectedSegmentWidth)
watch(() => props.default, (v) => {
  selectedId.value = v
})
watch(selectedId, (v, o) => emboldenSelectedTitle(v, o))

function emboldenSelectedTitle(v: any, o?: any) {
  emit('input', v)
  document.querySelector(`[for="${o}"]`)?.classList?.remove('font-medium')
  document.querySelector(`[for="${v}"]`)?.classList?.add('font-medium')
}

function recalculateSelectedSegmentWidth() {
  selectedSegmentWidth.value = document.querySelector(`input[type='radio'][value='${selectedId.value}']`)!.getBoundingClientRect().width
}

const pillTransformStyles = computed(() => `transform:translateX(${selectedSegmentWidth.value * selectedId.value}px)`)
onBeforeUnmount(() => window.removeEventListener('resize', recalculateSelectedSegmentWidth))
</script>

<template>
  <main class="font-sans	m-0 flex !touch-manipulation justify-center px-5 pt-3 pb-2 antialiased">
    <div class="m-0 grid w-full select-none auto-cols-[1fr] grid-flow-col overflow-hidden rounded-[9px] border-0 bg-[#EFEFF0] p-0.5 leading-6 outline-none">
      <span
        :style="pillTransformStyles"
        class="selection z-[2] col-start-1 col-end-auto row-start-1 row-end-auto rounded-[7px] border-[.5px] border-black/[0.04] bg-white will-change-transform"
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
          <span class="relative z-[2] flex	justify-center text-black will-change-transform">{{ title }}</span>
        </label>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
main {
  text-rendering: geometricPrecision;
  -webkit-overflow-scrolling: touch !important;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-feature-settings: 'cv08';
}

* {
  box-sizing: border-box;
}

.option:hover,
.option:active,
.option:focus {
  input:not(:checked) + label span {
    opacity: .2;
  }
}

.option:active input:not(:checked) + label span {
  transform: scale(.95);
}

.option {
  label {
    span {
      transition: all .2s ease;
    }
  }

  label::before,
  label::after {
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

  label::before {
    left: 0;
    transform: translateX(-.5px);
  }

  label::after {
    right: 0;
    transform: translateX(.5px);
  }

  input:checked {
    + label {
      cursor: default;
    }

    + label::before,
    + label::after {
      background: rgba(239, 239, 240, 1);
      z-index: 1;
    }
  }
}

.option:first-of-type {
  grid-column: 1;
  grid-row: 1;
  box-shadow: none;
}

.option:first-of-type label::before,
.option:last-of-type label::after {
  opacity: 0;
}

.selection {
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.12), 0 3px 1px 0 rgba(0, 0, 0, 0.04);
  transition: transform .2s ease;
}
</style>
