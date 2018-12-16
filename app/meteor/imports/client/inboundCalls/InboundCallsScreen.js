import React from 'react'
import FlipMove from 'react-flip-move'
import { __ } from '../../i18n'
import { InboundCallContainer } from './InboundCallContainer'
import { Box } from '../components/Box'
import { Loading } from '../components/Loading'

export const InboundCallsList = ({ isLoading, inboundCalls = [], topic, resolve, unresolve, noData = null }) => (
  (isLoading && inboundCalls.length === 0)
  ? <Loading />
  : <div className='row'>
    <FlipMove>
      {inboundCalls.map((inboundCall) => (
        <div key={inboundCall._id} className='col-md-6'>
          <InboundCallContainer
            _id={inboundCall._id}
            showTopic
          />
        </div>
      ))}
      {
        (inboundCalls.length === 0)
        ? noData : null
      }
    </FlipMove>
  </div>
)

export const InboundCallsScreen = props =>
  <div className='content'>
    <InboundCallsList {...props} noData={
      <div key='inboundCallsEmpty' className='col-md-12'>
        <Box type='success' title={__('ui.allDone')}>
          {__('inboundCalls.empty')}
        </Box>
      </div>
    } />
  </div>
