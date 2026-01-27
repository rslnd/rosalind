import React, { useState, useRef, useCallback, useEffect } from 'react'
import debounce from 'lodash/debounce'
import Button from '@material-ui/core/Button'
import Slider from '@material-ui/core/Slider'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { Icon } from '../../components/Icon'
import { executeDSL } from './ScheduleDSL'

const STORAGE_KEY = 'rosalind-dsl-code'
const STORAGE_KEY_SPEED = 'rosalind-dsl-speed'
const STORAGE_KEY_MANUAL = 'rosalind-dsl-manual'
const STORAGE_KEY_SNIPPETS = 'rosalind-dsl-snippets'

const panelStyle = {
  position: 'fixed',
  bottom: 0,
  right: 0,
  width: 500,
  maxHeight: '80vh',
  backgroundColor: '#1e1e1e',
  borderTopLeftRadius: 8,
  boxShadow: '0 -2px 20px rgba(0,0,0,0.3)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column'
}

const panelCollapsedStyle = {
  ...panelStyle,
  height: 'auto',
  maxHeight: 'none'
}

const headerStyle = {
  padding: '8px 12px',
  backgroundColor: '#2d2d2d',
  borderTopLeftRadius: 8,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  color: '#d4d4d4'
}

const editorStyle = {
  width: '100%',
  minHeight: 180,
  maxHeight: 250,
  fontFamily: 'Monaco, Consolas, monospace',
  fontSize: 12,
  padding: 10,
  border: 'none',
  resize: 'vertical',
  backgroundColor: '#1e1e1e',
  color: '#d4d4d4',
  outline: 'none'
}

const logContainerStyle = {
  flex: 1,
  maxHeight: 200,
  overflowY: 'auto',
  backgroundColor: '#252526',
  padding: 8,
  fontFamily: 'Monaco, Consolas, monospace',
  fontSize: 11
}

const logEntryStyle = {
  info: { color: '#9cdcfe' },
  success: { color: '#4ec9b0' },
  error: { color: '#f14c4c' },
  warning: { color: '#cca700' }
}

const progressStyle = {
  padding: '6px 10px',
  backgroundColor: '#2d2d2d',
  color: '#d4d4d4',
  fontSize: 11
}

const buttonBarStyle = {
  padding: '8px 10px',
  display: 'flex',
  gap: 8,
  backgroundColor: '#252526'
}

const defaultCode = `// Close Tuesdays, open Fridays with bookables for Dr. Muck
await doBetween('2025-03-01', '2025-06-30', async () => {
  if (isSunday) return

  if (isTuesday) {
    await close('Muck')
  }
  if (isFriday) {
    // Opens using default schedule times and creates bookables
    // Translates default schedule into overrides and creates bookable slots
    await openBookable('Muck')
    // Or specify explicit times (ignores default schedule):
    // await openBookable('Muck', { from: '0800', to: '1200' })
  }
})

// Available functions:
// await openBookable('Name')  - Apply default schedule as overrides + create bookables
// await openDay('Name')       - Apply default schedule as overrides (no bookables)
// await open('Name')          - Create overlay for available time
// await close('Name')         - Block entire day
// await closeBookable('Name') - Remove bookables
`

