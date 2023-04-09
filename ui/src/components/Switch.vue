<script setup lang="ts">
const props = withDefaults(defineProps<{
  checked?: boolean,
  text?: [string, string],
  onChange: (checked: boolean) => void,
}>(), {
  checked: false,
  text: () => ['', 'on'],
})
</script>

<template>
  <div>
    <label class="group/label flex cursor-pointer justify-center tap-transparent">
      <span class="mx-2.5 flex flex-col-reverse justify-center text-base">
        {{ props.text[0] }}
      </span>
      <input
        :checked="props.checked"
        type="checkbox"
        class="peer hidden"
        @change="(ev)=>props.onChange(ev.target.checked)"
      >
      <i class="relative mr-2 inline-block h-[26px] w-[46px] select-none overflow-hidden rounded-[23px] bg-[#e6e6e6] align-text-bottom transition-all duration-300 ease-linear group-active/label:after:w-7 peer-checked:bg-[rgb(52,199,89)]" />
      <span class="mx-2.5 flex flex-col-reverse justify-center text-base">
        {{ props.text[1] }}
      </span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
:root {
  --switch-bg-color: #e6e6e6;
}

.group\/label:active {
  i::after {
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
  &::before {
    transform: translate3d(18px, 2px, 0) scale3d(0, 0, 0);
  }

  &::after {
    transform: translate3d(22px, 2px, 0);
  }
}
</style>
