import type { WeatherTheme } from '../lib/weatherUtils'

type WeatherAnimationProps = {
  theme: WeatherTheme
}

export default function WeatherAnimation({ theme }: WeatherAnimationProps) {
  return (
    <div className={`weatherAnim weatherAnim--${theme}`} aria-hidden="true">
      {theme === 'clear' && (
        <>
          <div className="sun" />
          <div className="sunRays" />
        </>
      )}
      {theme === 'partly' && (
        <>
          <div className="sun sun--small" />
          <div className="cloud cloud--1" />
          <div className="cloud cloud--2" />
        </>
      )}
      {theme === 'cloudy' && (
        <>
          <div className="cloud cloud--1" />
          <div className="cloud cloud--2" />
          <div className="cloud cloud--3" />
        </>
      )}
      {theme === 'fog' && <div className="fog" />}
      {theme === 'rain' && (
        <>
          <div className="cloud cloud--1" />
          <div className="raindrops">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="drop" style={{ left: `${(i * 5.5) % 100}%`, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </>
      )}
      {theme === 'snow' && (
        <>
          <div className="cloud cloud--1" />
          <div className="snowflakes">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="flake" style={{ left: `${(i * 6) % 100}%`, animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </>
      )}
      {theme === 'storm' && (
        <>
          <div className="cloud cloud--dark" />
          <div className="lightning" />
          <div className="raindrops">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="drop drop--heavy" style={{ left: `${(i * 7) % 100}%`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
