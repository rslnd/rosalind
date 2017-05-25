import React from 'react'

const colorMapping = {
  SS: 'rgb(215, 205, 108)',
  SN: 'rgb(158, 104, 87)',
  MS: 'rgb(165, 179, 82)',
  UB: 'rgb(105, 210, 116)',
  MM: 'rgb(186, 87, 122)',
  AL: 'rgb(87, 140, 189)',
  DK: 'rgb(103, 196, 174)'
}

const Assignees = ({ assignees }) => (
  <div style={{ paddingTop: 5, paddingBottom: 5 }}>
    {assignees.map((a) => (
      <div
        key={a}
        style={{ marginRight: 2, backgroundColor: colorMapping[a] }}
        className='avatar username img-sm'>{a}</div>
    ))}
  </div>
)

const Half = ({ part }) => (
  <div>
    <span className='pull-right text-muted'>
      {part.workload}<small className='text-muted'>%</small>
    </span>
    <Assignees assignees={part.assignees} />
  </div>
)

const Cell = (props) => (
  <td style={{
    height: 120,
    borderRight: '1px solid #ececec',
    padding: 5
  }}>
    <span className='pull-left'>
      <span style={{
        fontSize: 18
      }}>{props.day}&emsp;</span>
      {props.today && <span className='label label-success' style={{ opacity: 0.7 }}>Heute</span>}
    </span>
    <span className='pull-right' style={{
      fontSize: '28px'
    }}><b>{Math.floor((props.morning.workload + props.afternoon.workload) / 2)}</b>
      <small className='text-muted' style={{ fontSize: '19px' }}>%</small></span>

    <div className='row' style={{ marginTop: 60 }}>
      <div className='col-md-12'>
        <Half part={props.morning} />
      </div>
      <div className='col-md-12'>
        <Half part={props.afternoon} />
      </div>
    </div>
  </td>
)

export const Week = () => (
  <table>
    <tbody>
      <tr>
        <Cell
          day='Mo., 2.3.'
          morning={{
            assignees: [ 'MS', 'SN', 'AL' ],
            workload: 95
          }}
          afternoon={{
            assignees: [ 'MS', 'MM', 'DK' ],
            workload: 85
          }} />
        <Cell
          day='Di., 3.3.'
          morning={{
            assignees: [ 'SS', 'SN', 'UB', 'MS' ],
            workload: 98
          }}
          afternoon={{
            assignees: [ 'MM', 'AL' ],
            workload: 96
          }} />
        <Cell
          day='Mi., 4.3.'
          today
          morning={{
            assignees: [ 'SN', 'SS', 'UB', 'MM' ],
            workload: 65
          }}
          afternoon={{
            assignees: [ 'SN', 'DK', 'AL' ],
            workload: 77
          }} />
        <Cell
          day='Do., 5.3.'
          morning={{
            assignees: [ 'DK', 'SN', 'UB' ],
            workload: 47
          }}
          afternoon={{
            assignees: [ 'DK', 'SN' ],
            workload: 80
          }} />
        <Cell
          day='Fr., 6.3.'
          morning={{
            assignees: [ 'SS', 'AL', 'SN' ],
            workload: 77
          }}
          afternoon={{
            assignees: [ 'MS', 'UB' ],
            workload: 69
          }} />
      </tr>

      {/* Week 2 */}

      <tr style={{ borderTop: '1px solid #bababa', paddingTop: 10, marginTop: 10 }}>
        <Cell
          day='Mo., 9.3.'
          morning={{
            assignees: [ 'AL', 'SN' ],
            workload: 88
          }}
          afternoon={{
            assignees: [ 'MS', 'MM', 'SS' ],
            workload: 22
          }} />
        <Cell
          day='Di., 10.3.'
          morning={{
            assignees: [ 'AL', 'MM' ],
            workload: 33
          }}
          afternoon={{
            assignees: [ 'AL', 'SN', 'DK' ],
            workload: 80
          }} />
        <Cell
          day='Mi., 11.3.'
          morning={{
            assignees: [ 'SN', 'UB', 'SS', 'MM' ],
            workload: 50
          }}
          afternoon={{
            assignees: [ 'SN', 'UB', 'MS' ],
            workload: 38
          }} />
        <Cell
          day='Do., 12.3.'
          morning={{
            assignees: [ 'DK', 'SN', 'UB', 'SS' ],
            workload: 10
          }}
          afternoon={{
            assignees: [ 'DK', 'SN' ],
            workload: 39
          }} />
        <Cell
          day='Fr., 13.3.'
          morning={{
            assignees: [ 'MS', 'SN' ],
            workload: 19
          }}
          afternoon={{
            assignees: [ 'MS', 'SN', 'UB' ],
            workload: 5
          }} />
      </tr>

    </tbody>
  </table>
)
