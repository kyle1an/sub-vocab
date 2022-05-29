import { defineStore } from 'pinia';

export const useTimeStore = defineStore('timeStore', () => {
  let time: any = {};

  function alignWord(des: string, time: number, indent: number = 30) {
    let gap = indent - des.length - (~~time + '').length
    if (gap < 0) gap = 1;
    const space = ' '.repeat(gap);
    return `${des}${space}${time} ms`;
  }

  function logPerf() {
    console.log(alignWord('· init words', time.log.wordInitialized - time.log.start,));
    console.log('%c' + alignWord(' ╭╴ merge vocabulary', time.log.mergeEnded - time.log.mergeStarted,), 'color: gray; font-style: italic; padding: 1px');
    console.log('%c' + alignWord(' ╭╴ formLabel vocabulary', time.log.formLabelEnded - time.log.mergeEnded,), 'color: gray; font-style: italic; padding: 0.5px');
    console.log(alignWord('· categorize vocabulary', time.log.end - time.log.categorizeStart,));
    console.log(alignWord('+ All took', time.log.end - time.log.start,));
  }

  return { time, logPerf };
})
