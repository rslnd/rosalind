import React from 'react'
import { Box } from '../components/Box'
import { Week } from './Week'

const avoidPageBreak = {
  pageBreakInside: 'avoid'
}

export const PreviewBoxes = ({ previews, mapUserIdToName, mapUserIdToUsername }) => (
  <div>
    {
      previews.map((p, i) =>
        <div key={i} style={avoidPageBreak}>
          <div className='row'>
            <div className='col-md-12'>
              <Box
                title={<span>
                  {/* Weirdest Bug so far: When interpolating properties of p.calendar */}
                  {/* as texts here, it works in the browser but silently skips */}
                  {/* rendering the whole PreviewBoxes on headless Chrome during PDF generation*/}
                  <b>{'Termine' || p.calendar.name}</b> &middot; Vorschau
                </span>}
                icon={'users' || p.calendar.icon}>
                <Week
                  preview={p.preview}
                  mapUserIdToName={mapUserIdToName}
                  mapUserIdToUsername={mapUserIdToUsername} />
              </Box>
            </div>
          </div>
        </div>
      )
    }
  </div>
)
