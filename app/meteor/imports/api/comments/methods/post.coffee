module.exports = ({ Comments }) ->
  post: ({ docId, body }) ->
    check(docId, String)
    check(body, String)

    Comments.insert({ docId, body })
