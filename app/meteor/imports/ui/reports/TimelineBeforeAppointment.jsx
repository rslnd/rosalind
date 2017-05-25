import React from 'react'
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  LineMarkSeries,
  DiscreteColorLegend
} from 'react-vis'
import 'react-vis/dist/style'
import { Box } from 'client/ui/components/Box'

export const TimelineBeforeAppointment = ({ report }) => (
  <Box title="Zeitlinie" noPadding icon="clock-o">
    <Chart report={report} />
  </Box>
)

const Chart = () => (
  <div className="row">
    <div className="col-md-12">
      <div style={{
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          left: 35,
          zIndex: 2000
        }}>
          <DiscreteColorLegend
            orientation="horizontal"
            width={200}
            items={['Abgesagt', 'Ausgemacht']}
          />
        </div>
      </div>
      <XYPlot
        width={640}
        height={200}>
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis title="Tage vor Termin" />
        <YAxis />
        <LineMarkSeries
          className="cancelations"
          curve={'curveMonotoneX'}
          data={[
            {x: -14, y: 10},
            {x: -13, y: 3},
            {x: -12, y: 3},
            {x: -11, y: 5},
            {x: -10, y: 8},
            {x: -9, y: 11},
            {x: -8, y: 13},
            {x: -7, y: 26},
            {x: -6, y: 20},
            {x: -5, y: 14},
            {x: -4, y: 12},
            {x: -3, y: 50},
            {x: -2, y: 90},
            {x: -1, y: 40},
            {x: -0, y: 60}
          ]} />

        <LineMarkSeries
          className="assignments"
          curve={'curveMonotoneX'}
          data={[
            {x: -14, y: 18},
            {x: -13, y: 20},
            {x: -12, y: 60},
            {x: -11, y: 70},
            {x: -10, y: 40},
            {x: -9, y: 39},
            {x: -8, y: 50},
            {x: -7, y: 60},
            {x: -6, y: 45},
            {x: -5, y: 30},
            {x: -4, y: 10},
            {x: -3, y: 19},
            {x: -2, y: 14},
            {x: -1, y: 20},
            {x: -0, y: 40}
          ]} />

      </XYPlot>
    </div>
  </div>
)
