import React from 'react'
import FlipMove from 'react-flip-move'
import { __ } from '../../i18n'
import { InboundCallItem } from './InboundCallItem'
import { Box } from '../components/Box'

export const InboundCallsScreen = ({ inboundCalls, resolve, unresolve }) => (
  <div className='content'>
    <div className='row'>
      <FlipMove>
        {inboundCalls.map((inboundCall) => (
          <div key={inboundCall._id} className='col-md-6'>
            <InboundCallItem inboundCall={inboundCall} resolve={resolve} unresolve={unresolve} />
          </div>
        ))}
        {
          (inboundCalls.length === 0)
          ? (
            <div key='inboundCallsEmpty' className='col-md-12'>
              <Box type='success' title={__('ui.allDone')}>
                {__('inboundCalls.empty')}
              </Box>
            </div>
          ) : null
        }
      </FlipMove>
    </div>
  </div>
)
