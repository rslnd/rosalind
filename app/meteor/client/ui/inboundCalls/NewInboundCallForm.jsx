import React from 'react'
import { reduxForm } from 'redux-form'
import { Button } from 'react-bootstrap'

const fields = {
  firstName: {
    type: 'text'
  },
  lastName: {
    type: 'text'
  }
}

class NewInboundCallFormComponent extends React.Component {
  render () {
    const { fields: { lastName, firstName }, handleSubmit } = this.props

    return (
      <form onSubmit={handleSubmit}>
        <fieldset>
          <input name="lastName" {...lastName} />
          <input name="firstName" {...firstName} />
          <Button type="submit" bsStyle="primary" />
        </fieldset>
      </form>
    )
  }
}

export const NewInboundCallForm = reduxForm({
  form: 'newInboundCall',
  fields: Object.keys(fields)
})(NewInboundCallFormComponent)
