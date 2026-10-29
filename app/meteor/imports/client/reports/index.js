import React from 'react'
import { Routes } from 'react-router-dom'
import { ReportsContainer } from './ReportsContainer'
import { ReferralsReportContainer } from './ReferralsReportContainer'
import { StatisticsScreen } from './StatisticsScreen'
import { route } from '../layout/SafeRoute'

export const Reports = () => (
  <div>
    <Routes>
      {route('day/:date', ReportsContainer)}
      {route('day', ReportsContainer)}
      {route('statistics', StatisticsScreen)}
      {route('referrals', ReferralsReportContainer)}
      {route('referrals/:username', ReferralsReportContainer)}
      {route('*', ReportsContainer)}
    </Routes>
  </div>
)
