import { Buffer } from 'buffer/' // Trailing slash is required

export default () => {
  window.Buffer = Buffer
}
