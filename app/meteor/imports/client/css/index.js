import 'bootstrap/dist/css/bootstrap.css'
import 'admin-lte/dist/css/AdminLTE.css'
import 'admin-lte/dist/css/skins/skin-blue.css'
import adminlte from './adminlte'
import './layout.scss'
import './lockedLayout.css'
import './overrides.scss'
import './print.css'
import './mui.css'
import './reactDates.scss'
import injectTapEventPlugin from 'react-tap-event-plugin'

// Material UI
injectTapEventPlugin()
adminlte()
