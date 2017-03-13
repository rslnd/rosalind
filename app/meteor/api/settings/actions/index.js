import { set } from './set'

export default function ({ Settings }) {
  return {
    set: set({ Settings })
  }
}
