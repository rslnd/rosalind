import React from 'react'
import { Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import FlatButton from 'material-ui/FlatButton'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'
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
                fullWidth
                warn={warn}
                floatingLabelText={TAPi18n.__(`patients.${channel.toLowerCase()}`)} />
            </div>

            <div style={buttonsStyle}>
              {
                count > 1 &&
                  <FlatButton
                    onClick={() => fields.remove(i)}
                    style={{ minWidth: 35, color: '#ccc' }}>
                    <Icon name='remove' />
                  </FlatButton>
              }
              {
                count < 5 &&
                  <FlatButton
                    onClick={() => fields.insert(i + 1, { channel })}
                    style={{ minWidth: 35 }}>
                    <Icon name='plus' />
                  </FlatButton>
              }
            </div>
          </div>
        ))
      }
  </div>
}
