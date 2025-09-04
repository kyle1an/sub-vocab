import IconTMDB from '@/../../public/tmdb.svg'
import { ContentRoot } from '@/components/content-root'

export default function AboutPage() {
  return (
    <ContentRoot>
      <div className="p-6">
        <div className="flex h-lh">
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://www.themoviedb.org/"
            className="inline-block self-center"
          >
            <IconTMDB
              className="block h-[11px] align-baseline"
              width="100%"
            />
          </a>
        </div>
        {/* https://developer.themoviedb.org/docs/faq#what-are-the-attribution-requirements */}
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </div>
    </ContentRoot>
  )
}
