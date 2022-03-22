<template>
  <div>
    <label class="form-switch">
      <span>Hide Common</span>
      <input type="checkbox" v-model="isFilter" @change="toggleFilter" /><i></i>
    </label>
  </div>
</template>

<script>
export default {
  name: "switch",
  props: {
    value: {
      required: false,
      type: [Number, String]
    },
  },
  data() {
    return {
      isFilter: true,
    }
  },
  watch: {
    value(v) {
      this.toggleFilter(v)
    },
  },
  methods: {
    toggleFilter() {
      this.vocabData = this.isFilter ? this.hasFiltered : this.notFiltered
      setTimeout(() => this.selectOnTouch(), 0)
    },
  }
}
</script>

<style lang="scss" scoped>
label.form-switch {
  display: flex;
  justify-content: center;
}

label.form-switch span {
  font-size: 16px;
  letter-spacing: -0.04rem;
  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  margin: 0 10px;
}

:root {
  --switch-color: #4BD763; // #0a95ff; //#4BD763;
  --switch-bg-color: #e6e6e6;
}

.form-switch {
  display: inline-block;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  i {
    position: relative;
    display: inline-block;
    margin-right: .5rem;
    width: 46px;
    height: 26px;
    background-color: #e6e6e6;
    border-radius: 23px;
    vertical-align: text-bottom;
    transition: all 0.3s linear;

    user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -o-user-select: none;
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
}

.form-switch:active i::after {
  width: 28px;
  transform: translate3d(2px, 2px, 0);
}

.form-switch:active input:checked + i::after {
  transform: translate3d(16px, 2px, 0);
}

.form-switch {
  input {
    display: none;
  }

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
