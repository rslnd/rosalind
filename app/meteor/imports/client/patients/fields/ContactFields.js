import React from 'react'
import { Field } from 'redux-form'
import Button from '@material-ui/core/Button'
import { __ } from '../../../i18n'
import { Icon } from '../../components/Icon'
import { TextField } from '../../components/form'
import { rowStyle, iconStyle, buttonStyle, grow, shrink } from '../../components/form/rowStyle'
import { EnlargeText } from '../../components/EnlargeText'

const filterField = channel => field => field && field.channel === channel

const requirePhone = v => {
  if (!v) {
    return __('patients.telephoneRequired')
  }
}

const warn = v => {
  if (!v) {
    return __('ui.pleaseFill')
  }
}

const buttonsStyle = {
  ...buttonStyle,
  flexShrink: 1,
  paddingLeft: 6
}

const zoomIconStyle = {
  display: 'block',
  padding: 23
}

export const ContactFields = ({ fields, icon, channel, zoomable }) => {
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
                validate={channel === 'Phone' ? requirePhone : null}
                label={__(`patients.${channel.toLowerCase()}`)} />
            </div>

            {
              zoomable && fields.get(i).value &&
                <div style={shrink}>
                  <EnlargeText iconOnly style={zoomIconStyle}>
                    {fields.get(i).value}
                  </EnlargeText>
                </div>
            }

            <div style={buttonsStyle}>
              {
                count > 1 &&
                  <Button
                    onClick={() => fields.remove(i)}
                    style={{ minWidth: 35, color: '#ccc' }}
                    title={__('patients.removeContact')}>
                    <Icon name='minus' />
                  </Button>
              }
              {
                count < 5 &&
                  <Button
                    onClick={() => fields.insert(i + 1, { channel })}
                    style={{ minWidth: 35 }}
                    title={__('patients.addContact')}>
                    <Icon name='plus' />
                  </Button>
              }
            </div>
          </div>
        ))
      }
  </div>
}
