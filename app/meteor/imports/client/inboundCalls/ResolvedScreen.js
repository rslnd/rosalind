import React, { useState } from 'react'
import debounce from 'lodash/debounce'
import flatten from 'lodash/flatten'
import { useTracker } from 'meteor/react-meteor-data'
import { withTracker } from '../components/withTracker'
import { subscribe } from '../../util/meteor/subscribe'
import { compose, withHandlers, withState } from 'recompose'
import { connect } from 'react-redux'
import { InboundCalls, InboundCallsTopics } from '../../api/inboundCalls'
import TextField from '@material-ui/core/TextField'
import { InboundCallsList } from './InboundCallsScreen'
import { __ } from '../../i18n'
import { ContentHeader } from '../components/ContentHeader'
import { PatientPicker } from '../patients/picker'
import identity from 'lodash/identity'
import { hasRole } from '../../util/meteor/hasRole'
import { Comments, Patients, Users } from '../../api'
import { filterComments } from './filterComments'
import { UserPicker } from '../users/UserPicker'
import { TopicPicker } from './TopicPicker'
import { withRouter } from 'react-router'
import { Icon } from '../components/Icon'
import { onSearchPatient } from './InboundCallsContainer'

const debouncedSubscribe = debounce(subscribe, 150)

const usePagination = (pageSize = 15) => {
  const [page, setPage] = useState(0)
  const firstPage = () => setPage(0)
  const nextPage = () => setPage(page + 1)
  const prevPage = () => page > 0 && setPage(page - 1)

  const Link = ({ onClick, children }) =>
    onClick
    ? <a href='#' onClick={e => {
      e.preventDefault()
      onClick()
    }}>{children}</a>
    : <span className='o-70'>{children}</span>

  const Pagination = ({ items = [] }) => {
    const hasNext = items.length === pageSize

    return <div className='tc'>
      <Link onClick={page !== 0 && firstPage}>
        <Icon name='angle-double-left'/>&nbsp;Neueste
      </Link>
      &emsp;
      <Link onClick={page !== 0 ? prevPage : null}>
        <Icon name='angle-left' />&nbsp;Neuere
      </Link>
      &emsp;
      Seite {page + 1}
      &emsp;
      <Link onClick={hasNext && nextPage}>
        Ältere <Icon name='angle-right' />
      </Link>
    </div>
  }
  return [page, Pagination]
}

