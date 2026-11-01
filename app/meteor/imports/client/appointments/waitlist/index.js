import React from 'react'
import { Routes } from 'react-router-dom'
import { WaitlistContainer } from './WaitlistContainer'
import { route } from '../../layout/SafeRoute'

export const Waitlist = () => (
  <Routes>
    {route(':username', WaitlistContainer)}
    {route('*', WaitlistContainer)}
  </Routes>
)
