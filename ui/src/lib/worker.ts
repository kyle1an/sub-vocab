import squircle from '@/lib/squircle.ts?worker&url'

if ('paintWorklet' in CSS) {
  // @ts-expect-error
  CSS.paintWorklet.addModule(
    squircle,
  )
}
