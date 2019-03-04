import React from 'react'
import isEqual from 'lodash/isEqual'
import omitBy from 'lodash/fp/omitBy'

const omitUncomparable = omitBy((v, k) => {
  return (typeof v === 'function')
})

const propsEqual = (a, b) =>
  isEqual(omitUncomparable(a), omitUncomparable(b))

const makeCancelable = promise => {
  let isCanceled = false

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => isCanceled ? reject({ isCanceled: true }) : resolve(val), //eslint-disable-line
      error => isCanceled ? reject({ isCanceled: true }) : reject(error) //eslint-disable-line
    )
  })

  return {
    promise: wrappedPromise,
    cancel () {
      isCanceled = true
    }
  }
}

export const withPromise = fetcher =>
  WrappedComponent =>
    class WithPromise extends React.Component {
      constructor (props) {
        super(props)

        this.state = {
          isLoading: true,
          data: null,
          error: null
        }

        this.promiseInFlight = null

        this.fetch = this.fetch.bind(this)
        this.cancel = this.cancel.bind(this)
      }

      componentWillReceiveProps (nextProps) {
        if (!propsEqual(this.props, nextProps)) {
          this.fetch(nextProps)
        }
      }

      componentDidMount () {
        this.fetch(this.props)
      }

      componentWillUnmount () {
        this.cancel()
      }

      cancel () {
        if (this.promiseInFlight) {
          this.promiseInFlight.cancel()
        }
      }

      fetch (props) {
        this.cancel()
        this.setState({ isLoading: true })

        this.promiseInFlight = makeCancelable(fetcher(props))

        this.promiseInFlight.promise.then(data =>
          this.setState({
            isLoading: false,
            data,
            error: null
          })
        )
          .catch(reason => {
            if (!reason.isCanceled) {
              this.setState({
                isLoading: false,
                data: null,
                error: reason
              })
            }
          })
      }

      render () {
        const { data, ...rest } = this.state

        return <WrappedComponent
          {...this.props}
          {...data}
          {...rest}
        />
      }
    }
