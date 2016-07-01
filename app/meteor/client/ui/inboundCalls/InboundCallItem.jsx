import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { zerofix } from 'util/zerofix'
import { Stamps } from 'client/ui/helpers/Stamps'
import { CommentsContainer, HumanCommentCount } from 'client/ui/comments'

export const InboundCallItem = ({ inboundCall, resolve, unresolve }) => {
  return (
    <div className="box box-widget">
      <div className="box-header">
        <h4 className="username enable-select">
          <b>{inboundCall.lastName}</b> {inboundCall.firstName}&ensp;
          <small>{TAPi18n.__(`inboundCalls.${inboundCall.privatePatient ? 'private' : 'insurance'}`)}</small>
        </h4>
        <h3 className="description enable-select">{zerofix(inboundCall.telephone)}</h3>
      </div>
      <div className="box-body">
        <blockquote>
          <p className="enable-select pre-wrap">{inboundCall.note}</p>
        </blockquote>
        <HumanCommentCount docId={inboundCall._id} />
        <Stamps fields={['removed', 'created']} doc={inboundCall} />
      </div>
      <CommentsContainer docId={inboundCall._id} />
      <div className="box-footer">
        {
          inboundCall.removed
            ? <a onClick={() => unresolve(inboundCall._id)}>{TAPi18n.__('inboundCalls.unresolve')}</a>
          : <a onClick={() => resolve(inboundCall._id)}>{TAPi18n.__('inboundCalls.resolve')}</a>
        }
      </div>
    </div>
  )
}
