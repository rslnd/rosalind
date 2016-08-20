import dragDrop from 'drag-drop/buffer'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import { Importers } from 'api/importers'

export default () => {
  dragDrop('body', (files) => {
    files.forEach((file) => {
    })
  })
}
