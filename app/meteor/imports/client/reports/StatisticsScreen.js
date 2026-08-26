import React from 'react'
import { PrintSettings } from './shared/PrintSettings'
import { FlowSection } from './statistics/FlowSection'

// Standalone "Statistik" report (own menu item under Berichte). The title lives
// inside the pinned filter bar (FlowFilterBar); FlowSection owns the filter
// header, data fetching and the charts.
export const StatisticsScreen = () => (
  <div className='enable-select'>
    <PrintSettings orientation='landscape' />
    <div className='content'>
      <FlowSection />
    </div>
  </div>
)
