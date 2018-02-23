import React from 'react'
import isEqual from 'lodash/isEqual'
import omitBy from 'lodash/fp/omitBy'

const omitUncomparable = omitBy((v, k) => {
  return (typeof v === 'function')
})

const propsEqual = (a, b) =>
  isEqual(omitUncomparable(a), omitUncomparable(b))

export const withMethodData = fetcher =>
  WrappedComponent =>
    class WithMethodData extends React.Component {
      constructor (props) {
        super(props)

        console.log('b', props)
        this.state = {
          isLoading: true,
          data: null,
          error: null
        }

        this.fetch = this.fetch.bind(this)
      }

      componentWillReceiveProps (nextProps) {
        if (!propsEqual(this.props, nextProps)) {
          this.fetch(nextProps)
        }
      }

      componentDidMount () {
        this.fetch(this.props)
      }

      fetch (props) {
        this.setState({ isLoading: true })

        return fetcher(props)
          .then(data =>
            this.setState({
              isLoading: false,
              data,
              error: null
            })
          )
          .catch(e =>
            this.setState({
              isLoading: false,
              data: null,
              error: null
            }))
      }

      render () {
        return <WrappedComponent
          {...this.props}
          {...this.state.data}
          {...this.state}
        />
      }

    }
