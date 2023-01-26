<script setup lang="ts">
const props = withDefaults(defineProps<{
  state?: boolean,
  text?: [string, string],
  onToggle: (state: boolean) => void,
}>(), {
  state: false,
  text: () => ['off', 'on'],
})
</script>

<template>
  <div>
    <label class="form-switch flex cursor-pointer justify-center tap-transparent">
      <span class="mx-2.5 flex flex-col-reverse justify-center text-base">{{ props.text[0] }}</span>
      <input
        :checked="props.state"
        type="checkbox"
        class="hidden"
        @change="(ev)=>props.onToggle(ev.target.checked)"
      >
      <i class="relative mr-2 inline-block h-[26px] w-[46px] select-none rounded-[23px] bg-[#e6e6e6] align-text-bottom transition-all duration-300 ease-linear" />
      <span class="mx-2.5 flex flex-col-reverse justify-center text-base">{{ props.text[1] }}</span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
:root {
  --switch-bg-color: #e6e6e6;
}

.form-switch:active {
  i::after {
    width: 28px;
    transform: translate3d(2px, 2px, 0);
  }

  input:checked + i::after {
    transform: translate3d(16px, 2px, 0);
  }
}

i {
  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    height: 22px;
    border-radius: 11px;
  }

  &::before {
    width: 42px;
    background-color: var(--switch-bg-color);
    transform: translate3d(2px, 2px, 0) scale3d(1, 1, 1);
    transition: all 0.25s linear;
  }

  &::after {
    width: 22px;
    background-color: #fff;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.24);
    transform: translate3d(2px, 2px, 0);
    transition: all 0.35s cubic-bezier(.34, .35, .11, 1.19)
  }
}

input:checked + i {
  background-color: rgb(52, 199, 89);

  &::before {
    transform: translate3d(18px, 2px, 0) scale3d(0, 0, 0);
  }

  &::after {
    transform: translate3d(22px, 2px, 0);
  }
}
</style>
