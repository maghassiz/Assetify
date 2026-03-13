interface VideoThumbProps {
  url:        string
  className?: string
}

export function VideoThumb({ url, className = "" }: VideoThumbProps) {
  return (
    <video
      src={url}
      className={className}
      muted
      playsInline
      preload="metadata"
      onLoadedMetadata={(e) => {
        (e.currentTarget as HTMLVideoElement).currentTime = 1
      }}
      onMouseEnter={(e) =>
        (e.currentTarget as HTMLVideoElement).play().catch(() => {})
      }
      onMouseLeave={(e) => {
        const v = e.currentTarget as HTMLVideoElement
        v.pause()
        v.currentTime = 1
      }}
    />
  )
}
