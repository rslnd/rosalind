import getMuiTheme from 'material-ui/styles/getMuiTheme'

export const muiTheme = getMuiTheme({
  fontFamily: `-apple-system, BlinkMacSystemFont,
      "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell",
      "Fira Sans", "Droid Sans", "Helvetica Neue",
      sans-serif`,
  palette: {
    primary1Color: '#3c8dbc',
    primary2Color: '#39CCCC',
    primary3Color: '#00c0ef',
    accent1Color: '#D81B60',
    accent2Color: '#f39c12',
    accent3Color: '#00a65a',
    disabledColor: '#444444'
  }
})
