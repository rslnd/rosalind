import { Percent } from './shared/Percent'

const Cell = ({ label, part, of, right }) => (
  <td>
    {/* <span style={{ float: right && 'right' }}>{label}</span> */}
    {/* <br /> */}
    <Percent
      part={part}
      of={of}
      noBr
      parenAbsolute
      style={{
        color: 'rgb(128, 128, 128)',
        paddingLeft: 20
      }}
      percentageStyle={{
        fontSize: 24,
        float: 'right'
      }} />
  </td>
)

export const Cancelations = ({ report }) => (
  <div className="table-responsive enable-select">
    <table className="table no-margin">
      <thead>
        <tr>
          <th style={{ width: 40 }}></th>
          <th style={{ textAlign: 'right' }}>storniert</th>
          <th style={{ textAlign: 'right' }}>nicht erschienen</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th style={{ textAlign: 'right' }}>erinnert</th>
          <Cell label="Erinnert, storniert" part={report.total.noShows.remindedCanceled} of={report.total.noShows.total} right />
          <Cell label="Erinnert, nicht erschienen" part={report.total.noShows.remindedNoShow} of={report.total.noShows.total} right />
        </tr>

        <tr>
          <th style={{ textAlign: 'right' }}>nicht erinnert</th>
          <Cell label="nicht erinnert, storniert" part={report.total.noShows.notRemindedCanceled} of={report.total.noShows.total} right />
          <Cell label="Nicht erinnert, nicht erschienen" part={report.total.noShows.notRemindedNoShow} of={report.total.noShows.total} right />
        </tr>
      </tbody>
    </table>
  </div>
)