export const ScheduleDSLEditor = ({ calendarId, calendar, history, basePath }) => {
  const [code, setCode] = useState(() => {
    // Load saved code from localStorage on initial render
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved || defaultCode
    } catch (e) {
      return defaultCode
    }
  })
  const [logs, setLogs] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [progress, setProgress] = useState(null)
  const [speed, setSpeed] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPEED)
      return saved ? parseInt(saved, 10) : 300
    } catch (e) {
      return 300
    }
  })
  const [manualMode, setManualMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_MANUAL) === 'true'
    } catch (e) {
      return false
    }
  })
  const [pendingConfirm, setPendingConfirm] = useState(null) // { date, resolve }
  const [snippets, setSnippets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SNIPPETS)
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  const [selectedSnippet, setSelectedSnippet] = useState('')
  const abortControllerRef = useRef(null)
  const logContainerRef = useRef(null)
  const speedRef = useRef(speed) // Use ref so running DSL can access current speed
  const confirmResolverRef = useRef(null)

  // Debounced save to localStorage
  const saveToStorage = useCallback(
    debounce((value) => {
      try {
        localStorage.setItem(STORAGE_KEY, value)
      } catch (e) {
        console.warn('Failed to save DSL code to localStorage', e)
      }
    }, 500),
    []
  )

  const handleCodeChange = (e) => {
    const newCode = e.target.value
    setCode(newCode)
    saveToStorage(newCode)
  }

  const handleLog = useCallback((entry) => {
    setLogs(prev => {
      const newLogs = [...prev, entry]
      // Keep only last 100 logs
      if (newLogs.length > 100) {
        return newLogs.slice(-100)
      }
      return newLogs
    })
    // Auto-scroll to bottom
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
      }
    }, 10)
  }, [])

  const handleProgress = useCallback((p) => {
    setProgress(p)
  }, [])

  const handleSpeedChange = (e, newValue) => {
    setSpeed(newValue)
    speedRef.current = newValue
    try {
      localStorage.setItem(STORAGE_KEY_SPEED, String(newValue))
    } catch (e) {
      // ignore
    }
  }

  // Getter function so DSL can access current speed dynamically
  const getStepDelay = useCallback(() => speedRef.current, [])

  const handleManualModeChange = (e) => {
    const checked = e.target.checked
    setManualMode(checked)
    try {
      localStorage.setItem(STORAGE_KEY_MANUAL, String(checked))
    } catch (e) {
      // ignore
    }
  }

  // Keyboard handler for manual confirmation
  useEffect(() => {
    if (!pendingConfirm) return

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'y' || e.key === 'Y') {
        e.preventDefault()
        e.stopPropagation()
        confirmResolverRef.current?.('proceed')
        setPendingConfirm(null)
      } else if (e.key === 's' || e.key === 'S' || e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        e.stopPropagation()
        confirmResolverRef.current?.('skip')
        setPendingConfirm(null)
      } else if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
        e.preventDefault()
        e.stopPropagation()
        confirmResolverRef.current?.('abort')
        setPendingConfirm(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [pendingConfirm])

  // Function to request manual confirmation before each day
  const requestConfirmation = useCallback((date) => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve
      setPendingConfirm({ date })
    })
  }, [])

  const handleRun = async () => {
    if (!calendarId) {
      handleLog({ message: 'Error: No calendar selected', type: 'error', timestamp: new Date() })
      return
    }

    setLogs([])
    setProgress(null)
    setIsRunning(true)
    abortControllerRef.current = new AbortController()

    handleLog({ message: 'Starting...', type: 'info', timestamp: new Date() })

    try {
      await executeDSL(code, {
        calendarId,
        calendar,
        history,
        basePath,
        onLog: handleLog,
        onProgress: handleProgress,
        signal: abortControllerRef.current.signal,
        getStepDelay,
        manualMode,
        requestConfirmation
      })
      handleLog({ message: 'Done!', type: 'success', timestamp: new Date() })
    } catch (error) {
      handleLog({ message: `Error: ${error.message}`, type: 'error', timestamp: new Date() })
    } finally {
      setIsRunning(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      handleLog({ message: 'Stopping...', type: 'warning', timestamp: new Date() })
    }
  }

  const handleClear = () => {
    setLogs([])
    setProgress(null)
  }

  const saveSnippets = (newSnippets) => {
    setSnippets(newSnippets)
    try {
      localStorage.setItem(STORAGE_KEY_SNIPPETS, JSON.stringify(newSnippets))
    } catch (e) {
      console.warn('Failed to save snippets', e)
    }
  }

  const handleSaveSnippet = () => {
    const name = window.prompt('Snippet name:')
    if (!name || !name.trim()) return

    const trimmedName = name.trim()
    const existing = snippets.find(s => s.name === trimmedName)
    if (existing) {
      if (!window.confirm(`Overwrite "${trimmedName}"?`)) return
      const updated = snippets.map(s => s.name === trimmedName ? { ...s, code } : s)
      saveSnippets(updated)
    } else {
      saveSnippets([...snippets, { name: trimmedName, code }])
    }
    setSelectedSnippet(trimmedName)
  }

  const handleLoadSnippet = (e) => {
    const name = e.target.value
    setSelectedSnippet(name)
    if (!name) return
    const snippet = snippets.find(s => s.name === name)
    if (snippet) {
      setCode(snippet.code)
      saveToStorage(snippet.code)
    }
  }

  const handleDeleteSnippet = () => {
    if (!selectedSnippet) return
    if (!window.confirm(`Delete "${selectedSnippet}"?`)) return
    saveSnippets(snippets.filter(s => s.name !== selectedSnippet))
    setSelectedSnippet('')
  }

  if (!isExpanded) {
    return (
      <div style={panelCollapsedStyle}>
        <div style={headerStyle} onClick={() => setIsExpanded(true)}>
          <span><Icon name='code' /> DSL</span>
          <Icon name='chevron-up' />
        </div>
      </div>
    )
  }

  return (
    <div style={panelStyle} className='hide-print'>
      <div style={headerStyle} onClick={() => setIsExpanded(false)}>
        <span><Icon name='code' /> Schedule DSL</span>
        <Icon name='chevron-down' />
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '6px 10px', backgroundColor: '#252526', alignItems: 'center' }}>
        <select
          value={selectedSnippet}
          onChange={handleLoadSnippet}
          disabled={isRunning}
          style={{
            flex: 1,
            backgroundColor: '#3c3c3c',
            color: '#d4d4d4',
            border: '1px solid #555',
            borderRadius: 3,
            padding: '4px 8px',
            fontSize: 11
          }}
        >
          <option value="">-- Snippets --</option>
          {snippets.map(s => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
        <Button
          size='small'
          style={{ minWidth: 32, padding: '2px 8px', color: '#d4d4d4', borderColor: '#555' }}
          variant='outlined'
          onClick={handleSaveSnippet}
          disabled={isRunning || !code.trim()}
          title='Save snippet'
        >
          <Icon name='save' />
        </Button>
        <Button
          size='small'
          style={{ minWidth: 32, padding: '2px 8px', color: selectedSnippet ? '#f14c4c' : '#666', borderColor: '#555' }}
          variant='outlined'
          onClick={handleDeleteSnippet}
          disabled={isRunning || !selectedSnippet}
          title='Delete snippet'
        >
          <Icon name='trash' />
        </Button>
      </div>

      <textarea
        style={editorStyle}
        value={code}
        onChange={handleCodeChange}
        disabled={isRunning}
        spellCheck={false}
        placeholder='// Enter DSL code here...'
      />

      <div style={buttonBarStyle}>
        {!isRunning ? (
          <Button
            variant='contained'
            size='small'
            style={{ backgroundColor: '#0e639c', color: 'white' }}
            onClick={handleRun}
            disabled={!code.trim()}
          >
            <Icon name='play' />&nbsp;Run
          </Button>
        ) : (
          <Button
            variant='contained'
            size='small'
            style={{ backgroundColor: '#c42b1c', color: 'white' }}
            onClick={handleStop}
          >
            <Icon name='stop' />&nbsp;Stop
          </Button>
        )}
        <Button
          variant='outlined'
          size='small'
          style={{ color: '#d4d4d4', borderColor: '#555' }}
          onClick={handleClear}
          disabled={isRunning}
        >
          Clear
        </Button>
        <FormControlLabel
          control={
            <Checkbox
              checked={manualMode}
              onChange={handleManualModeChange}
              size='small'
              style={{ color: '#888', padding: 4 }}
              disabled={isRunning}
            />
          }
          label={<span style={{ color: '#888', fontSize: 11 }}>Manual</span>}
          style={{ marginLeft: 8, marginRight: 0 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: 8 }}>
          <span style={{ color: '#888', fontSize: 10 }}>Fast</span>
          <Slider
            value={speed}
            onChange={handleSpeedChange}
            min={0}
            max={2000}
            step={50}
            style={{ width: 80 }}
          />
          <span style={{ color: '#888', fontSize: 10 }}>Slow</span>
          <span style={{ color: '#666', fontSize: 10, minWidth: 40, textAlign: 'right' }}>{speed}ms</span>
        </div>
      </div>

      {pendingConfirm && (
        <div style={{
          padding: '10px 12px',
          backgroundColor: '#3c3c00',
          borderTop: '1px solid #555',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>
            {pendingConfirm.date} — Proceed?
          </span>
          <span style={{ color: '#aaa', fontSize: 11 }}>
            [Enter/Y] Proceed · [S/N] Skip · [Esc/Q] Abort
          </span>
        </div>
      )}

      {progress && (
        <div style={progressStyle}>
          <strong>{progress.date}</strong> &mdash; {progress.current}/{progress.total}
          ({Math.round(progress.current / progress.total * 100)}%)
          <div style={{
            marginTop: 4,
            height: 3,
            backgroundColor: '#444',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress.current / progress.total * 100}%`,
              height: '100%',
              backgroundColor: '#4ec9b0',
              transition: 'width 0.15s'
            }} />
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div style={logContainerStyle} ref={logContainerRef}>
          {logs.map((entry, i) => (
            <div key={i} style={logEntryStyle[entry.type] || logEntryStyle.info}>
              {entry.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
