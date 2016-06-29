{ Comments } = require 'api/comments'

module.exports = ->
  Comments.permit(['insert', 'update', 'remove']).ifHasRole('admin').apply()
  Comments.permit(['insert']).ifLoggedIn().apply()
  Comments.permit(['update']).ifLoggedIn().exceptProps(['createdBy', 'createdAt', 'docId']).apply()
