import { useUnmountEffect } from '@react-hookz/web'

import { MovieSubtitleFiles } from '@/components/subtitle/movie-subtitles'
import { TVSubtitleFiles } from '@/components/subtitle/tv-subtitles'
import { subtitleSelectionStateFamily } from '@/store/useVocab'

export function MediaDetails({
  id,
  media_type,
}: {
  id: number
  media_type?: string | undefined
}) {
  useUnmountEffect(() => {
    subtitleSelectionStateFamily.remove(id)
  })

  if (media_type === 'movie') {
    return (
      <MovieSubtitleFiles
        id={id}
      />
    )
  }
  else if (media_type === 'tv') {
    return (
      <TVSubtitleFiles
        id={id}
      />
    )
  }

  return null
}
