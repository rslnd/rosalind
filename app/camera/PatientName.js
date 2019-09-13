import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { __ } from './i18n'

const prefix = ({ gender }) =>
  gender === 'Female' ? __('prefixFemale') : __('prefixMale')

export const PatientName = ({ patient = {} }) => (
  <Text>
    <Text style={styles.muted}>
      {prefix(patient)}
      &nbsp;
      {patient.titlePrepend && <Text>{patient.titlePrepend}&nbsp;</Text>}
    </Text>
    <Text style={styles.bold}>{patient.lastName}&nbsp;</Text>
    {patient.firstName}&nbsp;
    {patient.titleAppend}
  </Text>
)

const styles = StyleSheet.create({
  muted: {
    color: '#555'
  },
  bold: {
    fontWeight: '700'
  }
})
