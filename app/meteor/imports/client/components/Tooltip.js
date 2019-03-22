import React from 'react'
import { withState, compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles'
import MUITooltip from '@material-ui/core/Tooltip'

const styles = theme => ({
  popper: {
    zIndex: 3000
  },
  tooltip: {
    fontSize: 10,
    textTransform: 'uppercase'
  },
  arrowPopper: arrowGenerator(theme.palette.grey[700]),
  arrow: {
    position: 'absolute',
    fontSize: 6,
    width: '3em',
    height: '3em',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid'
    }
  }
})

export const Tooltip = compose(
  withStyles(styles),
  withState('arrowRef', 'setArrowRef')
)(
  ({ children, title, arrowRef, setArrowRef, classes, delay, ...props }) =>
    <MUITooltip
      title={
        <React.Fragment>
          {title}
          <span className={classes.arrow} ref={setArrowRef} />
        </React.Fragment>
      }
      classes={{ popper: classes.arrowPopper }}
      PopperProps={{
        disablePortal: true,
        popperOptions: {
          disablePortal: true,
          modifiers: {
            arrow: {
              enabled: Boolean(arrowRef),
              element: arrowRef
            }
          }
        }
      }}
      enterDelay={delay ? 500 : props.enterDelay}
      {...props}
    >
      {children}
    </MUITooltip>
)

const arrowGenerator = color => {
  return {
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.95em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${color} transparent`
      }
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.95em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: `${color} transparent transparent transparent`
      }
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: '-0.95em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${color} transparent transparent`
      }
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: '-0.95em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${color}`
      }
    }
  }
}
