import processJobs from './processJobs'
import uploadStream from './uploadStream'
import uploadDdp from './uploadDdp'

export default function () {
  processJobs()
  uploadStream()
  uploadDdp()
}
