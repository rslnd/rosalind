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
import { FlowFilterBar, PRESETS } from './FlowFilterBar'
import { HeatmapWeekHour } from './HeatmapWeekHour'
import { MonthlyTrend } from './MonthlyTrend'
import { OnlineVsInternal } from './OnlineVsInternal'
import { CancellationsNoShows } from './CancellationsNoShows'
import { LeadTimeDaysChart } from './LeadTimeDaysChart'
import { MonthlyLeadTime } from './MonthlyLeadTime'
import { periodLabel } from './periodLabel'

const avoidBreak = { pageBreakInside: 'avoid' }
const subHeading = { fontSize: 12, color: '#555', marginBottom: 8, fontWeight: 700 }

class FlowSectionInner extends React.Component {
  constructor (props) {
    super(props)
    this._seq = 0
    const r = PRESETS.find(p => p.key === 'last365').range()
    this.state = {
      preset: 'last365',
      from: r.from,
      to: r.to,
      assigneeIds: [],
      tags: [],
      compare: false,
      data: null,
      loading: true,
      error: null
    }
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount () {
    if (this.props.userId) { this.fetch() }
  }

  componentDidUpdate (previousProps) {
    if (!previousProps.userId && this.props.userId) { this.fetch() }
  }

  handleChange (patch) {
    this.setState(patch, () => this.fetch())
  }

  fetch () {
    const { from, to, assigneeIds, tags, compare } = this.state
    const args = {
      from: moment(from).startOf('day').toDate(),
      to: moment(to).endOf('day').toDate()
    }
    if (assigneeIds.length) { args.assigneeIds = assigneeIds }
    if (tags.length) { args.tags = tags }
    if (compare) {
      args.compareFrom = moment(from).subtract(1, 'year').startOf('day').toDate()
      args.compareTo = moment(to).subtract(1, 'year').endOf('day').toDate()
    }

    const seq = ++this._seq
    this.setState({ loading: true, error: null })
    Reports.actions.patientFlow.callPromise(args)
      .then(data => { if (seq === this._seq) { this.setState({ data, loading: false }) } })
      .catch(err => { if (seq === this._seq) { this.setState({ error: err.reason || err.message, loading: false }) } })
  }

  render () {
    const { doctors, tagOptions } = this.props
    const { data, loading, error, from, to, preset, assigneeIds, tags, compare } = this.state

    const current = data && data.current
    const previous = data && data.previous
    const periods = data ? {
      current: periodLabel(data.from, data.to),
      previous: data.compare ? periodLabel(data.compareFrom, data.compareTo) : null
    } : {}

    return (
      <div>
        <FlowFilterBar
          from={from} to={to} preset={preset}
          assigneeIds={assigneeIds} tags={tags} compare={compare}
          doctors={doctors} tagOptions={tagOptions}
          onChange={this.handleChange} />

        {loading && !data && <Loading />}
        {error && <Box type='warning' title={__('ui.notice')}><p>{error}</p></Box>}

        {current && (
          <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 150ms' }}>
            <Box title={__('reports.heatmapTitle')} icon='table' style={avoidBreak}>
              {previous
                ? <div>
                  <div style={subHeading}>{periods.previous && `${__('reports.comparePeriod')} ${periods.previous.compact}`}</div>
                  <HeatmapWeekHour heatmap={previous.heatmap} pale />
                  <div style={{ ...subHeading, marginTop: 18 }}>{periods.current && periods.current.compact}</div>
                  <HeatmapWeekHour heatmap={current.heatmap} />
                </div>
                : <HeatmapWeekHour heatmap={current.heatmap} />}
            </Box>

            <Box title={__('reports.monthlyTitle')} icon='bar-chart' style={avoidBreak}>
              <MonthlyTrend
                months={current.months}
                previousMonths={previous && previous.months}
                periods={periods} />
            </Box>

            <Box title={__('reports.onlineTitle')} icon='globe' style={avoidBreak}>
              <OnlineVsInternal
                current={current} previous={previous}
                months={current.months}
                periods={periods} />
            </Box>

            <Box title={__('reports.leadTimeTitle')} icon='clock-o' style={avoidBreak}>
              <p className='text-muted' style={{ marginTop: 0 }}>{__('reports.leadTimeHint')}</p>
              <LeadTimeDaysChart
                current={current.leadDays}
                previous={previous && previous.leadDays}
                periods={periods} />
              <MonthlyLeadTime
                months={current.months}
                previousMonths={previous && previous.months}
                periods={periods} />
            </Box>

            <Box title={__('reports.cancelNoShowTitle')} icon='ban' style={avoidBreak}>
              <CancellationsNoShows current={current} previous={previous} months={current.months} periods={periods} />
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
