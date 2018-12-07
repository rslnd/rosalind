import React from 'react'
import { rowStyle } from '../../components/form'
import { NameFields, GenderField } from '../../patients/fields/NameFields'

export const PatientName = ({ patient, onChange }) => (
  <div
    style={{
      ...rowStyle,
      paddingLeft: 10,
      marginLeft: -10,
      marginTop: -16,
      marginBottom: -8
    }}>
    <GenderField onChange={() => setTimeout(onChange, 30)} />
    <div onMouseLeave={onChange}>
      <NameFields titles gender={false} />
    </div>
  </div>
)
