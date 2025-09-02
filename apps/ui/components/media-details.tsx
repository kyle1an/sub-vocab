import { Detail } from '@/components/subtitle/detail'
import { MovieSubtitleFiles } from '@/components/subtitle/movie'
import { TVSubtitleFiles } from '@/components/subtitle/tv'

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
