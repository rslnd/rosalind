import { unicorn as Uni } from 'react-svg-emojione'

export const Emoji = ({ width, children, style = {} }) => {
  return (
    <span
      style={{
        display: 'inline-block',
        width,
        ...style
      }}>
      {children || <Uni />}
    </span>
  )
}

export const RandomEmoji = (props) => {
  return <Emoji {...props} />
}

export const Unicorn = (props) => (
  <Emoji {...props}>
    <Uni />
  </Emoji>
)

export const SpecialUnicorn = () => (
  <Unicorn style={{
    transform: 'scaleX(-1) translateX(25px) translateY(30px)',
    width: 200
  }} />
)
