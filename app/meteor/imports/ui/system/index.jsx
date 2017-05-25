import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { SettingsContainer } from 'client/ui/system/settings/SettingsContainer'
import { MessagesContainer } from 'client/ui/messages/MessagesContainer'

const Events = () => <Blaze template="systemEvents" />
const Importers = () => <Blaze template="systemImporters" />
const Tags = () => <Blaze template="systemTags" />
const NativeSettings = () => <Blaze template="native" />

export const System = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={`${match.url}/settings`} component={SettingsContainer} />
      <Route exact path={`${match.url}/messages`} component={MessagesContainer} />
      <Route exact path={`${match.url}/importers`} component={Importers} />
      <Route exact path={`${match.url}/tags`} component={Tags} />
      <Route exact path={`${match.url}/native`} component={NativeSettings} />
      <Route path={`${match.url}`} component={Events} />
    </Switch>
  </div>
)
