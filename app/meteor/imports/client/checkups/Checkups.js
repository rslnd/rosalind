import moment from 'moment-timezone'
import React, { useState } from 'react'
import Alert from 'react-s-alert'
import { datetime, RRule } from 'rrule'
import { CheckupsRules } from '../../api/checkups'
import { __ } from '../../i18n'
import { Box } from '../components/Box'
import Button from '@material-ui/core/Button'
import { TextField } from '../components/form'
import { Icon } from '../components/Icon'
import { prompt } from '../layout/Prompt'
import { withTracker } from '../components/withTracker'

export const Checkups = () => {
  const [newRule, setNew] = useState(false)

  return <div className='content-header show-print'>
      <h1 className='show-print'>Kontrollen</h1>

      <div className='content'>
        <Box title={__('checkups.rules')}>
          {
            newRule
            ? <NewRule onDone={() => setNew(false)} />
            : <Rules onNew={() => setNew(true)}/>
          }
        </Box>
      </div>
    </div>
}

const NewRule = ({ onDone }) => {


  const placeholder = "every 3 months on last monday"
  
  const initialOptions = RRule.parseText(placeholder)
  initialOptions.dtstart = moment().utc().startOf('day').toDate()
  const initial = new RRule(initialOptions)

  const [name, setName] = useState("")
  const [text, setText] = useState(placeholder)
  const [rrule, setRRule] = useState(initial.toString())
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const updateText = (s) => {
    setText(s)
    let rule = null
    try {
      const options = RRule.parseText(s)
      options.dtstart = moment().utc().startOf('day').toDate()
      rule = new RRule(options)

      setRRule(rule.toString())
      setError(null)
    } catch (e) {
      setError(e)
    }
  }

  const updateRRule = (s) => {
    setRRule(s)
    let rule = null
    try {
      rule = RRule.fromString(s)
      setText(rule.toText())
      setError(null)
    } catch (e) {
      console.log(e)
      setError(e)
    }
  }

  const handleSave = () => {
    setSubmitting(true)
    Meteor.call('checkupsRules/insert', {
      checkupsRule: {
        name,
        text,
        rrule,
        createdAt: new Date(),
        createdBy: Meteor.userId()
      }
    }, (err) => {
      setSubmitting(false)
      if (err) {
        console.error(err)
        return Alert.error(__('ui.error'))
      }

      onDone()
      Alert.success(__('ui.saved'))
    })
  }

  const next = error
    ? []
    : RRule.fromString(rrule).between(new Date(), new Date(new Date().getFullYear() + 25, 1, 1), true, (d, i) => (i < 10))

  return <div className="flex">
    <div className="w-50">
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <TextField
        label="Zeitplan (Englisch)"
        placeholder={placeholder}
        value={text}
        onChange={(e) => updateText(e.target.value)}
      />

      <TextField
        className='text-muted'
        multiline
        rows={3}
        label="Zeitplan (maschinenlesbar)"
        value={rrule}
        onChange={(e) => updateRRule(e.target.value)}
      />

      {error && error.toString()}
      <br/><br/>
      <Button
        className='d-inline-block mt4'
        type='submit'
        variant='contained'
        color='primary'
        onClick={handleSave}
        disabled={!name || !rrule || error || submitting}
      >{__('ui.save')}</Button>

      <Button
        style={{ display: 'inline-block', marginLeft: 10, opacity: 0.5 }}
        onClick={() => onDone()}>{__('ui.cancel')}</Button>
    </div>
    <div className='pl5 enable-select'>
      {next.map(d =>
        <div>{moment(d).format(__('time.dateFormatWeekdayShort'))}</div>
      )}
      <div>...</div>
    </div>
  </div>
}



const Rules = withTracker(() => {
  const rules = CheckupsRules.find({}).fetch() 
  return { rules }
})(({ rules, onNew }) => {
  const [open, setOpen] = useState(null)

  const handleDelete = async (ru) => {
    if (await prompt({
      title: 'Regel löschen?',
      body: ru.name
    })) {
      Meteor.call('checkupsRules/softRemove', { checkupsRuleId: ru._id })
      Alert.success(__('ui.deleted'))
    }
  }

  return <div>
    <Button   
      type='submit'
      variant='contained'
      color='primary'
      onClick={onNew}>
        Neue Regel
    </Button>
    {
      rules.map(ru => {
        return <div
          key={ru._id}
          className="p4 mt3 mb3">
          <div>
            <span onClick={() => (open === ru._id) ? setOpen(null) : setOpen(ru._id)}>
              <b className="pointer enable-select">{ru.name}</b>&nbsp;
              <span class="text-muted pointer enable-select">({ru.text})</span>
            </span>
            <Button
              className="pull-right"
              onClick={() => handleDelete(ru)}>
              <Icon name="trash" />
            </Button>
          </div>

          <ul className="enable-select">
            {
              open === ru._id &&
                RRule
                  .fromString(ru.rrule)
                  .between(new Date(), new Date(new Date().getFullYear() + 25, 1, 1), true, (d, i) => (i < 10))
                  .map(d =>
                  <li>{moment(d).format(__('time.dateFormatWeekdayShort'))}</li>
                )
            }
          </ul>

        </div>
      })
    }
  </div>
})
