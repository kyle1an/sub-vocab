<script setup lang="ts">
import { Ref } from 'vue'

const emit = defineEmits(['input'])
const props = defineProps(['segments'])
const segments: Ref<string[]> = computed(() => props.segments)
const selectedSegmentWidth = ref(0);
const defaultIndex = 0
const selectedId = ref(defaultIndex)
onMounted(() => {
  window.addEventListener('resize', recalculateSelectedSegmentWidth);
  setTimeout(function showPill() {
    selectedSegmentWidth.value = calcSegmentWidth(selectedId.value);
    document.getElementsByClassName('selection')[0].classList.remove('hidden');
  }, 0)
  emit('input', selectedSegmentIndex.value);
})

watch(selectedId, function toggleSectionFontWeight(v, o) {
  document.querySelector(`[for="${o}"]`)!.classList.remove('font-medium');
  document.querySelector(`[for="${v}"]`)!.classList.add('font-medium');
})

function recalculateSelectedSegmentWidth() {
  nextTick(() => selectedSegmentWidth.value = calcSegmentWidth(selectedId.value));
}

function calcSegmentWidth(id: number) {
  return document.querySelector(`input[type='radio'][value='${id}']`)!.getBoundingClientRect().width;
}

const selectedSegmentIndex = computed({
  get: () => selectedId.value,
  set: (segmentId) => {
    selectedId.value = segmentId;
    emit('input', selectedSegmentIndex.value);
  }
})
const pillTransformStyles = computed(() => `transform:translateX(${selectedSegmentWidth.value * selectedSegmentIndex.value}px)`)
onBeforeUnmount(() => window.removeEventListener('resize', recalculateSelectedSegmentWidth))
</script>

<template>
  <main class="flex justify-center m-0 px-5 pt-3 pb-2 font-sans antialiased !touch-manipulation">
    <div class="w-full grid grid-flow-col auto-cols-[1fr] bg-[#EFEFF0] leading-6 m-0 p-0.5 border-0 rounded-[9px] overflow-hidden select-none outline-none">
      <span :style="pillTransformStyles" class="selection border-[.5px] border-black/[0.04] rounded-[7px] bg-white z-[2] will-change-transform col-start-1 col-end-auto row-start-1 row-end-auto" />
      <div v-for="(title,index) of segments" :key="index" class="option relative cursor-pointer">
        <input
          type="radio"
          :id="index"
          :value="index"
          v-model="selectedSegmentIndex"
          class="absolute inset-0 w-full h-full opacity-0 m-0 p-0 border-0 appearance-none"
        >
        <label :for="index" class="block text-center relative !p-0 px-[5vmin] text-[14px] bg-transparent cursor-[inherit]">
          <span class="flex relative justify-center z-[2] will-change-transform">{{ title }}</span>
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
    color: rgba(0, 0, 0, 1);

    span {
      -webkit-transition: all .2s ease;
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
    -webkit-transition: background .2s ease;
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

  input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    outline: none;
  }

  input:checked {
    + label {
      cursor: default;
    }

    + label::before,
    + label::after {
      --background: rgba(239, 239, 240, 1);
      background: var(--background);
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
  -webkit-transition: transform .2s ease;
  transition: transform .2s ease;
}
</style>
