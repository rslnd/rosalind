const path = require('path')
const childProcess = require('child_process')

const main = async (afterPackContext) => {
  console.log('[compileAutoIt]', afterPackContext)

  const au3Path = path.join(__dirname, 'assets', 'generateEoswinReports.au3')
  const exePath = path.join(afterPackContext.appOutDir, 'generateEoswinReports.exe')

  try {
    await compile(au3Path, exePath)
  } catch (code) {
    throw new Error(`[compileAutoIt] Compiler exited with code ${code}`)
  }

  console.log('[compileAutoIt] Success')
}

const compile = (input, output) => {
  const args = [
    '/in', input,
    '/out', output,
    '/nopack',
    '/console'
  ]

  console.log('[compileAutoIt] Compiling: Aut2exe', args)

  const compiler = childProcess.spawn('Aut2exe', args)
  compiler.stdout.setEncoding('utf8')

  compiler.stdout.on('data', d =>
    console.log('[compileAutoIt]', d)
  )

  compiler.stderr.on('data', d =>
    console.error('[compileAutoIt] error:', d)
  )

  return new Promise((resolve, reject) => {
    compiler.on('close', code => {
      console.log('[compileAutoIt] Compiler exited with code', code)

      if (code === 0) {
        resolve(output)
      } else {
        reject(code)
      }
    })
  })
}

module.exports = main
