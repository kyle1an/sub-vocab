<template>
  <main>
    <div class="ios13-segmented-control leading-6">
      <span class="selection" :style="pillTransformStyles"></span>
      <div v-for="segment of segments" :key="segment.id" class="option">
        <input type="radio"
               :id="segment.id"
               :value="segment.id"
               v-model="selectedSegmentId">
        <label :for="segment.id" class="w-24">
          <span class="flex justify-center">{{ segment.title }}</span>
        </label>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: "segmented-control",
  props: {
    value: {
      required: true,
      type: [Number, String]
    },
    segments: {
      required: true,
      type: Array
    },
  },
  data() {
    return {
      selectedSegmentWidth: 0,
      selected: 0,
    };
  },

  computed: {
    selectedSegmentId: {
      get() {
        return this.selected;
      },
      set(segmentId) {
        this.selected = segmentId;
        this.setBold()
        this.$emit("input", segmentId);
      }
    },
    selectedSegmentIndex() {
      return this.segments.findIndex(segment => segment.id === this.selected);
    },
    pillTransformStyles() {
      return 'transform:translateX(' + (this.selectedSegmentWidth * this.selectedSegmentIndex) + 'px)';
    },
  },

  mounted() {
    this.selected = this.value
    this.setBold()
    window.addEventListener('resize', this.recalculateSelectedSegmentWidth);
    const segmentElement = document.querySelector(`input[type='radio'][value='${this.value}']`);
    this.selectedSegmentWidth = segmentElement && segmentElement.offsetWidth;
  },

  methods: {
    recalculateSelectedSegmentWidth() {
      // Wait for UI to rerender before measuring
      this.$nextTick(() => {
        const segmentElement = document.querySelector(`input[type='radio'][value='${this.value}']`);
        this.selectedSegmentWidth = segmentElement && segmentElement.offsetWidth;
      })
    },
    setBold(select = this.selected) {
      document.querySelectorAll('.font-medium').forEach(e => e.classList.remove('font-medium'))
      document.querySelector(`[for="${select}"]`).classList.add('font-medium');
    },
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.recalculateSelectedSegmentWidth);
  },
}
</script>

<style lang="scss" scoped>
main {
  height: 100%;
  margin: 0;
  padding: 0;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-overflow-scrolling: touch !important;
  touch-action: manipulation !important;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  display: flex;
  justify-content: center;
  font-feature-settings: 'cv08';
}

* {
  box-sizing: border-box;
}

label {
  cursor: inherit;
}

.ios13-segmented-control {
  --background: rgba(239, 239, 240, 1);
  background: var(--background);
  border-radius: 9px;
  margin: 0;
  padding: 2px;
  border: none;
  outline: none;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.ios13-segmented-control .option {
  position: relative;
  cursor: pointer;
}

.ios13-segmented-control .option:hover input:not(:checked) + label span,
.ios13-segmented-control .option:active input:not(:checked) + label span,
.ios13-segmented-control .option:focus input:not(:checked) + label span {
  opacity: .2;
}

.ios13-segmented-control .option:active input:not(:checked) + label span {
  transform: scale(.95);
}

.ios13-segmented-control .option label {
  position: relative;
  display: block;
  text-align: center;
  padding: 0 5vmin;
  background: rgba(255, 255, 255, 0);
  //font-weight: 400;
  color: rgba(0, 0, 0, 1);
  font-size: 14px;
}

.ios13-segmented-control .option label::before,
.ios13-segmented-control .option label::after {
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

.ios13-segmented-control .option label::before {
  left: 0;
  transform: translateX(-.5px);
}

.ios13-segmented-control .option label::after {
  right: 0;
  transform: translateX(.5px);
}

.ios13-segmented-control .option:first-of-type {
  grid-column: 1;
  grid-row: 1;
  box-shadow: none;
}

.ios13-segmented-control .option:first-of-type label::before,
.ios13-segmented-control .option:last-of-type label::after {
  opacity: 0;
}

.ios13-segmented-control .option input {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
  border: none;
  opacity: 0;
}

.ios13-segmented-control .selection {
  background: rgba(255, 255, 255, 1);
  border: .5px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.12), 0 3px 1px 0 rgba(0, 0, 0, 0.04);
  border-radius: 7px;
  grid-column: 1;
  grid-row: 1;
  z-index: 2;
  will-change: transform;
  -webkit-transition: transform .2s ease;
  transition: transform .2s ease;
}

.ios13-segmented-control .option label span {
  //display: block;
  position: relative;
  z-index: 2;
  -webkit-transition: all .2s ease;
  transition: all .2s ease;
  will-change: transform;
}

.ios13-segmented-control .option input:checked + label::before,
.ios13-segmented-control .option input:checked + label::after {
  background: var(--background);
  z-index: 1;
}

.ios13-segmented-control .option input:checked + label {
  cursor: default;
}
</style>
