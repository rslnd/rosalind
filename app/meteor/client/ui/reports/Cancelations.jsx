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

export const Cancelations = () => (
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
          <Cell label="Storniert per SMS" part={12} of={355} right />
          <Cell label="Erinnert, nicht erschienen" part={2} of={355} right />
        </tr>

        <tr>
          <th style={{ textAlign: 'right' }}>nicht erinnert</th>
          <Cell label="Anders storniert" part={28 - 12} of={355} right />
          <Cell label="Nicht erinnert, nicht erschienen" part={17} of={355} right />
        </tr>
      </tbody>
    </table>
  </div>
)

//
// <Cell label="Gesamt Termine" part={355} />
// <Cell label="Gesamt storniert" part={28} of={355} right />
// <Cell label="Gesamt nicht erschienen" part={19} of={355} right />
//
// <Cell label="Keine Erinnerung" part={355 - 204} of={355} />
// <Cell label="Nicht erinnert, nicht erschienen" part={17} of={355} right />
//
// <Cell label="Erinnert per SMS" part={204} of={355} />
