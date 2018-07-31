import React from 'react'
import debounce from 'lodash/debounce'
import flatten from 'lodash/flatten'
import { withTracker } from '../components/withTracker'
import { subscribe } from '../../util/meteor/subscribe'
import { Box } from '../components/Box'
import { compose, withHandlers, withState } from 'recompose'
import { InboundCalls } from '../../api/inboundCalls'
import TextField from '@material-ui/core/TextField'
import { InboundCallsList } from './InboundCallsScreen'
import { __ } from '../../i18n'
import { ContentHeader } from '../components/ContentHeader'

const debouncedSubscribe = debounce(subscribe, 150)

const composer = ({ query = '' }) => {
  const subscription = debouncedSubscribe('inboundCalls-resolved', { query })

  const selector =
    query && query.length > 3
    ? {
      $or: flatten(query.split(' ').map(word => [
        { lastName: { $regex: '^' + word, $options: 'i' } },
        { note: { $regex: word, $options: 'i' } },
        { telephone: { $regex: word, $options: 'i' } },
        { firstName: { $regex: '^' + word, $options: 'i' } }
      ]))
    } : {
      removed: true
    }

  const inboundCalls = InboundCalls.find(selector, {
    sort: {
      removedAt: -1
    },
    removed: true,
    limit: 200
  }).fetch()

  const isLoadingCalls = (subscription && !subscription.ready()) && inboundCalls.length === 0

  const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
  const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })

  return {
    isLoadingCalls,
    inboundCalls,
    resolve,
    unresolve
  }
}

const ResolvedScreenComponent = ({ handleQueryChange, query, isLoadingCalls, inboundCalls, resolve, unresolve }) =>
  <div>
    <ContentHeader title={__('inboundCalls.thisResolved')} />
    <div className='content'>
      <TextField
        value={query}
        onChange={handleQueryChange}
        label='Suche'
        fullWidth
        style={searchStyle}
      />

      <InboundCallsList
        isLoading={isLoadingCalls}
        inboundCalls={inboundCalls}
        resolve={resolve}
        unresolve={unresolve}
      />
    </div>
  </div>

const searchStyle = {
  marginBottom: 30
}

export const ResolvedScreen = compose(
  withState('query', 'changeQuery', ''),
  withHandlers({
    handleQueryChange: props => e => props.changeQuery(e.target.value)
  }),
  withTracker(composer)
)(ResolvedScreenComponent)
