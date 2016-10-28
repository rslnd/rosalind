/* global emojione */
import scriptjs from 'scriptjs'

export default () => {
  scriptjs('https://cdn.jsdelivr.net/emojione/2.2.4/lib/js/emojione.min.js', () => {
    emojione.imageType = 'svg'
    emojione.sprites = true
    emojione.imagePathSVGSprites = '/images/emojione.sprites-2.2.4.svg'
  })
}
