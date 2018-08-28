import React from 'react'
import { withTracker as withMeteorData } from 'meteor/react-meteor-data'
import { Loading } from './Loading'
import { withErrorBoundary } from '../layout/ErrorBoundary'
import { renderNothing } from 'recompose'

const wrapComposer = composer => props => {
  if (!props) {
    console.warn('[withTracker] No props supplied to composer', composer)
    return { noPropsSupplied: true }
  }

  const composedProps = composer(props)

  if (!composedProps) {
    return { noPropsSupplied: true }
  }

  return composedProps
}

const wrapComponent = Component => props => {
  if (!props || props.noPropsSupplied) {
    return null
  }

  if (props.isLoading) {
    return <Loading />
  }

  return <Component {...props} />
}

export const withTracker = composer => component =>
  withErrorBoundary(
    withMeteorData(
      wrapComposer(composer)
    )(
      wrapComponent(component)
    )
  )
