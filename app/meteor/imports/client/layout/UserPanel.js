import React from 'react'
import { Button } from 'react-bootstrap'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../components/Icon'
import { gray } from '../css/global'

const style = {
  hidden: {
    maxHeight: 200,
    overflow: 'hidden',
    transition: 'max-height .25s ease-out'
  },
  name: {
    color: gray,
    display: 'inline-block',
    paddingBottom: 7,
    paddingtTop: 7
  },
  button: {
    padding: 3
  }
}

export class UserPanel extends React.Component {
  render () {
    return (
      <div style={style.userPanel}>
        <b style={style.name}>
          {
            this.props.sidebarOpen
            ? this.props.currentUser.fullNameWithTitle()
            : this.props.currentUser.username
          }
        </b>
        <div style={style.hidden}>
          <div style={style.button}>
            {
              this.props.loggingOut
              ? <Button bsStyle='default' block disabled>
                <Icon name='refresh' spin />
              </Button>
              : <Button bsStyle='default' block onClick={this.props.handleLogout}>
                <Icon name='sign-out' /> {TAPi18n.__('login.logout')}
              </Button>
            }
          </div>
        </div>
      </div>
    )
  }
}