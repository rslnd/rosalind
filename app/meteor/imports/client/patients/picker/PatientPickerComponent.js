import React from 'react'
import Select from 'react-select'
import { withProps, mapProps, compose, renderComponent, branch, renderNothing } from 'recompose'
import { Icon } from '../../components/Icon'
import { __ } from '../../../i18n'
import { Loading } from '../../components/Loading'
import { PatientName } from '../PatientName'
import { Birthday } from '../Birthday'

const loadingStyle = {
  margin: 0,
  marginTop: 5
}

const components = {
  LoadingIndicator: withProps({ size: 16, style: loadingStyle })(Loading)
}

const noOptionsMessage = () => __('patients.noResults')
const loadingMessage = () => __('patients.searching')

export const PatientPickerComponent = ({
  selectState,
  selectHandlers,
  isOptionSelected,
  filterOption
}) =>
  <Select
    {...selectState}
    {...selectHandlers}
    formatOptionLabel={CustomOptionComponent}
    isOptionSelected={isOptionSelected}
    filterOption={filterOption}
    isClearable
    components={components}
    noOptionsMessage={noOptionsMessage}
    loadingMessage={loadingMessage}
    placeholder={__('patients.search')}
  />

const NewPatient = () =>
  <span><Icon name='user-plus' /> {__('patients.thisInsert')}</span>

const NameWithBirthday = (patient) =>
  <span>
    <PatientName patient={patient} />
    <span className='text-muted pull-right'>
      &emsp;&emsp;
      <Birthday day={patient.birthday} />
    </span>
  </span>

const CustomOptionComponent = compose(
  branch(p => p.patientId === 'newPatient', renderComponent(NewPatient)),
  branch(p => (p.lastName || p.firstName), renderComponent(NameWithBirthday))
)(renderNothing)
