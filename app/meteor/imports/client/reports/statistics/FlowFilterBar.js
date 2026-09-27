import React from 'react'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'
import { Icon } from '../../components/Icon'
import { periodLabel } from './periodLabel'
import { seriesColorAt } from './flowPalette'

// Period presets → { from, to } in local time. `key` identifies the active one.
export const PRESETS = [
  { key: 'last30', label: 'Letzte 30 Tage', range: () => ({ from: moment().subtract(30, 'days'), to: moment() }) },
  { key: 'last90', label: 'Letzte 90 Tage', range: () => ({ from: moment().subtract(90, 'days'), to: moment() }) },
  { key: 'last180', label: 'Letzte 6 Monate', range: () => ({ from: moment().subtract(6, 'months'), to: moment() }) },
  { key: 'last365', label: 'Letzte 12 Monate', range: () => ({ from: moment().subtract(12, 'months'), to: moment() }) },
  { key: 'thisYear', label: 'Heuer', range: () => ({ from: moment().startOf('year'), to: moment() }) },
  { key: 'lastYear', label: 'Vorjahr', range: () => ({ from: moment().subtract(1, 'year').startOf('year'), to: moment().subtract(1, 'year').endOf('year') }) }
]

const tagName = (t) => t ? (t.shortTag ? `${t.shortTag} - ${t.tag}` : t.tag) : '1'

// Human-readable fallback name for a cohort (used as the label placeholder and
// as the effective label sent to the server when the user left it blank):
// "Dr. Huber · Erstordination · Q1 2026".
export const autoCohortLabel = (cohort, doctors = [], tagOptions = []) => {
  const parts = []
  if (!cohort.assigneeIds.length) {
    parts.push(__('reports.filterAllDoctors'))
  } else if (cohort.assigneeIds.length === 1) {
    parts.push((doctors.find(d => d._id === cohort.assigneeIds[0]) || {}).name || '?')
  } else {
    parts.push(__('reports.filterSelected', { count: cohort.assigneeIds.length }))
  }
  if (cohort.tags.length === 1) {
    parts.push(tagName(tagOptions.find(t => t._id === cohort.tags[0])))
  } else if (cohort.tags.length > 1) {
    parts.push(__('reports.filterSelected', { count: cohort.tags.length }))
  }
  parts.push(periodLabel(moment(cohort.from).toDate(), moment(cohort.to).toDate()).compact)
  return parts.filter(Boolean).join(' · ')
}

const menuStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: 4,
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: 4,
  boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
  minWidth: 240,
  maxHeight: 340,
  overflowY: 'auto',
  zIndex: 1000,
  padding: '4px 0'
}

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 400,
  whiteSpace: 'nowrap',
  margin: 0
}

const labelStyle = { color: '#888', marginRight: 5, fontSize: 12 }

// Small self-contained dropdown with click-outside handling. `children` may be a
// function receiving a `close` callback.
class Dropdown extends React.Component {
  constructor (props) {
    super(props)
    this.state = { open: false }
    this.onDoc = this.onDoc.bind(this)
    this.toggle = this.toggle.bind(this)
    this.close = this.close.bind(this)
  }

  componentDidMount () { document.addEventListener('mousedown', this.onDoc) }
  componentWillUnmount () { document.removeEventListener('mousedown', this.onDoc) }
  onDoc (e) { if (this.ref && !this.ref.contains(e.target)) { this.close() } }
  toggle () { this.setState(s => ({ open: !s.open })) }
  close () { this.setState({ open: false }) }

  render () {
    const { label, value } = this.props
    return (
      <div ref={r => { this.ref = r }} style={{ position: 'relative', display: 'inline-block' }}>
        <button type='button' className='btn btn-default btn-sm' onClick={this.toggle}>
          <span style={labelStyle}>{label}</span>{value} <span className='caret' />
        </button>
        {this.state.open &&
          <div style={menuStyle}>
            {typeof this.props.children === 'function' ? this.props.children(this.close) : this.props.children}
          </div>}
      </div>
    )
  }
}

const CheckItem = ({ checked, onChange, children }) => (
  <label style={itemStyle} className='flow-dd-item'>
    <input type='checkbox' checked={checked} onChange={onChange} style={{ margin: 0, flex: '0 0 auto' }} />
    <span style={{ marginLeft: 8 }}>{children}</span>
  </label>
)

const toggle = (list, id) => list.includes(id) ? list.filter(x => x !== id) : list.concat(id)

const periodValue = (preset, from, to) => {
  const p = PRESETS.find(x => x.key === preset)
  if (p) { return p.label }
  return `${moment(from).format('D.M.YY')}–${moment(to).format('D.M.YY')}`
}

