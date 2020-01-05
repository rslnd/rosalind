import React from 'react'
import { Switch } from 'react-router-dom'
import { SettingsContainer } from './settings/SettingsContainer'
import { MessagesContainer } from '../messages/MessagesContainer'
import { TagsContainer } from '../tags/TagsContainer'
import { MediaTagsScreen } from '../media/MediaTagsScreen'
import { CalendarsContainer } from '../calendars/CalendarsContainer'
import { ClientsContainer } from '../clients/ClientsContainer'
import { ReferrablesContainer } from '../referrals/ReferrablesContainer'
import { Route } from '../layout/SafeRoute'
import { Error } from '../components/Error'
import { InboundCallsTopicsScreen } from '../inboundCalls/InboundCallsTopicsScreen'

const Events = () => <Error /> // Not implemented

export const System = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={`${match.url}/settings`} component={SettingsContainer} />
      <Route exact path={`${match.url}/clients`} component={ClientsContainer} />
      <Route exact path={`${match.url}/messages`} component={MessagesContainer} />
      <Route exact path={`${match.url}/tags`} component={TagsContainer} />
      <Route exact path={`${match.url}/mediaTags`} component={MediaTagsScreen} />
      <Route exact path={`${match.url}/inboundCallsTopics`} component={InboundCallsTopicsScreen} />
      <Route exact path={`${match.url}/calendars`} component={CalendarsContainer} />
      <Route exact path={`${match.url}/referrables`} component={ReferrablesContainer} />
      <Route path={`${match.url}`} component={Events} />
    </Switch>
  </div>
)
