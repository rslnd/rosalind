import React, { useState } from 'react'
import { Icon } from '../../../components/Icon'
import { LabelButton } from '../../../components/LabelButton'
import { HoverTooltip } from '../../../components/HoverTooltip'
import { darkGray, primary } from '../../../layout/styles'

const iconStyle = (color) => ({
  color,
  cursor: 'pointer',
  marginLeft: 5
})

const infoText = 'Wird an jedem Tag angezeigt. Infotext befindet sich am oberen Seitenrand und färbt sich mit Rufzeichen rot.'

export const CalendarNoteLabel = () => {
  const [hover, setHover] = useState(false)
  const color = hover ? primary : darkGray

  return (
    <span>
      {/* Do not steal focus from the text field while editing, so a click on
          the heading does not close the field */}
      <LabelButton onMouseDown={e => e.preventDefault()}>
        Wichtige Information
      </LabelButton>
      {/* Custom (non-native) tooltip that shows the info text on hover.
          HoverTooltip portals to body and corrects the body zoom (1.221). */}
      <HoverTooltip placement='bottom-end' title={infoText}>
        <span
          // Do not steal focus from the text field, so edit mode stays open
          // when hovering/clicking the icon (no blur -> no submitOnBlur)
          onMouseDown={e => e.preventDefault()}
          // Do not switch the field into edit mode when clicking the icon
          onClick={e => e.stopPropagation()}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={iconStyle(color)}>
          <Icon name='info-circle' />
        </span>
      </HoverTooltip>
    </span>
  )
}
