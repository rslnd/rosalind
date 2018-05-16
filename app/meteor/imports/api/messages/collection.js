import { Mongo } from 'meteor/mongo'
import { JobCollection, Job } from 'meteor/simonsimcity:job-collection'
import actions from './actions'
import schema from './schema'

const jobs = new JobCollection('messages', {
  transform: (doc) => {
    let j
    try {
      j = new Job(jobs, doc)
    } catch (e) {
      j = doc
    }
    return j
  }
})

let Messages = {}

// Work around weird duplicate collection bug
if (Meteor.isServer) {
  Messages = new Mongo.Collection('messages')
  Messages.attachSchema(schema)
  Messages.helpers({ collection: () => Messages })
  Messages.jobs = jobs
  Messages.actions = actions({ Messages })
}

export default Messages
