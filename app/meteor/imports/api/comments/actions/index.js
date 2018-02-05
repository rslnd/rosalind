import { post } from './post'
import { remove } from './remove'

export default function ({ Comments }) {
  return {
    post: post({ Comments }),
    remove: remove({ Comments })
  }
}
