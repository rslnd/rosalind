import post from './post'

export default ({ Events }) => {
  return Object.assign({}, post({ Events }))
}
