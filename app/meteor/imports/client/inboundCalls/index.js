import React from 'react'
import { Routes } from 'react-router-dom'
import { InboundCallsContainer } from './InboundCallsContainer'
import { NewInboundCallContainer } from './NewInboundCallContainer'
import { ResolvedScreen } from './ResolvedScreen'
import { route } from '../layout/SafeRoute'

export const InboundCalls = () => (
  <div>
    <Routes>
      {route('resolved/:slug', ResolvedScreen)}
      {route('resolved', ResolvedScreen)}
      {route('new', NewInboundCallContainer)}
      {route('topic/:slug/*', InboundCallsContainer)}
      {route('', InboundCallsContainer)}
    </Routes>
  </div>
)
