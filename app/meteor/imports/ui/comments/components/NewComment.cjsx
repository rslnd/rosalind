React = require 'react'
{ TAPi18n } = require 'meteor/tap:i18n'
{ Comments } = require '/imports/api/comments'
{ Avatar } = require '/imports/ui/users/components/Avatar.cjsx'

class NewComment extends React.Component
  constructor: (props) ->
    super(props)
    @state =
      body: ''

  handleBodyChange: (e) =>
    @setState({ body: e.target.value })

  handleSubmit: (e) =>
    e.preventDefault()
    body = @state.body.trim()
    return unless body
    Comments.methods.post({ body, docId: @props.docId })
    @setState({ body: '' })

  render: ->
    <div className='box-footer'>
      <form onSubmit={ @handleSubmit }>
        <Avatar />
        <div className='img-push'>
          <label className='sr-only' for='add-comment-{ @props.docId }'>
            { TAPi18n.__('ui.press_enter_to_post_comment') }
          </label>
          <input type='text' className='form-control input-sm'
            placeholder=TAPi18n.__('ui.press_enter_to_post_comment')
            value={ @state.body }
            onChange={ @handleBodyChange } />
        </div>
      </form>
    </div>

module.exports = { NewComment }
