import { ApolloServer } from 'apollo-server-express'
import { WebApp } from 'meteor/webapp'
import { getUser } from 'meteor/apollo'
import typeDefs from './schema'
import * as resolvers from './resolvers'
import * as api from '../../../api'

export default () => {
  const server = new ApolloServer({
    graphiql: true,
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const user = await getUser(req.headers.authorization)
      if (!user || user.removed) {
        console.error('[GraphQL] Access denied', req.ip)
        throw new Error('Access denied')
      }

      return { user, api }
    }
  })

  server.applyMiddleware({
    app: WebApp.connectHandlers,
    path: '/graphql'
  })

  WebApp.connectHandlers.use('/graphql', (req, res) => {
    if (req.method === 'GET') {
      res.end()
    }
  })
}
