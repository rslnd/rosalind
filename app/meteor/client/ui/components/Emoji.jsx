import React from 'react'
import sample from 'lodash/sample'

export const emojiShortcodes = [
  'unicorn',
  'tada',
  'hugging'
].map((s) => [':', s, ':'].join(''))

export const pickEmoji = (pseudorandom) => {
  if (pseudorandom === 'day') {
    const day = new Date().getDate()
    console.log('pseudorandom', day, day % emojiShortcodes.length)
    return emojiShortcodes[day % emojiShortcodes.length]
  } else {
    return sample(emojiShortcodes)
  }
}

export const Emoji = ({ width = 16, name, style = {}, pseudorandom }) => {
  if (!name) {
    name = pickEmoji(pseudorandom)
  }

  if (!window.emojione) {
    console.warn(`[Emoji] Skipping rendering of ${name} because emojione is not loaded`)
    return null
  }

  const short = window.emojione.toShort(name)
  const unicode = window.emojione.shortnameToUnicode(short)
  const svgId = window.emojione.emojioneList[short].unicode[window.emojione.emojioneList[short].unicode.length - 1]
  const svgHref = [window.emojione.imagePathSVGSprites, '#emoji-', svgId].join('')

  return (
    <span
      style={{
        display: 'inline-block',
        width,
        ...style
      }}>

      <svg style={{
        width: '100%',
        height: '100%'
      }}>
        <description>{unicode}</description>
        <use xlinkHref={svgHref}></use>
      </svg>
    </span>
  )
}

export const HugeEmoji = (props) => (
  <Emoji {...props} style={{
    display: 'block',
    width: '100%',
    margin: 7
  }} />
)

export const RandomEmoji = (props) => {
  if (Math.random() < 0.2) {
    return <Emoji />
  } else if (Math.random() < 0.2) {
    return <HugeEmoji />
  } else {
    return null
  }
}

export const SpecialUnicorn = () => (
  <Emoji style={{
    transform: 'scaleX(-1) translateX(25px) translateY(30px)',
    width: 200
  }} name=":unicorn:" />
)
