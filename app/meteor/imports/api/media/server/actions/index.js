import { insert } from './insert'
import { uploadComplete } from './uploadComplete'

export const actions = ({ Media, MediaTags }) => ({
  insert: insert({ Media, MediaTags }),
  uploadComplete: uploadComplete({ Media })
})
