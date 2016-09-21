export const parseNewlines = (text) => {
  if (!text || typeof text !== 'string') { return }
  return text
    .split('\\r\\n').join('\n')
    .split('\\r').join('\n')
    .split('\\n').join('\n')
}
