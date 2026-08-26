import React from 'react'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'

// Period presets → { from, to } in local time. `key` identifies the active one.
export const PRESETS = [
  { key: 'last30', label: 'Letzte 30 Tage', range: () => ({ from: moment().subtract(30, 'days'), to: moment() }) },
  { key: 'last90', label: 'Letzte 90 Tage', range: () => ({ from: moment().subtract(90, 'days'), to: moment() }) },
  { key: 'last180', label: 'Letzte 6 Monate', range: () => ({ from: moment().subtract(6, 'months'), to: moment() }) },
  { key: 'last365', label: 'Letzte 12 Monate', range: () => ({ from: moment().subtract(12, 'months'), to: moment() }) },
  { key: 'thisYear', label: 'Heuer', range: () => ({ from: moment().startOf('year'), to: moment() }) },
  { key: 'lastYear', label: 'Vorjahr', range: () => ({ from: moment().subtract(1, 'year').startOf('year'), to: moment().subtract(1, 'year').endOf('year') }) }
]

// Visual look of the bar (positioning is handled by FixedBar).
const barVisualStyle = {
  background: '#2f3b47', // dark slate so the pinned bar stands out
  borderBottom: '1px solid #1f2833',
  padding: '10px 16px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  alignItems: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.28)'
}

// Pins its children to the very top of the viewport while keeping them aligned
// to the content column. A placeholder reserves the bar's height in the flow;
// the fixed layer tracks the placeholder's left/width so it follows sidebar
// toggles and window resizes.
class FixedBar extends React.Component {
  constructor (props) {
    super(props)
    this.state = { left: 0, width: 0, height: 56 }
    this.measure = this.measure.bind(this)
  }

  measure () {
    if (!this.ph) { return }
    const r = this.ph.getBoundingClientRect()
    const h = this.inner ? this.inner.getBoundingClientRect().height : this.state.height
    const left = Math.round(r.left)
    const width = Math.round(r.width)
    const height = Math.round(h)
    if (left !== this.state.left || width !== this.state.width || height !== this.state.height) {
      this.setState({ left, width, height })
    }
  }

  componentDidMount () {
    this.measure()
    window.addEventListener('resize', this.measure)
    window.addEventListener('scroll', this.measure, true)
    this.iv = setInterval(this.measure, 300) // catches sidebar open/close animation
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.measure)
    window.removeEventListener('scroll', this.measure, true)
    clearInterval(this.iv)
  }

  render () {
    return (
      <div ref={r => { this.ph = r }} className='hide-print' style={{ height: this.state.height, marginBottom: 16 }}>
        <div ref={r => { this.inner = r }}
          style={{ position: 'fixed', top: 0, left: this.state.left, width: this.state.width, zIndex: 1050, ...barVisualStyle }}>
          {this.props.children}
        </div>
      </div>
    )
  }
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

// Sticky filter header: period / doctor / appointment-type dropdowns + compare.
export const FlowFilterBar = ({ from, to, preset, assigneeIds, tags, compare, doctors, tagOptions, onChange }) => {
  const fromStr = moment(from).format('YYYY-MM-DD')
  const toStr = moment(to).format('YYYY-MM-DD')

  const doctorValue = assigneeIds.length === 0
    ? __('reports.filterAllDoctors')
    : assigneeIds.length === 1
      ? (doctors.find(d => d._id === assigneeIds[0]) || {}).name || '1'
      : __('reports.filterSelected', { count: assigneeIds.length })

  const tagName = (t) => t ? (t.shortTag ? `${t.shortTag} - ${t.tag}` : t.tag) : '1'
  const typeValue = tags.length === 0
    ? __('reports.filterAllTypes')
    : tags.length === 1
      ? tagName(tagOptions.find(t => t._id === tags[0]))
      : __('reports.filterSelected', { count: tags.length })

  return (
    <FixedBar>
      <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginRight: 6 }}>{__('reports.statistics')}</span>

      {/* Zeitraum */}
      <Dropdown label={__('reports.filterPeriod') + ':'} value={periodValue(preset, from, to)}>
        {(close) => (
          <div>
            {PRESETS.map(p => (
              <div key={p.key} style={{ ...itemStyle, fontWeight: preset === p.key ? 700 : 400, background: preset === p.key ? '#eef4fb' : 'transparent' }}
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

      {/* Arzt */}
      {doctors && doctors.length > 0 &&
        <Dropdown label={__('reports.filterDoctor') + ':'} value={doctorValue}>
          <div>
            <div style={{ ...itemStyle, color: '#888' }} className='flow-dd-item'
              onClick={() => onChange({ assigneeIds: [] })}>
              {__('reports.filterAllDoctors')}
            </div>
            <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />
            {doctors.map(d => (
              <CheckItem key={d._id} checked={assigneeIds.includes(d._id)}
                onChange={() => onChange({ assigneeIds: toggle(assigneeIds, d._id) })}>
                {d.name}
              </CheckItem>
            ))}
          </div>
        </Dropdown>}

      {/* Terminart */}
      {tagOptions && tagOptions.length > 0 &&
        <Dropdown label={__('reports.filterType') + ':'} value={typeValue}>
          <div>
            <div style={{ ...itemStyle, color: '#888' }} className='flow-dd-item'
              onClick={() => onChange({ tags: [] })}>
              {__('reports.filterAllTypes')}
            </div>
            <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />
            {tagOptions.map(t => (
              <CheckItem key={t._id} checked={tags.includes(t._id)}
                onChange={() => onChange({ tags: toggle(tags, t._id) })}>
                {t.color &&
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: t.color, marginRight: 6, verticalAlign: 'middle' }} />}
                {t.shortTag
                  ? <span><strong>{t.shortTag}</strong> - {t.tag}</span>
                  : <span>{t.tag}</span>}
              </CheckItem>
            ))}
          </div>
        </Dropdown>}

      {/* Vergleich */}
      <label style={{ fontSize: 13, fontWeight: 400, cursor: 'pointer', marginLeft: 4, marginBottom: 0, color: '#e6ecf2' }}>
        <input type='checkbox' checked={compare} onChange={e => onChange({ compare: e.target.checked })} style={{ marginRight: 6 }} />
        {__('reports.compareYearOverYear')}
      </label>
    </FixedBar>
  )
}
