import { useState, useEffect } from 'react'
import { apiBaseUrl } from '../apiBaseUrl'

const imgStyle = {
  maxWidth: '25%',
  height: 'auto',
  outline: 0,
  margin: 3
}

const isDownloadAttributeSupported =
  typeof document !== 'undefined' &&
  'download' in document.createElement('a')

const MediaPage = ({ token }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(true)
  const [media, setMedia] = useState([])

  useEffect(async () => {
    try {
      setError(null)
      setLoading(true)
      const body = JSON.stringify({
        token
      })
      const req = await fetch((apiBaseUrl || '') + '/portal/media',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'content-length': body.length
          },
          body: body
        })
      const res = await req.json()
      setLoading(false)
      if (res.error) {
        setError(res.error)
      } else {
        setMedia(res)
      }
    } catch (e) {
      setLoading(false)
      setError(e)
    }
  }, [token, retry])

  const saveAsFile = ({ filename, b64, mediaType }) => {
    console.log('saveasfile', filename, b64.substr(0, 100))
    const link = document.createElement('a')
    link.download = filename

    if (!b64.startsWith('data:')) {
      b64 = 'data:' + mediaType + ';base64,' + b64
    }

    link.href = b64
    link.click()
  }

  const handleClick = async (m) => {
    setError(null)
    try {
      const body = JSON.stringify({
        token,
        _id: m._id
      })
      const req = await fetch((apiBaseUrl || '') + '/portal/media-download',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'content-length': body.length
          },
          body: body
        })
      const res = await req.json()
      setLoading(false)
      if (res.error) {
        console.error(res)
        setError(res.error)
      } else {
        setError(null)
        console.log('saving')
        saveAsFile({
          filename: res.filename,
          mediaType: res.mediaType,
          b64: res.b64
        })
      }
    } catch (e) {
      console.error(e)
      setLoading(false)
      setError(e)
    }
  }

  const downloadAll = (e) => {
    e.preventDefault()
    e.stopPropagation()
    for (let i = 0; i < media.length; i++) {
      document.getElementById('link-' + media[i]._id).click()
    }
  }

  return <div>
    <p>Sie können die Bilder innerhalb von 14 Tagen abspeichern.</p>

    {
      isDownloadAttributeSupported
      ? <p>Tippen Sie auf ein Bild, um es zu speichern.</p>
      : <p>Tippen Sie auf ein Bild und halten Sie gedrückt, um es zu speichern.</p>
    }

    <button onClick={downloadAll}>
      Alle Bilder speichern
    </button>

    <br />
    <br />

    {error && <div>Fehler: {error.toString()}</div>}
    {loading && <div>Einen Moment bitte, Bilder werden geladen...</div>}

    {
      (media || []).map(m =>
        <a
          id={'link-' + m._id}
          key={m._id}
          title={m.title}
          href='#'
          onClick={() => handleClick(m)}
        >
          <img style={imgStyle} alt={m.title} src={m.preview} />
        </a>
      )
    }

    <br />
    <br />
    <a href='#' onClick={() => setRetry(retry + 1)}>
      Neu laden
    </a>
  </div>
}

export default MediaPage
