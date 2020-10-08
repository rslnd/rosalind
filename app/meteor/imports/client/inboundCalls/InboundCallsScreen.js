import React from 'react'
import FlipMove from 'react-flip-move'
import { __ } from '../../i18n'
import { InboundCallContainer } from './InboundCallContainer'
import { Box } from '../components/Box'
import { Loading } from '../components/Loading'

export const InboundCallsList = ({ isLoading, inboundCalls = [], topic, resolve, unresolve, noData = null }) => (
  (isLoading && inboundCalls.length === 0)
    ? <Loading />
    : <div>
      {
        (inboundCalls.length === 0)
          ? noData : null
      }
      <div style={columnsContainer}>
        <Column mod2={0} inboundCalls={inboundCalls} />
        <Column mod2={1} inboundCalls={inboundCalls} />
      </div>
    </div>
)

const Column = ({ mod2, inboundCalls }) =>
  <FlipMove style={columnStyle}>
    {inboundCalls.filter((c, i) => ((i % 2) === mod2)).map((inboundCall) => (
      <div key={inboundCall._id} style={callStyle}>
        <InboundCallContainer
          _id={inboundCall._id}
          showTopic
        />
      </div>
    ))}
  </FlipMove>

const columnsContainer = {
  display: 'flex'
}

const columnStyle = {
  flex: 1
}

const callStyle = {
  padding: 10
}

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
