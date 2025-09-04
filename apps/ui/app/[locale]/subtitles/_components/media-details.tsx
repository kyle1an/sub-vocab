import { Detail } from '@/app/[locale]/subtitles/_components/detail'
import { MovieSubtitleFiles } from '@/app/[locale]/subtitles/_components/movie'
import { TVSubtitleFiles } from '@/app/[locale]/subtitles/_components/tv'

export function MediaDetails({
  id,
  media_type,
}: {
  id: number
  media_type?: string | undefined
}) {
  if (media_type === 'movie') {
    return (
      <Detail
        style={{
          '--h': `${126 + 4 * 32}px`,
        }}
      >
        <MovieSubtitleFiles
          id={id}
        />
      </Detail>
    )
  } else if (media_type === 'tv') {
    return (
      <Detail
        style={{
          '--h': `${126 + 6 * 32}px`,
        }}
      >
        <TVSubtitleFiles
          id={id}
        />
      </Detail>
    )
  }

  return null
}
