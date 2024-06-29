import squircle from '@/lib/squircle.ts?worker&url'

if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule(
    squircle,
  )
}
