import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { SettingsContainer } from 'client/ui/system/settings/SettingsContainer'
import { MessagesContainer } from 'client/ui/messages/MessagesContainer'

export const SystemRoutes = () => (
  <Route path="system">
    <IndexRoute component={() => <Blaze template="systemEvents" />} />
    <Route path="events" component={() => <Blaze template="systemEvents" />} />
    <Route path="messages" component={MessagesContainer} />
    <Route path="settings" component={SettingsContainer} />
    <Route path="importers" component={() => <Blaze template="systemImporters" />} />
    <Route path="tags" component={() => <Blaze template="systemTags" />} />
    <Route path="native" component={() => <Blaze template="native" />} />
  </Route>
)