const ResolvedContainer = (props) => {
  const [page, Pagination] = usePagination()
  const [isCommentFilterEnabled, setCommentFilterEnabled] = useState(true)
  const [query, changeQuery] = useState('')

  const handleQueryChange = e => changeQuery(e.target.value)
  const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
  const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })
  const edit = (_id, field) => value =>
    InboundCalls.methods.edit.call({ _id, [field]: value })
  const fullNameWithTitle = _id => {
    const user = Users.findOne({ _id }, { removed: true })
    return user && Users.methods.fullNameWithTitle(user)
  }

  const handleChangeTopic = (_id) => {
    if (_id) {
      const topic = InboundCallsTopics.findOne({ _id })
      const path = `/inboundCalls/resolved/${topic.slug}`
      props.history.replace(path)
    } else {
      props.history.replace('/inboundCalls/resolved/')
    }
  }

  const props3 = {
    isCommentFilterEnabled,
    setCommentFilterEnabled,
    query,
    handleQueryChange,
    resolve,
    unresolve,
    edit,
    fullNameWithTitle,
    handleChangeTopic,
    page,
    Pagination
  }

  const props2 = useTracker(() => {
    const userId = Meteor.userId()
    const canResolve = hasRole(userId, ['admin', 'inboundCalls-pin'])
    const canEdit = hasRole(userId, ['admin', 'inboundCalls-edit'])

    const topic = props.match.params.slug &&
    InboundCallsTopics.findOne({ slug: props.match.params.slug })

    const selector = {
      removed: true,
      topicId: topic ? topic._id : null
    }

    const subscription = subscribe('inboundCalls-2', {
        ...selector,
        page
    })

    if (props.patient) {
      selector.patientId = (props.patient.patientId || props.patient._id)
    }

    if (query && query.length > 2) {
      // todo query
    }
      // query && query.length > 2
      //   ? {
      //     $or: flatten(query.split(' ').map(word => [
      //       { lastName: { $regex: '^' + word, $options: 'i' } },
      //       { note: { $regex: word, $options: 'i' } },
      //       { telephone: { $regex: word, $options: 'i' } },
      //       { firstName: { $regex: '^' + word, $options: 'i' } }
      //     ]))
      //   } : (patient
      //     ? { patientId: (patient.patientId || patient._id) }
      //     : { removed: true })

    // TODO: Fix duplicate logic in InboundCallsContainer

    const inboundCalls = InboundCalls.find(selector, {
      sort: {
        removedAt: -1
      },
      removed: true
    }).fetch().map(inboundCall => {
      const rawComments = Comments.find({ docId: inboundCall._id }, { sort: { createdAt: 1 } }).fetch()

      const { comments, CommentsAction } = filterComments({
        comments: rawComments,
        Comments,
        inboundCall,
        enabled: isCommentFilterEnabled,
        setEnabled: setCommentFilterEnabled
      })

      return {
        ...inboundCall,
        canResolve: canResolve || (inboundCall.pinnedBy === userId || inboundCall.createdBy === userId),
        canEdit: canEdit || (inboundCall.createdBy === userId),
        patientId: (inboundCall.patientId || (inboundCall.payload && inboundCall.payload.patientId)),
        patient: (inboundCall.patientId || (inboundCall.payload && inboundCall.payload.patientId)) &&
          Patients.findOne({ _id: (inboundCall.patientId || (inboundCall.payload && inboundCall.payload.patientId)) }),
        comments,
        CommentsAction,
        topic: inboundCall.topicId && InboundCallsTopics.findOne({ _id: inboundCall.topicId })
      }
    })

    const appointmentIds = inboundCalls.map(c => c.appointmentId).filter(identity)
    if (appointmentIds.length >= 1) {
      subscribe('appointments', {
        appointmentIds: appointmentIds
      })
    }

    const patientIds = inboundCalls.map(c => c.patientId).filter(identity)
    if (patientIds.length >= 1) {
      subscribe('patients-name', {
        patientIds: patientIds
      })
    }
  
    const isLoadingCalls = (subscription && !subscription.ready())

    return {
      canResolve,
      canEdit,
      inboundCalls,
      isLoadingCalls,
      topic,
      selector,
      onSearchPatient: onSearchPatient(props.dispatch)
    }
  })
  return <Screen {...props} {...props3} {...props2} />
}


const Screen = ({ fullNameWithTitle, handleQueryChange, query, isLoadingCalls, inboundCalls, resolve, unresolve, edit, topic, handleChangeTopic, Pagination, onSearchPatient }) =>
  <div>
    <ContentHeader title={topic
      ? __('inboundCalls.thisResolvedTopic', { topic: topic.label })
      : __('inboundCalls.thisResolved')} />
    <div className='content'>

      <div className='flex w-100 pb3'>
        <div className='w-50 pr2'>
          <PatientPicker />
        </div>
        <div className='w-50 pl2'>
          <TopicPicker
            value={topic ? topic._id : null}
            onChange={handleChangeTopic}
          />
        </div>
      </div>

      {/* <TextField
        value={query}
        onChange={handleQueryChange}
        label='Suche'
        fullWidth
        style={searchStyle}
      /> */}

      <InboundCallsList
        isLoading={isLoadingCalls}
        inboundCalls={inboundCalls}
        resolve={resolve}
        unresolve={unresolve}
        edit={edit}
        fullNameWithTitle={fullNameWithTitle}
        onSearchPatient={onSearchPatient}
      />

      <Pagination items={inboundCalls} />
    </div>
  </div>

const searchStyle = {
  marginBottom: 30
}

export const ResolvedScreen = compose(
  withRouter,
  connect(state => ({
    patient: state.patientPicker.patient
  }))
)(ResolvedContainer)
