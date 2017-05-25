import { Popover, PopoverAnimationVertical } from 'material-ui/Popover'
import { NewAppointmentContainer } from 'client/ui/appointments/new/NewAppointmentContainer'

export const NewAppointmentPopover = ({ open, anchorEl, onClose, assigneeId, time }) => (
  <Popover
    open={open}
    anchorEl={anchorEl}
    animated
    animation={PopoverAnimationVertical}
    anchorOrigin={{
      horizontal: assigneeId ? 'middle' : 'right',
      vertical: 'top'
    }}
    targetOrigin={{
      horizontal: assigneeId ? 'middle' : 'right',
      vertical: 'bottom'
    }}
    style={{ overflowY: 'visible' }}
    autoCloseWhenOffScreen={false}
    onRequestClose={onClose}
    >
    <div style={{
      minWidth: 400,
      maxWidth: 400
    }}>
      <NewAppointmentContainer
        assigneeId={assigneeId}
        time={time}
        onClose={onClose} />
    </div>
  </Popover>
)
