import { useRef, useState, useEffect } from 'react'

const readFile = file =>
  new Promise((resolve, reject) => {
    const reader = new window.FileReader()
    reader.addEventListener('load', function () {
      // Strip `data:image/jpeg;base64,` part from beginning
      const base64 = this.result.substr(this.result.indexOf(',') + 1)

      resolve({
        name: file.name,
        mediaType: file.type,
        base64,
        file
      })
    })
    reader.readAsDataURL(file)
  })

export const DropZone = ({ children, onDrop }) => {
  const ref = useRef(null)
  const [isDropping, setIsDropping] = useState(false)

  const handleDrag = fn => e => {
    e.preventDefault()
    e.stopPropagation()
    if (fn) { fn(e) }
  }
  const enter = handleDrag(() => setIsDropping(true))
  const leave = handleDrag(() => setIsDropping(false))
  const drop = handleDrag(async e => {
    setIsDropping(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // It's not an array apparently
      const fs = []
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        fs.push(e.dataTransfer.files[i])
      }
      const results = await Promise.all(fs.map(readFile))
      e.dataTransfer.clearData()
      results.forEach(onDrop)
    }
  })

  useEffect(() => {
    ref.current.addEventListener('dragenter', enter)
    ref.current.addEventListener('dragleave', leave)
    ref.current.addEventListener('dragover', enter)
    ref.current.addEventListener('drop', drop)

    return () => {
      ref.current.removeEventListener('dragenter', enter)
      ref.current.removeEventListener('dragleave', leave)
      ref.current.removeEventListener('dragover', enter)
      ref.current.removeEventListener('drop', drop)
    }
  })

  const droppingStyle = isDropping ? injectStyle : {}

  return children({ ref, droppingStyle, isDropping })
}

const injectStyle = {
  position: 'absolute',
  pointerEvents: 'none',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  opacity: 0.6,
  backgroundColor: '#9f9f9f',
  border: '4px dashed #464646',
  borderRadius: '4px',
  zIndex: 1070
}
