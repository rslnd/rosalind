import { Kadira } from 'meteor/meteorhacks:kadira'

export default () => {
  Kadira.errors.addFilter(Kadira.errorFilters.filterCommonMeteorErrors)
}
