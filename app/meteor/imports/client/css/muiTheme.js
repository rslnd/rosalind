import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { fontStack } from './global'

export const muiTheme = getMuiTheme({
  fontFamily: fontStack,
  palette: {
    primary1Color: '#3c8dbc',
    primary2Color: '#3c8dbc',
    primary3Color: '#00c0ef',
    accent1Color: '#D81B60',
    accent2Color: '#f39c12',
    accent3Color: '#00a65a',
    disabledColor: '#444444'
  }
})
