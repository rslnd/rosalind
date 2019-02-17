const packageJSON = require('./package.json')
const v = packageJSON.version
const command = `git tag -a v${v} -m '🐣 v${v}'; git push --follow-tags`

console.log(command)
