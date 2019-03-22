import React from 'react'
import { compose, withState, withHandlers, withProps } from 'recompose'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Divider from '@material-ui/core/Divider'
import { Icon } from '../components/Icon'

export const Filter = compose(
  withState('anchor', 'setAnchor'),
  withHandlers({
    handleOpen: props => e =>
      props.setAnchor(e.currentTarget),
    handleSelect: props => e => {
      props.setAnchor(null)
    }
  }),
  withProps(props => {
    const options = [
      { name: 'Alle Termine (36)', icon: 'search-plus' },
      { name: 'Nur Kasse (31)', icon: 'users' },
      { name: 'Nur Ästhetik (5)', icon: 'plus-circle' },
      { divider: true },
      { name: 'Absagen verstecken', icon: 'times' }, // TODO: Toggle options
      { name: 'Absagen anzeigen', icon: 'times', muted: true }
    ]
    return { options }
  })
)(({
  anchor,
  options,
  handleSelect,
  handleOpen
}) =>
  <>
    <div style={filterTabStyle} onClick={handleOpen}>
      <div style={filterStyle}>
        Alle Termine (36) <Icon name='caret-down' />
      </div>
    </div>
    <Menu
      anchorEl={anchor}
      open={!!anchor}
      onClose={handleSelect}
    >
      {
        options.map((o, i) =>
          o.divider
            ? <Divider key={i} />
            : <MenuItem
              key={o.name}
              onClick={handleSelect(o)}
            >
              <Icon name={o.icon} style={o.muted ? iconStyleMuted : iconStyle} />
              {o.name}
            </MenuItem>
        )
      }
    </Menu>
  </>
)

const filterTabStyle = {
  position: 'absolute',
  // right: 39,
  left: 120,
  top: 0,
  opacity: 0.9,
  background: '#eef1f5',
  borderRadius: '0 0 5px 5px',
  border: '1px solid #a5b0c44a',
  pointerEvents: 'auto'
}

const filterStyle = {
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 6,
  paddingBottom: 6,
  fontSize: '90%',
  opacity: 0.9
}

const iconStyle = {
  width: 28
}

const iconStyleMuted = {
  ...iconStyle,
  opacity: 0.3
}
