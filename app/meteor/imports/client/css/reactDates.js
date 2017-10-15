window.process.nextTick = window.setImmediate
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import ThemedStyleSheet from 'react-with-styles/lib/ThemedStyleSheet'
import aphroditeInterface from 'react-with-styles-interface-aphrodite'
import DefaultTheme from 'react-dates/lib/theme/DefaultTheme'

export default () => {
  ThemedStyleSheet.registerInterface(aphroditeInterface)
  ThemedStyleSheet.registerTheme({
    ...DefaultTheme,
    color: {
      ...DefaultTheme.color,
      highlighted: {
        backgroundColor: '#82E0AA',
        backgroundColor_active: '#58D68D',
        backgroundColor_hover: '#58D68D',
        color: '#186A3B',
        color_active: '#186A3B',
        color_hover: '#186A3B'
      }
    }
  })
}