// Period / doctor / type dropdown trio for one cohort.
const PeriodDropdown = ({ cohort, onChange }) => {
  const fromStr = moment(cohort.from).format('YYYY-MM-DD')
  const toStr = moment(cohort.to).format('YYYY-MM-DD')
  return (
    <Dropdown label={__('reports.filterPeriod') + ':'} value={periodValue(cohort.preset, cohort.from, cohort.to)}>
      {(close) => (
        <div>
          {PRESETS.map(p => (
            <div key={p.key} style={{ ...itemStyle, fontWeight: cohort.preset === p.key ? 700 : 400, background: cohort.preset === p.key ? '#eef4fb' : 'transparent' }}
              className='flow-dd-item'
              onClick={() => { const r = p.range(); onChange({ preset: p.key, from: r.from, to: r.to }); close() }}>
              {p.label}
            </div>
          ))}
          <div style={{ borderTop: '1px solid #eee', margin: '4px 0', padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{__('reports.filterCustomRange')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type='date' value={fromStr} max={toStr}
                onChange={e => e.target.value && onChange({ preset: 'custom', from: moment(e.target.value).startOf('day') })}
                style={{ fontSize: 12, padding: '2px 4px' }} />
              <span style={{ color: '#888' }}>–</span>
              <input type='date' value={toStr} min={fromStr}
                onChange={e => e.target.value && onChange({ preset: 'custom', to: moment(e.target.value).endOf('day') })}
                style={{ fontSize: 12, padding: '2px 4px' }} />
            </div>
          </div>
        </div>
      )}
    </Dropdown>
  )
}

const DoctorDropdown = ({ cohort, doctors, onChange }) => {
  const value = cohort.assigneeIds.length === 0
    ? __('reports.filterAllDoctors')
    : cohort.assigneeIds.length === 1
      ? (doctors.find(d => d._id === cohort.assigneeIds[0]) || {}).name || '1'
      : __('reports.filterSelected', { count: cohort.assigneeIds.length })
  return (
    <Dropdown label={__('reports.filterDoctor') + ':'} value={value}>
      <div>
        <div style={{ ...itemStyle, color: '#888' }} className='flow-dd-item'
          onClick={() => onChange({ assigneeIds: [] })}>
          {__('reports.filterAllDoctors')}
        </div>
        <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />
        {doctors.map(d => (
          <CheckItem key={d._id} checked={cohort.assigneeIds.includes(d._id)}
            onChange={() => onChange({ assigneeIds: toggle(cohort.assigneeIds, d._id) })}>
            {d.name}
          </CheckItem>
        ))}
      </div>
    </Dropdown>
  )
}

const TypeDropdown = ({ cohort, tagOptions, onChange }) => {
  const value = cohort.tags.length === 0
    ? __('reports.filterAllTypes')
    : cohort.tags.length === 1
      ? tagName(tagOptions.find(t => t._id === cohort.tags[0]))
      : __('reports.filterSelected', { count: cohort.tags.length })
  return (
    <Dropdown label={__('reports.filterType') + ':'} value={value}>
      <div>
        <div style={{ ...itemStyle, color: '#888' }} className='flow-dd-item'
          onClick={() => onChange({ tags: [] })}>
          {__('reports.filterAllTypes')}
        </div>
        <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />
        {tagOptions.map(t => (
          <CheckItem key={t._id} checked={cohort.tags.includes(t._id)}
            onChange={() => onChange({ tags: toggle(cohort.tags, t._id) })}>
            {t.color &&
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: t.color, marginRight: 6, verticalAlign: 'middle' }} />}
            {t.shortTag
              ? <span><strong>{t.shortTag}</strong> - {t.tag}</span>
              : <span>{t.tag}</span>}
          </CheckItem>
        ))}
      </div>
    </Dropdown>
  )
}

const cardStyle = {
  background: '#2f3b47',
  borderRadius: 6,
  padding: '12px 16px',
  marginBottom: 18,
  boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
}

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  padding: '8px 0',
  borderTop: '1px solid #3c4a58'
}

// Cohort comparison editor: one row per comparison group (color swatch, free
// label, period/doctor/type dropdowns, remove), plus an "add group" button and
// the year-over-year toggle. Not sticky — it can grow with many cohorts.
export const CohortEditor = ({ cohorts, compare, doctors, tagOptions, onChangeCohort, onAddCohort, onRemoveCohort, onToggleCompare, onPrint }) => (
  <div className='hide-print' style={cardStyle}>
    <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{__('reports.statistics')}</span>
      <span style={{ fontSize: 12, color: '#b9c4d0', flex: 1, minWidth: 200 }}>{__('reports.cohortsHint')}</span>
      <label style={{ fontSize: 13, cursor: 'pointer', marginBottom: 0, color: '#e6ecf2', whiteSpace: 'nowrap' }}>
        <input type='checkbox' checked={compare} onChange={e => onToggleCompare(e.target.checked)} style={{ marginRight: 6 }} />
        {__('reports.compareYearOverYear')}
      </label>
      <button type='button' className='btn btn-sm btn-default' onClick={onPrint} title={__('ui.print')}>
        <Icon name='print' /> {__('ui.print')}
      </button>
    </div>

    {cohorts.map((cohort, i) => (
      <div key={cohort.id} style={rowStyle}>
        <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: seriesColorAt(i), flex: '0 0 auto' }} />
        <input
          type='text'
          value={cohort.label}
          placeholder={autoCohortLabel(cohort, doctors, tagOptions)}
          onChange={e => onChangeCohort(cohort.id, { label: e.target.value })}
          style={{ fontSize: 13, padding: '3px 8px', borderRadius: 3, border: '1px solid #3c4a58', width: 190, background: '#25303a', color: '#fff' }} />
        <PeriodDropdown cohort={cohort} onChange={patch => onChangeCohort(cohort.id, patch)} />
        {doctors && doctors.length > 0 &&
          <DoctorDropdown cohort={cohort} doctors={doctors} onChange={patch => onChangeCohort(cohort.id, patch)} />}
        {tagOptions && tagOptions.length > 0 &&
          <TypeDropdown cohort={cohort} tagOptions={tagOptions} onChange={patch => onChangeCohort(cohort.id, patch)} />}
        <button type='button' className='btn btn-sm'
          title={__('reports.removeCohort')}
          disabled={cohorts.length <= 1}
          onClick={() => onRemoveCohort(cohort.id)}
          style={{ marginLeft: 'auto', color: '#e6ecf2', background: 'transparent', border: '1px solid #3c4a58', opacity: cohorts.length <= 1 ? 0.4 : 1 }}>
          ✕
        </button>
      </div>
    ))}

    <div style={{ paddingTop: 10 }}>
      <button type='button' className='btn btn-sm btn-primary' onClick={onAddCohort}>
        + {__('reports.addCohort')}
      </button>
    </div>
  </div>
)
