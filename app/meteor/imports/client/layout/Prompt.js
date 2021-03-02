import React, { useState } from 'react'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import { ErrorBoundary } from './ErrorBoundary'

function Deferred() {
  this.promise = new Promise((resolve, reject) => {
    this.reject = reject
    this.resolve = resolve
  })
}

let globalSetOpen = null
let currentOptions = null
let currentPrompt = null

export const prompt = (options) => {
  currentOptions = options
  currentPrompt = new Deferred()

  globalHandleChange(options.initialValue || true) // true for plain confirmation prompts
  globalSetOpen(true)

  return currentPrompt.promise
}

window.prompt = prompt

export const Prompts = () => {
  const [open, setOpen] = useState(false)
  const [value, handleChange] = useState()

  globalSetOpen = setOpen
  globalHandleChange = handleChange

  const handleClose = () => {
    setOpen(false)
    currentPrompt = null
    currentOptions = null
    handleChange(undefined)
  }

  const handleOK = () => {
    setOpen(false)

    currentPrompt.resolve(value)
  }

  return <Modal
    open={open}
    onClose={handleClose}
  >
    <Paper style={modalStyle}>
      <ErrorBoundary>
        {(open && currentOptions) ? <>
          {currentOptions.title}
          {currentOptions.body && <><br /><br />{currentOptions.body}</>}

          {currentOptions.Component &&
            <currentOptions.Component
              value={value}
              onChange={handleChange}
            />
          }

          <br />
          <div style={buttonsStyle}>
            <Button style={flex} fullWidth onClick={handleClose}>{currentOptions.cancel || 'Abbrechen'}</Button>
            <Button style={flex} color='primary' fullWidth onClick={handleOK}>{currentOptions.confirm || 'OK'}</Button>
          </div>
        </> : null}
      </ErrorBoundary>
    </Paper>
  </Modal>
}

const modalStyle = {
  position: 'absolute',
  width: 500,
  top: '10%',
  left: 'calc(50% - 250px)',
  padding: 15,
  zIndex: 4000
}

const buttonsStyle = {
  display: 'flex',
  width: '100%'
}

const flex = {
  flex: 1
}
