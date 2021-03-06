import React from 'react'
import { __ } from '../../i18n'
import { InboundCall } from './InboundCall'
import { Box } from '../components/Box'
import { Loading } from '../components/Loading'
import { Link } from 'react-router-dom'

export const InboundCallsList = ({ isLoading, inboundCalls = [], topic, resolve, unresolve, edit, noData = null, fullNameWithTitle, onSearchPatient }) => (
  (isLoading)
    ? <Loading />
    : <div>
      {
        (inboundCalls.length === 0)
          ? noData : null
      }
      <div style={columnsContainer}>
        <Column mod2={0} inboundCalls={inboundCalls} topic={topic} resolve={resolve} unresolve={unresolve} edit={edit} fullNameWithTitle={fullNameWithTitle} onSearchPatient={onSearchPatient} />
        <Column mod2={1} inboundCalls={inboundCalls} topic={topic} resolve={resolve} unresolve={unresolve} edit={edit} fullNameWithTitle={fullNameWithTitle} onSearchPatient={onSearchPatient} />
      </div>
    </div>
)

const Column = ({ mod2, inboundCalls, topic, resolve, unresolve, edit, fullNameWithTitle, onSearchPatient }) =>
  <div style={columnStyle}>
    {
      inboundCalls.filter((c, i) => ((i % 2) === mod2)).map((inboundCall) => (
        <div key={inboundCall._id} style={callStyle}>
          <InboundCall
            inboundCall={inboundCall}
            topic={topic}
            resolve={resolve}
            unresolve={unresolve}
            edit={edit}
            fullNameWithTitle={fullNameWithTitle}
            onSearchPatient={onSearchPatient}
          />
        </div>
      ))
    }
  </div>

const columnsContainer = {
  display: 'flex'
}

const columnStyle = {
  flex: 1
}

const callStyle = {
  paddingLeft: 10,
  paddingRight: 10
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

    <br />
    <p className='tc p4'>
      <Link to={
        props.topic
        ? `/inboundCalls/resolved/${props.topic.slug}#`
        : '/inboundCalls/resolved#'
      }>Erledigte Rückrufe anzeigen</Link>
    </p>
  </div>
