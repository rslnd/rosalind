const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

const main = () => {
  const au3Path = path.join(__dirname, 'assets', 'generateEoswinReports.au3')
  const exePath = path.join(__dirname, 'build', 'javascript', 'generateEoswinReports.exe')

  compile(au3Path, exePath)
}

const compile = (input, output) => {
  const args = [
    '/in', input,
    '/out', output,
    '/nopack',
    '/console'
  ]

  console.log('[compile] Compiling: Aut2exe', args)

  const compiler = childProcess.spawn('Aut2exe', args)
  compiler.stdout.setEncoding('utf8')

  compiler.stdout.on('data', d =>
    console.log('[compile]', d)
  )

  compiler.stderr.on('data', d =>
    console.error('[compile] error:', d)
  )

  compiler.on('close', code => {
    console.log('[compile] Compiler exited with code', code)
  })
}

main()
