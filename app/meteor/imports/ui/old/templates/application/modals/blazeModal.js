import { Template } from 'meteor/templating'
import { Blaze } from 'meteor/blaze'
import 'bootstrap/dist/js/bootstrap.js'

let $soloModal = null
const allowMultiple = false

export const Modal = {
  show: (templateName, data, options) => {
    if ($soloModal === null || allowMultiple) {
      let parentNode = document.body
      let view = Blaze.renderWithData(Template[templateName], data, parentNode)
      let domRange = view._domrange

      let $modal = domRange.$('.modal')

      $modal.on('shown.bs.modal', (event) => {
        $modal.find('[autofocus]').focus()
      })

      $modal.on('hidden.bs.modal', (event) => {
        Blaze.remove(view)
        $soloModal = null
      })

      $soloModal = $modal

      $modal.modal(options || {})
    }
  },

  hide: (template) => {
    if (template instanceof Blaze.TemplateInstance) {
      template.$('.modal').modal('hide')
    } else if ($soloModal != null) {
      $soloModal.modal('hide')
    }
  }
}
