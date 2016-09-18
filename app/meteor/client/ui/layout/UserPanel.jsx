import React from 'react'
import { Button } from 'react-bootstrap'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'
import { TimesheetSummaryContainer } from 'client/ui/timesheets/TimesheetSummaryContainer'
import style from './userPanelStyle.scss'

export class UserPanel extends React.Component {
  render () {
    return (
      <div className={style.userPanel}>
        <b className={style.name}>
          {this.props.currentUser.fullNameWithTitle()}
        </b>
        <div className={style.hidden}>
          <div className={style.button}>
            <TimesheetSummaryContainer userId={this.props.currentUser._id} />
          </div>
          <div className={style.button}>
            {
              this.props.loggingOut
              ? <Button bsStyle="default" block disabled>
                <Icon name="refresh" spin />
              </Button>
              : <Button bsStyle="default" block onClick={this.props.handleLogout}>
                <Icon name="sign-out" /> {TAPi18n.__('login.logout')}
              </Button>
            }
          </div>
        </div>
      </div>
    )
  }
}
