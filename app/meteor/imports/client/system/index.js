import React from 'react'
import { Routes } from 'react-router-dom'
import { SettingsContainer } from './settings/SettingsContainer'
import { MessagesContainer } from '../messages/MessagesContainer'
import { TagsContainer } from '../tags/TagsContainer'
import { MediaTagsScreen } from '../media/MediaTagsScreen'
import { TemplatesScreen } from '../templates/TemplatesScreen'
import { TemplateEditScreen } from '../templates/TemplateEditScreen'
import { CalendarsContainer } from '../calendars/CalendarsContainer'
import { ClientsContainer } from '../clients/ClientsContainer'
import { ReferrablesContainer } from '../referrals/ReferrablesContainer'
import { route } from '../layout/SafeRoute'
import { Error } from '../components/Error'
import { InboundCallsTopicsScreen } from '../inboundCalls/InboundCallsTopicsScreen'
import { ConsentsScreen } from '../consents/ConsentsScreen'

const Events = () => <Error /> // Not implemented

export const System = () => (
  <div>
    <Routes>
      {route('settings', SettingsContainer)}
      {route('clients', ClientsContainer)}
      {route('messages', MessagesContainer)}
      {route('tags', TagsContainer)}
      {route('mediaTags', MediaTagsScreen)}
      {route('inboundCallsTopics', InboundCallsTopicsScreen)}
      {route('calendars', CalendarsContainer)}
      {route('referrables', ReferrablesContainer)}
      {route('templates', TemplatesScreen)}
      {route('templates/:id/edit', TemplateEditScreen)}
      {route('consents', ConsentsScreen)}
      {route('*', () => null)}
    </Routes>
  </div>
)
