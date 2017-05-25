import { Toggle, Choice } from 'belle'
import { Icon } from 'client/ui/components/Icon'

export const MessagesSettings = ({ settings }) => (
  <div className="container">
    <Toggle
      style={{transform: 'scale(0.6)'}}
      firstChoiceStyle={{backgroundColor: '#8fc6ae'}}
      secondChoiceStyle={{backgroundColor: '#e37067'}}
      value={settings.get('messages.sms.enabled')}
      onUpdate={({ value }) => settings.set('messages.sms.enabled', value)}>
      <Choice value><Icon name="check" /></Choice>
      <Choice value={false}><Icon name="times" /></Choice>
    </Toggle>
  </div>
)
