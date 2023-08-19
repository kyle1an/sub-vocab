import { defineStore } from 'pinia'

type Perf = {
  label: string | string[]
  times: number[]
  style: string
}

export const useTimeStore = defineStore('timeStore', () => {
  const perfTime: Record<string, Perf> = {}
  const logsRes: Record<string, Perf> = {}

  const getName = (label: string | string[]) => typeof label === 'string' ? label : label.join('')

  function logTime(label: string | string[], style = '') {
    const name = getName(label)
    perfTime[name] = {
      label,
      times: [performance.now()],
      style,
    }
  }

  function logEnd(label: string | string[]) {
    const name = getName(label)
    if (!perfTime[name]) {
      console.warn(`${name} not logged`)
      return
    }

    perfTime[name].times.push(performance.now())
    logsRes[name] = perfTime[name]
  }

  function formatLogMessage(des: string | string[], time: number, indent = 30) {
    const {
      title,
      append,
      desStr,
    } = Array.isArray(des) ? {
      title: des[0],
      append: des[1],
      desStr: des.join(''),
    } : {
      title: des,
      append: '',
      desStr: des,
    }

    const space = ' '.repeat(Math.max(indent - desStr.replace(/%c/g, '').length - String(~~time).length, 1))
    return `${title}${space}${append}${time} ms`
  }

  function logPerf() {
    const logs = Object.entries(logsRes).sort((a, b) => a[1].times[1] - b[1].times[1])
    for (const [, { label, times, style }] of logs) {
      const [start, end] = times
      console.log(formatLogMessage(label, end - start), style)
    }
  }

  return { logTime, logEnd, logPerf }
})
