import React from 'react'
import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../../i18n'
import { withTracker } from '../../components/withTracker'
import { Box } from '../../components/Box'
import { Loading } from '../../components/Loading'
import { Reports } from '../../../api/reports'
import { Users } from '../../../api/users'
import { Tags } from '../../../api/tags'
import { CohortEditor, PRESETS, autoCohortLabel } from './FlowFilterBar'
import { HeatmapWeekHour } from './HeatmapWeekHour'
import { MonthlyTrend } from './MonthlyTrend'
import { OnlineVsInternal } from './OnlineVsInternal'
import { CancellationsNoShows } from './CancellationsNoShows'
import { LeadTimeDaysChart } from './LeadTimeDaysChart'
import { MonthlyLeadTime } from './MonthlyLeadTime'
import { seriesColorAt } from './flowPalette'

const avoidBreak = { pageBreakInside: 'avoid' }
const cohortHeading = { fontSize: 13, fontWeight: 700, color: '#333', margin: '0 0 8px' }
const subHeading = { fontSize: 12, color: '#555', margin: '0 0 8px', fontWeight: 700 }

let uid = 0
const nextId = () => `c${++uid}`

const makeCohort = () => {
  const r = PRESETS.find(p => p.key === 'last365').range()
  return { id: nextId(), label: '', preset: 'last365', from: r.from, to: r.to, assigneeIds: [], tags: [] }
}

class FlowSectionInner extends React.Component {
  constructor (props) {
    super(props)
    this._seq = 0
    this.state = {
      cohorts: [makeCohort()],
      compare: false,
      data: null,
      loading: true,
      error: null
    }
    this.changeCohort = this.changeCohort.bind(this)
    this.addCohort = this.addCohort.bind(this)
    this.removeCohort = this.removeCohort.bind(this)
    this.toggleCompare = this.toggleCompare.bind(this)
  }

  componentDidMount () {
    if (this.props.userId) { this.fetch() }
  }

  componentDidUpdate (previousProps) {
    if (!previousProps.userId && this.props.userId) { this.fetch() }
  }

  changeCohort (id, patch) {
    this.setState(s => ({
      cohorts: s.cohorts.map(c => c.id === id ? { ...c, ...patch } : c)
    }), () => this.fetch())
  }

  addCohort () {
    this.setState(s => ({ cohorts: s.cohorts.concat(makeCohort()) }), () => this.fetch())
  }

  removeCohort (id) {
    this.setState(s => s.cohorts.length <= 1 ? null : ({
      cohorts: s.cohorts.filter(c => c.id !== id)
    }), () => this.fetch())
  }

  toggleCompare (compare) {
    this.setState({ compare }, () => this.fetch())
  }

  fetch () {
    const { doctors, tagOptions } = this.props
    const { cohorts, compare } = this.state
    const series = cohorts.map(c => {
      const s = {
        id: c.id,
        label: c.label && c.label.trim() ? c.label.trim() : autoCohortLabel(c, doctors, tagOptions),
        from: moment(c.from).startOf('day').toDate(),
        to: moment(c.to).endOf('day').toDate()
      }
      if (c.assigneeIds.length) { s.assigneeIds = c.assigneeIds }
      if (c.tags.length) { s.tags = c.tags }
      return s
    })

    const seq = ++this._seq
    this.setState({ loading: true, error: null })
    Reports.actions.patientFlow.callPromise({ series, compare })
      .then(data => { if (seq === this._seq) { this.setState({ data, loading: false }) } })
      .catch(err => { if (seq === this._seq) { this.setState({ error: err.reason || err.message, loading: false }) } })
  }

  render () {
    const { doctors, tagOptions } = this.props
    const { data, loading, error, cohorts, compare } = this.state

    // Join server results (current/previous per cohort) with a stable color by
    // position; the server echoes the resolved label we sent.
    const viewCohorts = data
      ? data.series.map((s, i) => ({ id: s.id, label: s.label, color: seriesColorAt(i), current: s.current, previous: s.previous }))
      : []
    const dataCompare = data ? data.compare : false
    const showHeading = viewCohorts.length > 1

    return (
      <div>
        <CohortEditor
          cohorts={cohorts} compare={compare}
          doctors={doctors} tagOptions={tagOptions}
          onChangeCohort={this.changeCohort}
          onAddCohort={this.addCohort}
          onRemoveCohort={this.removeCohort}
          onToggleCompare={this.toggleCompare} />

        {loading && !data && <Loading />}
        {error && <Box type='warning' title={__('ui.notice')}><p>{error}</p></Box>}

        {viewCohorts.length > 0 && (
          <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 150ms' }}>
            <Box title={__('reports.heatmapTitle')} icon='table' style={avoidBreak}>
              {viewCohorts.map(c => (
                <div key={c.id} style={{ marginBottom: 22 }}>
                  {showHeading &&
                    <div style={cohortHeading}>
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: c.color, marginRight: 6 }} />
                      {c.label}
                    </div>}
                  {dataCompare && c.previous
                    ? <div>
                      <div style={subHeading}>{__('reports.cohortVorjahrSuffix', { label: c.label })}</div>
                      <HeatmapWeekHour heatmap={c.previous.heatmap} pale />
                      <div style={{ ...subHeading, marginTop: 18 }}>{c.label}</div>
                      <HeatmapWeekHour heatmap={c.current.heatmap} />
                    </div>
                    : <HeatmapWeekHour heatmap={c.current.heatmap} />}
                </div>
              ))}
            </Box>

            <Box title={__('reports.monthlyTitle')} icon='bar-chart' style={avoidBreak}>
              <MonthlyTrend cohorts={viewCohorts} compare={dataCompare} />
            </Box>

            <Box title={__('reports.onlineTitle')} icon='globe' style={avoidBreak}>
              <OnlineVsInternal cohorts={viewCohorts} compare={dataCompare} />
            </Box>

            <Box title={__('reports.leadTimeTitle')} icon='clock-o' style={avoidBreak}>
              <p className='text-muted' style={{ marginTop: 0 }}>{__('reports.leadTimeHint')}</p>
              <LeadTimeDaysChart cohorts={viewCohorts} compare={dataCompare} />
              <MonthlyLeadTime cohorts={viewCohorts} compare={dataCompare} />
            </Box>

            <Box title={__('reports.cancelNoShowTitle')} icon='ban' style={avoidBreak}>
              <CancellationsNoShows cohorts={viewCohorts} compare={dataCompare} />
            </Box>
          </div>
        )}
      </div>
    )
  }
}

const composer = (props) => {
  const doctors = Users.find({ hiddenInReports: { $ne: true } }).fetch()
    .map(u => ({ _id: u._id, name: Users.methods.fullNameWithTitle(u) }))
    .filter(d => d.name)
    .sort((a, b) => a.name.localeCompare(b.name, 'de'))

  const tagOptions = Tags.find({ removed: { $ne: true } }, { sort: { order: 1 } }).fetch()
    .map(t => ({ _id: t._id, shortTag: t.shortTag, tag: t.tag, color: t.color }))

  return { ...props, userId: Meteor.userId(), doctors, tagOptions }
}

export const FlowSection = withTracker(composer)(FlowSectionInner)
