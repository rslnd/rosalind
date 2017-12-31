import React from 'react'
import { Box } from '../components/Box'
import { Week } from './Week'

const avoidPageBreak = {
  pageBreakInside: 'avoid'
}

export const Preview = ({ previews, mapUserIdToUsername, mapUserIdToName, getCalendar }) =>
  <div>
    {
      previews.map(preview =>
        <div key={preview.calendarId} className='row' style={avoidPageBreak}>
          <div className='col-md-12'>
            <Box title={<span>
              <b>{getCalendar(preview.calendarId).name}</b> &middot; Vorschau
            </span>} icon={getCalendar(preview.calendarId).icon}>
              <Week
                preview={preview.preview}
                mapUserIdToUsername={mapUserIdToUsername}
                mapUserIdToName={mapUserIdToName}
              />
            </Box>
          </div>
        </div>
      )
    }
  </div>
