import extend from 'lodash/extend'
import post from './post'

export default function({ Comments }) {
  return extend({},
    post({ Comments })
  )
}
