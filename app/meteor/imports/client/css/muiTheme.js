import { createMuiTheme } from 'material-ui/styles'
import {
  fontStack,
  text,
  gray,
  grayActive,
  primary,
  primaryActive,
  primaryDisabled,
  fontSize
} from './global'

const animationSpeed = 1.6

export const muiTheme = createMuiTheme({
  typography: {
    fontFamily: fontStack
  },
  palette: {
    contrastThreshold: 3,
    tonalOffset: 0.2,
    primary: { main: primary },
    secondary: { main: '#D81B60' },
    input: {
      inputText: text,
      bottomLine: gray
    }

    // primary1Color: primary,
    // primary2Color: primary,
    // primary3Color: '#00c0ef',
    // accent1Color: '#D81B60',
    // accent2Color: '#f39c12',
    // accent3Color: '#00a65a',
    // disabledColor: '#444444'
  },

  overrides: {
    MuiButton: {
      root: {
        textTransform: 'none',
        fontSize: '16px'
      }
    },
    MuiInput: {
      input: {
        color: text
      },
      underline: {
        '&:before': {
          backgroundColor: gray,
          height: 1,
          zoom: 1 / 1.221
        },
        '&:hover:not($disabled):before': {
          backgroundColor: grayActive,
          height: 2
        }
      },
      inkbar: {
        '&:after': {
          backgroundColor: primary,
          height: 2,
          zoom: 1 / 1.221
        }
      }
    },
    MuiInputLabel: {
      root: {
        color: text
      }
    },
    MuiCircularProgress: {
      svgIndeterminate: {
        animation: `mui-progress-circular-rotate ${1.4 / animationSpeed}s linear infinite`
      },
      circleIndeterminate: {
        animation: `mui-progress-circular-dash ${1.4 / animationSpeed}s ease-in-out infinite`
      }
    },
    MuiTableCell: {
      typeHead: {
        fontSize
      },
      typeBody: {
        fontSize
      }
    }
  }
})
