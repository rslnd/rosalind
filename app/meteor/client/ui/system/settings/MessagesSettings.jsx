import { Toggle, Choice } from 'belle'
import { Icon } from 'client/ui/components/Icon'

export const MessagesSettings = ({ get, set }) => (
  <div className="container">
    Terminerinnerungs-SMS
    <Toggle
      style={{transform: 'scale(0.6)'}}
      firstChoiceStyle={{backgroundColor: '#8fc6ae'}}
      secondChoiceStyle={{backgroundColor: '#e37067'}}
      value={get('messages.sms.enabled')}
      onUpdate={({ value }) => set('messages.sms.enabled', value)}>
      <Choice value><Icon name="check" /></Choice>
      <Choice value={false}><Icon name="times" /></Choice>
    </Toggle>
  </div>
)
