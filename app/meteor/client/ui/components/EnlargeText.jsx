import React from 'react'
import { Overlay } from 'react-bootstrap'
import { TAPi18n } from 'meteor/tap:i18n'

const largeStyle = {
  fontSize: 70,
  letterSpacing: 8,
  textAlign: 'center',
  fontWeight: 'bold',
  display: 'block',
  paddingTop: 40,
  paddingBottom: 40,
  color: '#dedede'
}

const modalStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(52, 52, 52, 0.8)',
  zIndex: 1060
}

const CustomModal = ({ children, onHide }) => (
  <div onMouseLeave={onHide} style={modalStyle}>
    <div style={largeStyle} className="enable-select">
      {children}
    </div>
  </div>
)

export class EnlargeText extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      show: false
    }

    this.handleShow = this.handleShow.bind(this)
    this.handleHide = this.handleHide.bind(this)
  }

  handleShow () {
    this.setState({ show: true })
  }

  handleHide () {
    this.setState({ show: false })
  }

  render () {
    return (
      <span>
        <span
          onMouseEnter={this.handleShow}
          onMouseLeave={this.handleHide}
          style={{ cursor: 'pointer' }}
          title={TAPi18n.__('ui.enlargeText')}>
          {this.props.children}
        </span>

        <Overlay
          show={this.state.show}
          onHide={this.handleHide}
          enforceFocus={false}
          animation={false}
          backdrop={false}
          bsSize="large">
          <CustomModal onHide={this.handleHide}>
            {this.props.children}
          </CustomModal>
        </Overlay>
      </span>
    )
  }
}
