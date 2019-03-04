import React from 'react'
import { __ } from '../../i18n'
import { zerofix } from '../../util/zerofix'
import { Stamps } from '../helpers/Stamps'
import { CommentsContainer, HumanCommentCount } from '../comments'
import { LinkToAppointmentContainer } from './LinkToAppointmentContainer'
import { InboundCallsTopics } from '../../api/inboundCalls'
import { highlightBackground, highlightColor } from '../layout/styles'
import { InlineEdit } from '../components/form'

export class InboundCallItem extends React.Component {
  render () {
    const {
      inboundCall,
      showTopic,
      unresolve,
      resolve,
      edit,
      canResolve,
      canEdit,
      fullNameWithTitle
    } = this.props

    const {
      lastName,
      firstName,
      note,
      topicId,
      removed,
      telephone,
      pinnedBy,
      _id
    } = inboundCall

    const topic = showTopic && InboundCallsTopics.findOne({ _id: topicId })
    const topicLabel = topic && topic.label

    const style = pinnedBy ? pinnedStyle : null

    return (
      <div className='box box-widget' style={style}>
        <div className='box-header'>
          <h4 className='username enable-select'>
            <InlineEdit
              onChange={edit(_id, 'lastName')}
              canEdit={canEdit}
              value={lastName}
              noUI
            >
              <b>{lastName}</b>
            </InlineEdit>

            &nbsp;

            <InlineEdit
              onChange={edit(_id, 'firstName')}
              canEdit={canEdit}
              value={firstName}
              noUI
            />

            &ensp;

            <small>{topicLabel}</small>
          </h4>
          <InlineEdit
            onChange={edit(_id, 'telephone')}
            canEdit={canEdit}
            value={zerofix(telephone)}
            noUI
            fullWidth>
            <h3 className='description enable-select'>{zerofix(telephone)}</h3>
          </InlineEdit>
        </div>
        <div className='box-body'>
          <blockquote>
            <InlineEdit
              onChange={edit(_id, 'note')}
              canEdit={canEdit}
              multiline
              value={note}
              noUI
              fullWidth>
              <p className='enable-select pre-wrap'>{note}</p>
            </InlineEdit>

          </blockquote>

          <LinkToAppointmentContainer inboundCall={inboundCall} />
          <HumanCommentCount docId={_id} />
          <Stamps
            collectionName='inboundCalls'
            fields={['removed', 'created']}
            doc={inboundCall}
          />
        </div>
        <CommentsContainer docId={_id} style={style} />
        <div className='box-footer'>
          {
            (pinnedBy && canResolve || !pinnedBy)
              ? (
                removed
                  ? <a onClick={() => unresolve(_id)}>{__('inboundCalls.unresolve')}</a>
                  : <a onClick={() => resolve(_id)}>{__('inboundCalls.resolve')}</a>
              ) : <span className='text-muted'>
                {__('inboundCalls.pinnedBy', { name: fullNameWithTitle && fullNameWithTitle(pinnedBy) })}
              </span>
          }
        </div>
      </div>
    )
  }
}

const pinnedStyle = {
  backgroundColor: highlightBackground,
  color: highlightColor
}
