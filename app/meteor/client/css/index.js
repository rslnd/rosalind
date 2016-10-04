import 'bootstrap/dist/css/bootstrap.css'
import 'font-awesome-webpack'
import 'admin-lte/dist/css/AdminLTE.css'
import 'admin-lte/dist/css/skins/skin-blue.css'
import adminlte from './adminlte'
import './layout.scss'
import './lockedLayout.css'
import './overrides.scss'
import './print.css'
import './materialFullCalendar.css'
import './mui.css'
import injectTapEventPlugin from 'react-tap-event-plugin'
import 'react-dates/css/styles.scss'

// Material UI
injectTapEventPlugin()
adminlte()
