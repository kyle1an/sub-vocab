import { MovieSubtitleFiles } from '@/components/subtitle/movie-subtitles'
import { TVSubtitleFiles } from '@/components/subtitle/tv-subtitles'

export function MediaDetails({
  id,
  media_type,
}: {
  id: number
  media_type?: string | undefined
}) {
  if (media_type === 'movie') {
    return (
      <MovieSubtitleFiles
        id={id}
      />
    )
  } else if (media_type === 'tv') {
    return (
      <TVSubtitleFiles
        id={id}
      />
    )
  }

  return null
}
