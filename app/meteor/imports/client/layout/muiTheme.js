import { createMuiTheme } from '@material-ui/core/styles'
import {
  fontStack,
  text,
  gray,
  grayActive,
  primary
} from './styles'

const animationSpeed = 1.6

export const muiTheme = createMuiTheme({
  typography: {
    useNextVariants: true,
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
        },
        '&:after': {
          borderBottom: `2px solid ${primary}`,
          zoom: 1 / 1.221
        },
        '&:hover:not($disabled):not($focused):not($error):before': {
          borderBottom: `1px solid ${grayActive}`
        }
      }
    },
    MuiInputLabel: {
      root: {
        color: text
      }
    },
    MuiCircularProgress: {
      indeterminate: {
        animation: `mui-progress-circular-rotate ${1.4 / animationSpeed}s linear infinite`
      }
    },
    MuiTableCell: {
      head: {
        fontSize: '14px'
      },
      body: {
        fontSize: '14px'
      }
    },
    MuiTooltip: {
      popper: {
        zIndex: 1260
      },
      tooltip: {
        fontSize: '14px'
      }
    }
  }
})
