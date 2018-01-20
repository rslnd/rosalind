import React from 'react'
import max from 'lodash/max'
import { TextField } from '../../components/form'
import { TAPi18n } from 'meteor/tap:i18n'
import { Tags } from '../../../api/tags'
import { currency } from '../../../util/format'

export const calculateRevenue = (tagIds = []) => {
  if (tagIds && tagIds.length > 0) {
    const tags = Tags.find({ _id: { $in: tagIds } })
    return max(tags.map(t => t.defaultRevenue))
  }
}

export class RevenueField extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      overriddenValue: '',
      focused: false
    }

    this.handleFocus = this.handleFocus.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.renderValue = this.renderValue.bind(this)
  }

  componentWillReceiveProps (props) {
    // if (props.revenue.meta.pristine) {
    //   const autoRevenue = calculateRevenue(props.tags.input.value)
    //   props.revenue.input.onChange(autoRevenue)
    // }
  }

  handleFocus () {
    this.setState({
      focused: true
    })
  }

  handleBlur () {
    this.props.revenue.input.onChange(e.target.value)

    this.setState({
      focused: false
    })
  }

  handleChange (e) {
    this.props.revenue.input.onChange(e.target.value)

    this.setState({
      overriddenValue: e.target.value
    })
  }

  renderValue (e) {
    const { revenue, tags } = this.props
    const calculatedRevenue = calculateRevenue(tags.input.value)

    if (this.state.focused && revenue.meta.pristine) {
      return calculatedRevenue
    } else if (!this.state.focused && this.state.overriddenValue) {
      return currency(this.state.overriddenValue)
    } else if (this.state.focused) {
      return this.state.overriddenValue
    } else {
      if (calculatedRevenue > 0) {
        return currency(calculatedRevenue)
      } else {
        return ''
      }
    }
  }

  render () {
    const value = this.renderValue() || ''

    return (
      <div>
        {
          (value || this.state.focused)
            ? <TextField
              fullWidth
              value={value}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              label={TAPi18n.__('appointments.revenue')}
            />
            : null
        }
      </div>
    )
  }
}
