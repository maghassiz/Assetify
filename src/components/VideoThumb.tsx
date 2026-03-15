import { useRef, useState } from "react"

interface VideoThumbProps {
  url: string
  className?: string
}

export function VideoThumb({ url, className = "" }: VideoThumbProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    if (playing) {
      v.pause()
      setPlaying(false)
    } else {
      v.play().catch(() => { })
      setPlaying(true)
    }
  }

  return (
    <div className="video-thumb-wrap">
      <video
        ref={videoRef}
        src={url}
        className={className}
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          (e.currentTarget as HTMLVideoElement).currentTime = 0
        }}
        onEnded={() => setPlaying(false)}
      />
      {/* Play / Pause overlay button */}
      <button
        className={`video-play-btn${playing ? " playing" : ""}`}
        onClick={toggle}
        title={playing ? "Pause" : "Play"}
      >
        {playing
          ? /* Pause icon */
          <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
            <path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z" />
          </svg>
          : /* Play icon */
          <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
            <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z" />
          </svg>
        }
      </button>
    </div>
  )
}