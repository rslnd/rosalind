import { insert } from './insert'

export const actions = ({ Media }) => ({
  insert: insert({ Media })
})
