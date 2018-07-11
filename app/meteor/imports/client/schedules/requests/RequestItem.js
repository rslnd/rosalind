import React from 'react'
import moment from 'moment-timezone'
import classnames from 'classnames'
import Button from '@material-ui/core/Button'
import { TAPi18n } from 'meteor/tap:i18n'
import { Stamps } from '../../helpers/Stamps'
import { UserHelper } from '../../users/UserHelper'
import { Box } from '../../components/Box'
import { CommentsContainer, HumanCommentCount } from '../../comments'

export class RequestItem extends React.Component {
  render () {
    const { _id, note, reason, userId, start, end, resolvedAt, valid } = this.props.request
    const accepted = (resolvedAt && valid)
    const declined = (resolvedAt && !valid)

    const boxType = classnames({
      danger: declined,
      success: accepted,
      default: (!resolvedAt)
    })

    const footer = <div>
      <CommentsContainer docId={_id} />
      {
        this.props.canEdit &&
          <div className='box-footer'>
            <Button
              label={TAPi18n.__('schedules.requests.approve')}
              onClick={() => this.props.approve(_id)}
              disabled={accepted} />

            <Button
              label={TAPi18n.__('schedules.requests.decline')}
              onClick={() => this.props.decline(_id)}
              disabled={declined} />
          </div>
      }
    </div>

    return (
      <Box type={boxType} footer={footer}>
        <h4 className='username enable-select'>
          <b><UserHelper userId={userId} helper='fullNameWithTitle' /></b>&ensp;
          <small>{TAPi18n.__(`schedules.requests.${reason}`)}</small>
        </h4>
        <p className='description enable-select'>
          <small className='text-muted'>Start</small>&nbsp;
          <b>{moment(start).format(TAPi18n.__('time.dateFormatWeekday'))}</b>
          <br />
          <small className='text-muted'>Ende</small>&nbsp;
          <b>{moment(end).format(TAPi18n.__('time.dateFormatWeekday'))}</b>
        </p>

        {
          note && <blockquote>
            <p className='enable-select pre-wrap'>{note}</p>
          </blockquote>
        }
        <HumanCommentCount docId={_id} />
        {
          valid
          ? <Stamps fields={['removed', 'requested', 'approved']} doc={this.props.request} />
          : <Stamps fields={['removed', 'requested', 'declined']} doc={this.props.request} />
        }
      </Box>
    )
  }
}
