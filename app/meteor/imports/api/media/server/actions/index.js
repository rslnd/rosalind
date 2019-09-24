import { insert } from './insert'
import { uploadComplete } from './uploadComplete'
import { update } from './update'

export const actions = ({ Media }) => ({
  insert: insert({ Media }),
  uploadComplete: uploadComplete({ Media }),
  update: update({ Media })
})
