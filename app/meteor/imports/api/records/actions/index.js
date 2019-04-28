import { insert } from './insert'
import { remove } from './remove'
import { setNote } from './setNote'

export const actions = ({ Records }) => ({
  insert: insert({ Records }),
  remove: remove({ Records }),
  setNote: setNote({ Records })
})
