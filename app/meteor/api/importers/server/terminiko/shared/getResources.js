export const getResource = (options) => {
  const res = getResources(options)
  if (res && res[0]) {
    return res[0]
  }
}

export const getResources = (options) => {
  if (!options.record.Resources) { return }
  let resourceIds = options.record.Resources.toString().split(';')
  resourceIds = resourceIds.filter((r) => r.indexOf(options.key) !== -1)
  return resourceIds.map((id) => options.resources[id])
}
