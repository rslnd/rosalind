import Alert from 'react-s-alert'
import React from 'react'
import { __ } from '../../i18n'
import { zerofix } from '../../util/zerofix'
import { Stamps } from '../helpers/Stamps'
import { CommentsContainer, HumanCommentCount } from '../comments'
import { LinkToAppointmentContainer } from './LinkToAppointmentContainer'
import { InboundCallsTopics } from '../../api/inboundCalls'
import { highlightBackground, highlightColor } from '../layout/styles'
import { InlineEdit } from '../components/form'
import { prompt } from '../layout/Prompt'
import { TopicPicker } from './TopicPicker'
import { PatientName } from '../patients/PatientName'
import { EnlargeText } from '../components/EnlargeText'

export const InboundCall = (props) => {
  const {
    inboundCall,
    unresolve,
    resolve,
    edit,
    fullNameWithTitle,
  } = props

  const {
    lastName,
    firstName,
    note,
    topicId,
    removed,
    telephone,
    pinnedBy,
    payload,
    canResolve,
    canEdit,
    comments,
    _id
  } = inboundCall

  const patient = props.patient || inboundCall.patient

  const topic = props.topic || inboundCall.topic
  const topicLabel = topic && topic.label

  const style = pinnedBy ? pinnedStyle : null

  const handleTopicEdit = async () => {
    const newId = await prompt({
      // title: 'Verschieben',
      confirm: 'Verschieben',
      Component: TopicPicker,
      initialValue: topicId
    })
    await edit(_id, 'topicId')(newId)
    Alert.success(__('ui.moved'))
  }

  return (
    <div className='box box-widget' style={style}>
      <div className='box-header pb0'>
        <h4 className='username mb2 mt1 enable-select'>
          {
            ((lastName || firstName) && !patient) &&
              <>
                {
                  payload && payload.gender === 'Male' && 'Hr. ' ||
                  payload && payload.gender === 'Female' && 'Fr. ' || null
                }
                {
                  payload && (payload.titlePrepend + ' ')
                }

                <InlineEdit
                  onChange={edit(_id, 'lastName')}
                  canEdit={canEdit}
                  value={lastName}
                  placeholder={__('inboundCalls.lastName')}
                  hidePlaceholder
                  noUI
                >
                  <b>{lastName}</b>
                </InlineEdit>

                &nbsp;

                <InlineEdit
                  onChange={edit(_id, 'firstName')}
                  canEdit={canEdit}
                  placeholder={__('inboundCalls.firstName')}
                  hidePlaceholder
                  value={firstName}
                  noUI
                />
                &ensp;
              </>
          }

          {
            patient &&
              <LinkToAppointmentContainer inboundCall={inboundCall}>
                {({ onClick }) =>
                  <span style={linkStyle} onClick={onClick}>
                    <PatientName patient={patient} />
                  </span>
                }
              </LinkToAppointmentContainer>
          }


          <small
            onClick={canEdit ? handleTopicEdit : null}
            style={canEdit ? { cursor: 'pointer'} : null}
          >
            {topicLabel || (canEdit && __('inboundCalls.thisOpen') + ' ')}
          </small>
        </h4>

        {
          payload && (payload.existingPatient === false) && '(neu) '
        }

        {
          payload && payload.email && (payload.email + ' ')
        }

        {
          payload && payload.birthdate && (payload.birthdate + ' ')
        }

        {telephone &&
          <InlineEdit
            onChange={edit(_id, 'telephone')}
            canEdit={canEdit}
            value={zerofix(telephone)}
            noUI
            placeholder={__('inboundCalls.telephone')}
            hidePlaceholder
            fullWidth>
            <EnlargeText icon={false} value={zerofix(telephone)}>
              <h4 style={telephoneStyle} className='description mv2 enable-select'>{zerofix(telephone)}</h4>
            </EnlargeText>
          </InlineEdit>
        }
        {
          patient && patient.contacts && patient.contacts.find(c => c.channel === 'Phone') &&
            <EnlargeText icon={false} value={zerofix(patient.contacts.find(c => c.channel === 'Phone').value)}>
              <h4 className='description enable-select'>
                {zerofix(patient.contacts.find(c => c.channel === 'Phone').value)}
              </h4>
            </EnlargeText>
        }
      </div>
      <div className='box-body pt0'>
        <InlineEdit
          onChange={edit(_id, 'note')}
          canEdit={canEdit}
          multiline
          value={note}
          noUI
          fullWidth>
          <p style={noteStyle} className='enable-select pre-wrap'>{note}</p>
        </InlineEdit>
        <HumanCommentCount comments={comments} />
        <Stamps
          collectionName='inboundCalls'
          fields={['removed', 'created']}
          doc={inboundCall}
        />
      </div>
      <CommentsContainer
        comments={comments}
        docId={inboundCall._id}
        style={style}
        canCollapse={false}
      />
      <div className='box-footer'>
        {
          ((pinnedBy && canResolve) || !pinnedBy)
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

const noteStyle = {
  fontSize: '110%'
}

const telephoneStyle = {
  margin: '0px 0px 5px 0px'
}

const pinnedStyle = {
  backgroundColor: highlightBackground,
  color: highlightColor
}

const linkStyle = {
  cursor: 'pointer'
}
