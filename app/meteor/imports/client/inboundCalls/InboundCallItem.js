import React from 'react'
import { __ } from '../../i18n'
import { zerofix } from '../../util/zerofix'
import { Stamps } from '../helpers/Stamps'
import { CommentsContainer, HumanCommentCount } from '../comments'
import { LinkToAppointmentContainer } from './LinkToAppointmentContainer'
import { InboundCallsTopics } from '../../api/inboundCalls'

export class InboundCallItem extends React.Component {
  render () {
    const {
      inboundCall,
      showTopic,
      unresolve,
      resolve
    } = this.props

    const {
      lastName,
      firstName,
      note,
      topicId,
      removed,
      telephone,
      _id
    } = inboundCall

    const topic = showTopic && InboundCallsTopics.findOne({ _id: topicId })
    const topicLabel = topic && topic.label

    return (
      <div className='box box-widget'>
        <div className='box-header'>
          <h4 className='username enable-select'>
            <b>{lastName}</b> {firstName}&ensp;
            <small>{topicLabel}</small>
          </h4>
          <h3 className='description enable-select'>{zerofix(telephone)}</h3>
        </div>
        <div className='box-body'>
          <blockquote>
            <p className='enable-select pre-wrap'>{note}</p>
          </blockquote>

          <LinkToAppointmentContainer inboundCall={inboundCall} />
          <HumanCommentCount docId={_id} />
          <Stamps
            collectionName='inboundCalls'
            fields={['removed', 'created']}
            doc={inboundCall}
          />
        </div>
        <CommentsContainer docId={_id} />
        <div className='box-footer'>
          {
            removed
              ? <a onClick={() => unresolve(_id)}>{__('inboundCalls.unresolve')}</a>
            : <a onClick={() => resolve(_id)}>{__('inboundCalls.resolve')}</a>
          }
        </div>
      </div>
    )
  }
}
