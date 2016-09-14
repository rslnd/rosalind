import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import style from './style'

export class AppointmentsView extends React.Component {
  render () {
    return (
      <div className={style.grid}>
        <div></div>
        <div className={style.header}>
          {this.props.assignees.map((assignee) => (
            <div key={assignee.assigneeId} className={style.headerCell}>
              {assignee.fullNameWithTitle}
            </div>
          ))}
        </div>
      </div>
    )
  }
}
