import { defineStore } from 'pinia';

export const useTimeStore = defineStore('timeStore', () => {
  let time: any = {};

  function alignWord(des: string | Array<string>, time: number, indent: number = 30) {
    let title;
    let desStr;
    let append;

    if (Array.isArray(des)) {
      title = des[0];
      desStr = des.join('');
      append = des[1];
    } else {
      title = des;
      desStr = des;
      append = '';
    }

    const desHolder = desStr.replace(/%c/g, '');
    let gap = indent - desHolder.length - (~~time + '').length
    if (gap < 0) gap = 1;
    const space = ' '.repeat(gap);
    return `${title + space + append + time} ms`;
  }

  function logPerf() {
    console.log(alignWord('· init words', time.log.wordInitialized - time.log.start,));
    console.log(alignWord('%c ╭╴ merge vocabulary', time.log.mergeEnded - time.log.mergeStarted,), 'color: gray; font-style: italic; padding: 1px');
    console.log(alignWord('%c ╭╴ formLabel vocabulary', time.log.formLabelEnded - time.log.mergeEnded,), 'color: gray; font-style: italic; padding: 0.5px');
    console.log(alignWord(['· categorize vocabulary', ' +  '], time.log.end - time.log.categorizeStart,));
    console.log(alignWord(['All took', '    '], time.log.end - time.log.start,));
  }

  return { time, logPerf };
})
