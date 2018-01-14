import React from 'react'
import { Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import FlatButton from 'material-ui/FlatButton'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'

const filterField = channel => field => field && field.channel === channel

export const ContactFields = ({ fields, icon, channel }) => {
  const count = (fields.getAll() || [])
    .filter(filterField(channel))
    .length

  return <div>
    {
      fields.map((member, i) => (
        // can't call .filter on `fields` as it's not a real array
        filterField(channel)(fields.get(i)) &&
          <div key={i} className='row'>
            <div className='col-md-12'>
              <div className='row no-pad' style={{ marginTop: -15, zIndex: 14 }}>
                <div className='col-md-1'>
                  <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                    <Icon name={icon} />
                  </div>
                </div>
                <div className='col-md-10'>
                  <div className='row'>
                    <div className='col-md-10'>
                      <Field
                        name={`${member}.value`}
                        component={TextField}
                        fullWidth
                        floatingLabelText={TAPi18n.__(`patients.${channel.toLowerCase()}`)} />
                    </div>
                    <div className='col-md-2' style={{ paddingTop: 32 }}>
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
                </div>
              </div>
            </div>
          </div>
        ))
      }
  </div>
}
