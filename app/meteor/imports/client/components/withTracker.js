import React from 'react'
import { withTracker as withMeteorData } from 'meteor/react-meteor-data'
import { Loading } from './Loading'
import { withErrorBoundary } from '../layout/ErrorBoundary'

const wrapComposer = composer => props => {
  if (!props) {
    console.warn('[withTracker] No props supplied to composer', composer)
    return { isLoading: true }
  } else {
    return composer(props)
  }
}

const wrapComponent = Component => props => {
  if (!props || props.isLoading) {
    console.log('[withTracker] No props returned')
    return <Loading />
  } else {
    return <Component {...props} />
  }
}

export const withTracker = composer => component =>
  withErrorBoundary(withMeteorData(wrapComposer(composer))(wrapComponent(component)))
