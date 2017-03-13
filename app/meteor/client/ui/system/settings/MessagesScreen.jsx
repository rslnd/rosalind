import { Box } from 'client/ui/components/Box'
import { MessagesSettings } from './MessagesSettings'

export const MessagesScreen = ({ get, set }) => (
  <div className="content">
    <Box>
      <MessagesSettings get={get} set={set} />
    </Box>
  </div>
)
