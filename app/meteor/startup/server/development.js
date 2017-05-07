import * as Api from 'api'

export default () => {
  if (process.env.NODE_ENV === 'production') { return }

  global.Api = Api
}
