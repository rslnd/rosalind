import { Mongo } from 'meteor/mongo'
import { JobCollection, Job } from 'meteor/vsivsi:job-collection'
import actions from './actions'

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

let Messages = new Mongo.Collection('messages')
Messages.attachBehaviour('softRemovable')
Messages.helpers({ collection: () => Messages })
Messages.jobs = jobs
Messages.actions = actions({ Messages })
export default Messages
