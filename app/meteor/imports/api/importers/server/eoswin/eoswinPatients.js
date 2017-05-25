import fs from 'fs'
import { exec } from 'child_process'
import { LineStream } from 'byline'
import iconv from 'iconv-lite'
import { Meteor } from 'meteor/meteor'
import { Importers } from '../../'
const execSync = Meteor.wrapAsync(exec)

export const eoswinPatients = (job, callback) => {
  job.log('EoswinPatients: Running')

  let count = 0
  const total = parseInt(execSync(`wc -l ${job.data.path}`))

  const stream = fs.createReadStream(job.data.path)
  const lineStream = new LineStream()

  stream
    .pipe(iconv.decodeStream('WINDOWS-1252'))
    .pipe(lineStream)

  lineStream
    .on('data', Meteor.bindEnvironment((content) => {
      lineStream.pause()

      Importers.actions.eoswin.patients.call({
        content,
        name: job.data.path,
        quiet: true
      }, (err, id) => {
        if (err) {
          job.log(`eoswinPatients: ${err}`)
          console.error('[Importers] Server: eoswinPatients', err)
        }

        count++

        if (count % 1000 === 0) {
          job.progress(count, total, { echo: true }, () => {
            lineStream.resume()
          })
        } else {
          lineStream.resume()
        }
      })
    }))
    .on('error', Meteor.bindEnvironment((err) => {
      job.log(`eoswinPatients: ${err}`)
      console.error('[Importers] Server: eoswinPatients', err)
    }))
    .on('end', Meteor.bindEnvironment(() => {
      job.log(`eoswinPatients: Imported ${count} records - done`)
      job.done()
      callback()
    }))
}
