import { MoodIcon, WeatherIcon } from './MoodWeatherIcons'
import type { Mood, Weather } from './types'
import { t } from '../../i18n'

const MOOD_VALUES: Mood[] = [1, 2, 3, 4, 5]
const WEATHER_VALUES: Weather[] = ['sunny', 'cloudy', 'rainy', 'snowy']

const MOOD_LABEL_KEY: Record<Mood, string> = {
  1: 'journal.moodVeryBad',
  2: 'journal.moodBad',
  3: 'journal.moodNeutral',
  4: 'journal.moodGood',
  5: 'journal.moodGreat',
}

const WEATHER_LABEL_KEY: Record<Weather, string> = {
  sunny:  'journal.weatherSunny',
  cloudy: 'journal.weatherCloudy',
  rainy:  'journal.weatherRainy',
  snowy:  'journal.weatherSnowy',
}

interface MoodSelectorProps {
  value: Mood | null
  onChange: (m: Mood) => void
  disabled?: boolean
  size?: number
}

export function MoodSelector({ value, onChange, disabled, size = 26 }: MoodSelectorProps) {
  return (
    <div className="journal-mood-row" role="radiogroup" aria-label={t('journal.moodLabel')}>
      {MOOD_VALUES.map((m) => {
        const active = value === m
        return (
          <button
            key={m}
            type="button"
            disabled={disabled}
            className={`journal-mood-btn ${active ? 'journal-mood-btn--active' : ''}`}
            onClick={() => onChange(m)}
            role="radio"
            aria-checked={active}
            aria-label={t(MOOD_LABEL_KEY[m])}
          >
            <span className="journal-mood-btn__icon">
              <MoodIcon mood={m} size={size} color="currentColor" />
            </span>
            <span className="journal-mood-btn__label">{t(MOOD_LABEL_KEY[m])}</span>
          </button>
        )
      })}
    </div>
  )
}

interface WeatherSelectorProps {
  value: Weather | null
  onChange: (w: Weather) => void
  disabled?: boolean
  size?: number
}

export function WeatherSelector({ value, onChange, disabled, size = 26 }: WeatherSelectorProps) {
  return (
    <div className="journal-weather-row" role="radiogroup" aria-label={t('journal.weatherLabel')}>
      {WEATHER_VALUES.map((w) => {
        const active = value === w
        return (
          <button
            key={w}
            type="button"
            disabled={disabled}
            className={`journal-weather-btn ${active ? 'journal-weather-btn--active' : ''}`}
            onClick={() => onChange(w)}
            role="radio"
            aria-checked={active}
            aria-label={t(WEATHER_LABEL_KEY[w])}
          >
            <span className="journal-weather-btn__icon">
              <WeatherIcon weather={w} size={size} color="currentColor" />
            </span>
            <span className="journal-weather-btn__label">{t(WEATHER_LABEL_KEY[w])}</span>
          </button>
        )
      })}
    </div>
  )
}
