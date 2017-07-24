import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { zerofix } from '../../util/zerofix'
import { Stamps } from '../helpers/Stamps'
import { CommentsContainer, HumanCommentCount } from '../comments'
import { LinkToAppointmentContainer } from './LinkToAppointmentContainer'

export class InboundCallItem extends React.Component {
  render () {
    return (
      <div className='box box-widget'>
        <div className='box-header'>
          <h4 className='username enable-select'>
            <b>{this.props.inboundCall.lastName}</b> {this.props.inboundCall.firstName}&ensp;
            <small>{TAPi18n.__(`inboundCalls.${this.props.inboundCall.privatePatient ? 'private' : 'insurance'}`)}</small>
          </h4>
          <h3 className='description enable-select'>{zerofix(this.props.inboundCall.telephone)}</h3>
        </div>
        <div className='box-body'>
          <blockquote>
            <p className='enable-select pre-wrap'>{this.props.inboundCall.note}</p>
          </blockquote>

          <LinkToAppointmentContainer inboundCall={this.props.inboundCall} />
          <HumanCommentCount docId={this.props.inboundCall._id} />
          <Stamps fields={['removed', 'created']} doc={this.props.inboundCall} />
        </div>
        <CommentsContainer docId={this.props.inboundCall._id} />
        <div className='box-footer'>
          {
            this.props.inboundCall.removed
              ? <a onClick={() => this.props.unresolve(this.props.inboundCall._id)}>{TAPi18n.__('inboundCalls.unresolve')}</a>
            : <a onClick={() => this.props.resolve(this.props.inboundCall._id)}>{TAPi18n.__('inboundCalls.resolve')}</a>
          }
        </div>
      </div>
    )
  }
}
