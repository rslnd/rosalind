const dbfstream = require('@mickeyjohn/dbfstream')
const logger = require('./logger')

const dbfToJSON = async ({ path, encoding = 'iso-8859-1' }) => {
  return new Promise(async (resolve, reject) => {
    const startAt = new Date()

    const records = []

    dbfstream(path, encoding)
      .on('data', r => {
        records.push(r)
      })
      .on('end', () => {
        const recordsJSON = JSON.stringify(records)

        logger.info(`[dbfToJSON] Opened ${path} (encoding ${encoding}) with ${records.length} parsed in ${(new Date() - startAt) / 1000} seconds`)

        resolve(recordsJSON)
      })
      .on('error', err => {
        reject(err)
      })
  })
}

module.exports = { dbfToJSON }
