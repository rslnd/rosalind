import { Mongo } from 'meteor/mongo'
import { JobCollection, Job } from 'meteor/simonsimcity:job-collection'
import actions from './actions'
import Schema from './schema'
import * as fields from './fields'

const jobs = new JobCollection('reports', {
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

let Reports = new Mongo.Collection('reports')
Reports.attachSchema(Schema)
Reports.actions = actions({ Reports })
Reports.fields = fields
Reports.jobs = jobs

export default Reports
