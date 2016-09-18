import React from 'react'
import { Button } from 'react-bootstrap'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'
import { TimesheetSummaryContainer } from 'client/ui/timesheets/TimesheetSummaryContainer'
import style from './userPanelStyle.scss'

export class UserPanel extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      userMenuOpen: false
    }

    this.toggleUserMenu = this.toggleUserMenu.bind(this)
  }

  toggleUserMenu () {
    this.setState({
      ...this.state,
      userMenuOpen: !this.state.userMenuOpen
    })
  }

  render () {
    return (
      <div className={style.userPanel}>
        <b className={style.name}>
          {this.props.currentUser.fullNameWithTitle()}
        </b>
        <div className={style.hidden}>
          <p>
            <TimesheetSummaryContainer userId={this.props.currentUser._id} />
          </p>
          <p>
            {
              this.props.loggingOut
              ? <Button bsStyle="default" block disabled>
                <Icon name="refresh" spin />
              </Button>
              : <Button bsStyle="default" block onClick={this.props.handleLogout}>
                <Icon name="sign-out" /> {TAPi18n.__('login.logout')}
              </Button>
            }
          </p>
        </div>
      </div>
    )
  }
}
