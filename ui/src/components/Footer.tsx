import { Icon } from '@/components/ui/icon'

export const Footer = () => (
  <footer className="mt-6 w-full bg-zinc-100">
    <div className="mx-auto max-w-screen-xl">
      <section className="px-5 py-3">
        <div className="flex items-center gap-2 text-xs tracking-wide">
          <Icon
            icon="lucide:check-circle"
            width={14}
            className="text-neutral-400"
          />
          <span className="text-neutral-500">SUB VOCAB</span>
        </div>
      </section>
    </div>
  </footer>
)
