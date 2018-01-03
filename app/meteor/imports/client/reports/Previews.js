import React from 'react'
import { Box } from '../components/Box'
import { Week } from './Week'

const avoidPageBreak = {
  pageBreakInside: 'avoid'
}

export const Previews = ({ previews, mapUserIdToUsername, mapUserIdToName }) =>
  <div>
    {
      previews.map(p =>
        <div key={p.calendarId} className='row' style={avoidPageBreak}>
          <div className='col-md-12'>
            <Box title={<span>
              <b>{p.calendar.name}</b> &middot; Vorschau
            </span>} icon={p.calendar.icon}>
              <Week
                preview={p.preview}
                mapUserIdToUsername={mapUserIdToUsername}
                mapUserIdToName={mapUserIdToName}
              />
            </Box>
          </div>
        </div>
      )
    }
  </div>
