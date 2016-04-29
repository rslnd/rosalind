import { uploadStream } from './shared'
import processJobs from './processJobs'

export default function() {
  uploadStream()
  processJobs()
}
