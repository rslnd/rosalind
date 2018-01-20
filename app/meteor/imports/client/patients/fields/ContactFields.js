import React from 'react'
import { Field } from 'redux-form'
import Button from 'material-ui/Button'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'
import { TextField } from '../../components/form'
import { rowStyle, iconStyle, buttonStyle, grow } from '../../components/form/rowStyle'

const filterField = channel => field => field && field.channel === channel

const warn = v => {
  if (!v) {
    return 'Bitte eintragen'
  }
}

const buttonsStyle = {
  ...buttonStyle,
  flexShrink: 1,
  paddingLeft: 6
}

export const ContactFields = ({ fields, icon, channel }) => {
  const count = (fields.getAll() || [])
    .filter(filterField(channel))
    .length

  return <div>
    {
      fields.map((member, i) => (
        // can't call .filter on `fields` as it's not a real array
        filterField(channel)(fields.get(i)) &&
          <div key={i} style={rowStyle}>
            <div style={iconStyle}>
              <Icon name={icon} />
            </div>
            <div style={grow}>
              <Field
                name={`${member}.value`}
                component={TextField}
                warn={warn}
                label={TAPi18n.__(`patients.${channel.toLowerCase()}`)} />
            </div>

            <div style={buttonsStyle}>
              {
                count > 1 &&
                  <Button
                    onClick={() => fields.remove(i)}
                    style={{ minWidth: 35, color: '#ccc' }}>
                    <Icon name='remove' />
                  </Button>
              }
              {
                count < 5 &&
                  <Button
                    onClick={() => fields.insert(i + 1, { channel })}
                    style={{ minWidth: 35 }}>
                    <Icon name='plus' />
                  </Button>
              }
            </div>
          </div>
        ))
      }
  </div>
}
