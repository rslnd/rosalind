import React from 'react'
import { Box } from './Box.jsx'
import { storiesOf } from '@kadira/storybook'

storiesOf('Box', module)
  .add('default', () => (
    <Box title="A little card" body="Vinyl wolf asymmetrical ennui. Narwhal gochujang kombucha portland keytar, mustache cold-pressed +1 ethical jean shorts." />
  ))
  .add('warning', () => (
    <Box type="warning" title="A little card" body="Vinyl wolf asymmetrical ennui. Narwhal gochujang kombucha portland keytar, mustache cold-pressed +1 ethical jean shorts." />
  ))
  .add('success with icon', () => (
    <Box icon="refresh" type="success" title="A little card" body="Vinyl wolf asymmetrical ennui. Narwhal gochujang kombucha portland keytar, mustache cold-pressed +1 ethical jean shorts." />
  ))
  .add('with children', () => (
    <Box icon="check" type="success" title="A little card">
      <span>A span inside a Box</span>
    </Box>
  ))
