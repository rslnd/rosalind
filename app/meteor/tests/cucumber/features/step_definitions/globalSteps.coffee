locale = require './fixtures/locale'
database = require './fixtures/database'
user = require './fixtures/user'
logs = require './fixtures/logs'

module.exports = ->
  @Before ->
    browser.url(process.env.ROOT_URL)
    browser.windowHandleMaximize()
    browser.timeouts('script', 30 * 1000)
    browser.timeouts('implicit', 30 * 1000)
    browser.timeouts('page load', 30 * 1000)
    browser.waitForExist('#loaded')
    browser.execute ->
      # Selenium throws "Element is not clickable" when elements are zoomed
      # TODO: Set size of elements properly, don't use zoom
      css = '
        .zoom-1 { zoom: 1 !important; }
        .zoom-2 { zoom: 1 !important; }
        body { zoom: 1 !important; }
      '
      style = document.createElement('style')
      style.type = 'text/css'
      if (style.styleSheet)
        style.styleSheet.cssText = css;
      else
        style.appendChild(document.createTextNode(css))

      document.head.appendChild(style)

      # Visualize cursor
      cursor = document.createElement('img')
      cursor.setAttribute('src', 'data:image/png;base64,' +
        'iVBORw0KGgoAAAANSUhEUgAAABQAAAAeCAQAAACGG/bgAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAA' +
        'HsYAAB7GAZEt8iwAAAAHdElNRQfgAwgMIwdxU/i7AAABZklEQVQ4y43TsU4UURSH8W+XmYwkS2I0' +
        '9CRKpKGhsvIJjG9giQmliHFZlkUIGnEF7KTiCagpsYHWhoTQaiUUxLixYZb5KAAZZhbunu7O/PKf' +
        'e+fcA+/pqwb4DuximEqXhT4iI8dMpBWEsWsuGYdpZFttiLSSgTvhZ1W/SvfO1CvYdV1kPghV68a3' +
        '0zzUWZH5pBqEui7dnqlFmLoq0gxC1XfGZdoLal2kea8ahLoqKXNAJQBT2yJzwUTVt0bS6ANqy1ga' +
        'VCEq/oVTtjji4hQVhhnlYBH4WIJV9vlkXLm+10R8oJb79Jl1j9UdazJRGpkrmNkSF9SOz2T71s7M' +
        'SIfD2lmmfjGSRz3hK8l4w1P+bah/HJLN0sys2JSMZQB+jKo6KSc8vLlLn5ikzF4268Wg2+pPOWW6' +
        'ONcpr3PrXy9VfS473M/D7H+TLmrqsXtOGctvxvMv2oVNP+Av0uHbzbxyJaywyUjx8TlnPY2YxqkD' +
        'dAAAAABJRU5ErkJggg==')
      cursor.setAttribute('id', 'selenium_mouse_follower')
      cursor.setAttribute('style', 'position: absolute; z-index: 20000; pointer-events: none;')
      document.body.appendChild(cursor)
      $(document).mousemove((e) ->
        $('#selenium_mouse_follower').stop().animate({ left: e.pageX, top: e.pageY })
      )

    user.logout()
    database.reset()
    locale.reset()
    logs.failOnError()
    logs.fetchLogs()

  @After ->
    logs.fetchLogs()
    logs.failOnError()
    user.logout()
    database.reset()
    locale.reset()
