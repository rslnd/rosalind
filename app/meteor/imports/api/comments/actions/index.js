import { post } from './post'
import { remove } from './remove'
import { edit } from './edit'

export default function ({ Comments }) {
  return {
    post: post({ Comments }),
    remove: remove({ Comments }),
    edit: edit({ Comments })
  }
}
