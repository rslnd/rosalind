import { process as server } from 'meteor/clinical:env'
import * as Api from 'api'

export default () => {
  if (server.env.NODE_ENV !== 'production') {
    window.Api = Api
  }
}
