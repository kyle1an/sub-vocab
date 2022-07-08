<script setup lang="ts">
const emit = defineEmits(['toggle'])
const props = defineProps({
  state: Boolean,
  text: { type: Array, default: () => ['off', 'on'] },
})
const toggleState = ref<boolean>(props.state)
const toggleFilter = () => emit('toggle', toggleState.value)
</script>

<template>
  <div>
    <label class="form-switch flex justify-center cursor-pointer">
      <span class="flex justify-center text-base flex-col-reverse mx-2.5">{{ text[0] }}</span>
      <input
        v-model="toggleState"
        type="checkbox"
        class="hidden"
        @change="toggleFilter"
      >
      <i class="relative inline-block select-none align-text-bottom rounded-[23px] mr-2 w-[46px] h-[26px] bg-[#e6e6e6]" />
      <span class="flex justify-center text-base flex-col-reverse mx-2.5">{{ text[1] }}</span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
:root {
  --switch-bg-color: #e6e6e6;
}

.form-switch {
  -webkit-tap-highlight-color: transparent;

  i {
    transition: all 0.3s linear;
  }

  i::before {
    content: '';
    position: absolute;
    left: 0;
    width: 42px;
    height: 22px;
    background-color: var(--switch-bg-color);
    border-radius: 11px;
    transform: translate3d(2px, 2px, 0) scale3d(1, 1, 1);
    transition: all 0.25s linear;
  }

  i::after {
    content: '';
    position: absolute;
    left: 0;
    width: 22px;
    height: 22px;
    background-color: #fff;
    border-radius: 11px;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.24);
    transform: translate3d(2px, 2px, 0);
    transition: all 0.2s ease-in-out;
  }

  &:active {
    i::after {
      width: 28px;
      transform: translate3d(2px, 2px, 0);
    }

    input:checked + i::after {
      transform: translate3d(16px, 2px, 0);
    }
  }

  --switch-color: rgb(52, 199, 89);

  input:checked + i {
    background-color: var(--switch-color);
  }

  input:checked + i::before {
    transform: translate3d(18px, 2px, 0) scale3d(0, 0, 0);
  }

  input:checked + i::after {
    transform: translate3d(22px, 2px, 0);
  }
}
</style>
