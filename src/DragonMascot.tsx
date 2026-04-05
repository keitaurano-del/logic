import dragonImg from './assets/dragon-mascot.jpg'
import './DragonMascot.css'

type Props = {
  size?: number
  mood?: 'default' | 'happy' | 'thinking' | 'talking'
}

export default function DragonMascot({ size = 120, mood = 'default' }: Props) {
  return (
    <div className={`dragon-mascot mood-${mood}`} style={{ width: size, height: size }}>
      <img
        src={dragonImg}
        alt="Logic マスコット"
        className="dragon-img"
        width={size}
        height={size}
      />
    </div>
  )
}
