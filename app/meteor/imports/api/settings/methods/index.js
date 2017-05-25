import { get } from './get'
import { set } from './set'

export default function ({ Settings }) {
  return {
    get: get({ Settings }),
    set: set({ Settings })
  }
}
