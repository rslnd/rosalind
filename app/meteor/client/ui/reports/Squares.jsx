import React from 'react'
import { Box } from 'client/ui/components/Box'
import CalendarHeatmap from 'react-calendar-heatmap'
import './heatmap.css'

import moment from 'moment-timezone'
const values = (nudge, selected) => {
  let v = []
  for (let i = 0; i <= 365; i++) {
    const d = moment().subtract(i, 'days')
    const off = d.day() === 0 || d.day() === 6 && Math.random() < 0.4
    const invert = selected === 'cancelations'
    if (!off) {
      const m = d.month()
      const boost = m === 2 || m === 3 || m === 10 || m === 11 || m === 4 || m === 8
      const penal = m === 7 || m === 6
      let count = Math.floor(Math.random() * (5 - 2) + 1)
      if (invert) {
        if (count === 1) { count = 4 }
        if (count === 2) { count = 3 }
        if (count === 3) { count = 2 }
        if (count === 4) { count = 1 }
      } else {
        if (boost && count < 4) { count++ }
        if (penal && count > 1) { count-- }
      }
      if (count > 1 && nudge < 0 && Math.random() < 0.3) { count += nudge }
      if (count < 4 && nudge > 0 && Math.random() < 0.3) { count += nudge }
      v.push({
        date: d.format('YYYY-MM-DD'),
        count
      })
    }
  }
  return v
}

const Year = ({ values, classForValue }) => {
  const s = { style: { flex: 1 } }
  return (
    <div className="row">
      <div className="col-md-12">
        <div style={{
          display: 'flex',
          color: '#bababa',
          width: '100%',
          textAlign: 'center'
        }}>
          <div {...s}></div>
          <div {...s}>Apr</div>
          <div {...s}>Mai</div>
          <div {...s}>Jun</div>
          <div {...s}>Jul</div>
          <div {...s}>Aug</div>
          <div {...s}>Sep</div>
          <div {...s}>Okt</div>
          <div {...s}>Nov</div>
          <div {...s}>Dez</div>
          <div {...s}>Jän</div>
          <div {...s}>Feb</div>
          <div {...s}>Mär</div>
        </div>
      </div>
      <div className="col-md-12">
        <div className="row">
          <div className="col-md-1">
            <div style={{
              width: 25,
              color: '#bababa',
              float: 'right',
              position: 'relative',
              paddingRight: 4,
              marginRight: -22
            }}>
              <div style={{ top: 10, position: 'absolute', width: '100%', textAlign: 'left' }}>Mo</div>
              <div style={{ top: 36, position: 'absolute', width: '100%', textAlign: 'left' }}>Mi</div>
              <div style={{ top: 61, position: 'absolute', width: '100%', textAlign: 'left' }}>Fr</div>
            </div>
          </div>
          <div className="col-md-11">
            <CalendarHeatmap
              endDate={new Date()}
              numDays={365}
              values={values}
              showMonthLabels={false}
              classForValue={classForValue} />
          </div>
        </div>
      </div>
    </div>
  )
}

const marginFix = '-10px 0 3px 0'

export const Squares = ({ report, handleSelect, classForValue, selected }) => (
  <div className="row">
    <div className="col-md-12" style={{ marginBottom: 13 }}>
      <div>
        <h4 className="pull-left" style={{ paddingLeft: 60, margin: marginFix }}>2015</h4>
        <h4 className="pull-left" style={{ paddingLeft: 500, margin: marginFix }}>2016</h4>
      </div>
      <Year values={values(-1, selected)}
        classForValue={classForValue} />
    </div>
    <div className="col-md-12" style={{ marginTop: 10 }}>
      <div>
        <h4 className="pull-left" style={{ paddingLeft: 60, margin: marginFix }}>2016</h4>
        <h4 className="pull-left" style={{ paddingLeft: 500, margin: marginFix }}>2017</h4>
      </div>
      <Year values={values(1, selected)}
        classForValue={classForValue} />
    </div>
  </div>
)

export class SquaresContainer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selected: 'workload'
    }

    this.selectWorkload = this.selectWorkload.bind(this)
    this.selectCancelations = this.selectCancelations.bind(this)
    this.selectNewPatients = this.selectNewPatients.bind(this)
    this.selectRevenue = this.selectRevenue.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
    this.classForValue = this.classForValue.bind(this)
  }

  classForValue (value) {
    if (!value) {
      return 'color-empty'
    }
    return `color-scale-${this.state.selected}-${value.count}`
  }

  handleSelect (value) {
    this.setState({ selected: value })
  }

  selectWorkload () { this.handleSelect('workload') }
  selectCancelations () { this.handleSelect('cancelations') }
  selectNewPatients () { this.handleSelect('newpatients') }
  selectRevenue () { this.handleSelect('revenue') }

  render () {
    return (
      <Box title="Vergleich zum Vorjahr" icon="globe" noBorder buttons={
        <div className="pull-right btn-group">
          <button onClick={this.selectWorkload} className="btn btn-default">Auslastung</button>
          <button onClick={this.selectCancelations} className="btn btn-default">Nicht erschienen</button>
          <button onClick={this.selectNewPatients} className="btn btn-default">Neue PatientInnen</button>
          <button onClick={this.selectRevenue} className="btn btn-default">Umsatz</button>
        </div>
      }>
        <Squares
          classForValue={this.classForValue}
          handleSelect={this.handleSelect}
          selected={this.state.selected} />
      </Box>
    )
  }
}
