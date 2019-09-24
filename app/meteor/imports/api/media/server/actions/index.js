import { insert } from './insert'
import { uploadComplete } from './uploadComplete'

export const actions = ({ Media }) => ({
  insert: insert({ Media }),
  uploadComplete: uploadComplete({ Media })
})
