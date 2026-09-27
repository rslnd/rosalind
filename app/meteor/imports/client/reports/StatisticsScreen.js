import React from 'react'
import { PrintSettings } from './shared/PrintSettings'
import { FlowSection } from './statistics/FlowSection'

// Standalone "Statistik" report (own menu item under Berichte). FlowSection owns
// the cohort editor (CohortEditor), data fetching and the comparison charts.
export const StatisticsScreen = () => (
  <div className='enable-select'>
    <PrintSettings orientation='landscape' />
    <div className='content'>
      <FlowSection />
    </div>
  </div>
)
