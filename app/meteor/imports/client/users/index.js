
import React from 'react'
import { Routes } from 'react-router-dom'
import { UsersContainer } from './UsersContainer'
import { route } from '../layout/SafeRoute'
import { EditUserContainer } from './EditUserContainer'
import { NewUser } from './NewUser'
import { withProps } from 'recompose'

const RemovedUsersContainer = withProps({ removed: true })(UsersContainer)

export const Users = () => (
  <div>
    <Routes>
      {route('new', NewUser)}
      {route('removed', RemovedUsersContainer)}
      {route(':id/edit', EditUserContainer)}
      {route('*', UsersContainer)}
    </Routes>
  </div>
)
