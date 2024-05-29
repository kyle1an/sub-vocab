// https://github.com/tailwindlabs/tailwindcss/discussions/6925#discussioncomment-8983075
declare module 'tailwindcss/lib/util/flattenColorPalette' {
  export default function flattenColorPalette(
    pallette: Record<string, string>,
  ): Record<string, string>
}
