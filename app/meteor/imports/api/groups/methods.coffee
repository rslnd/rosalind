module.exports = (collection) ->
  all: (selector = {}) ->
    collection.find(selector, { sort: { order: 1 } }).fetch()
