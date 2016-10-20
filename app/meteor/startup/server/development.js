/* global Package */
import * as Api from 'api'
import { Meteor } from 'meteor/meteor'

const seed = () => {
  const seeds = {
    timesheets: Api.Timesheets
  }

  Meteor.methods({
    seed: () => Package['seed'].seed(seeds)
  })
}

export default () => {
  if (process.env.NODE_ENV === 'production') { return }

  global.Api = Api

  seed()
}
