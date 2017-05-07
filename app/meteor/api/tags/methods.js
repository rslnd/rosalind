import fromPairs from 'lodash/fromPairs'

export default ({ Tags }) => {
  const findOneOrInsert = (selector) => {
    const tag = Tags.findOne({ tag: selector.tag })
    return tag || Tags.insert(selector)
  }

  // Maps Tag ids to reporting categories, eg.:
  //   { 'fe2r9qedo': 'surgery' }
  const getMappingForReports = () => {
    const tags = Tags.find().fetch()

    return fromPairs(tags.map((tag) => {
      return [ tag._id, tag.reportAs || null ]
    }))
  }

  return { findOneOrInsert, getMappingForReports }
}
