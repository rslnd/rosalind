import groupBy from 'lodash/fp/groupBy'
import mapValues from 'lodash/fp/mapValues'
import identity from 'lodash/fp/identity'
import flatten from 'lodash/flatten'
import map from 'lodash/map'
import uniq from 'lodash/uniq'
import { getPossibleTags } from '../../api/availabilities/methods/getPossibleTags'

export const prepareAvailabilities = ({ allAvailabilities, constraints, tags }) => {
  // Group by assigneeId and limit to the next ~7 free availabilities,
  // assuming that the availabilities are sorted asc by start date
  const upcomingAvailabilitiesByAssignee = allAvailabilities.reduce((acc, availability, i) => {
    if (!acc[availability.assigneeId]) {
      acc[availability.assigneeId] = []
    } else if (acc[availability.assigneeId].length >= 14) {
      return acc
    }

    if (availability.slotsAvailable === 0) {
      return acc
    } else {
      const possibleTags = getPossibleTags({ availability, tags, constraints })
      acc[availability.assigneeId].push({
        ...availability,
        tags: possibleTags
      })
      return acc
    }
  }, {})

  return {
    availabilities: upcomingAvailabilitiesByAssignee
  }
}

export const applySearchFilter = ({
  searchValue = '',
  assignees,
  tags,
  availabilities,
  hoverAvailability,
  calendars
}) => {
  // Reduce the search string to { [assingees], [tags], wanted: 'assignee'|'tags' }
  const emptyQuery = { assignees: [], tags: [], wanted: null }
  const parsedQuery = searchValue
    .toLowerCase()
    .split(' ')
    .filter(t => t.length >= 1)
    .reduce((acc, term, i) => {
      if (acc.failed) { return { ...emptyQuery } }

      const matchedAssignees = assignees.filter(a => (
        isMatchingString(term, a.fullNameWithTitle) ||
        isMatchingString(term, a.username)
      ))

      const matchedTags = tags.filter(t => (
        isMatchingString(term, t.tag) ||
        isMatchingStrings(term, t.synonyms)
      ))

      const isTermMatched =
        matchedAssignees.length > 0 ||
        matchedTags.length > 0

      if (!isTermMatched) {
        return { failed: true }
      }

      const wanted =
        (
          acc.wanted === 'assignee' ||
          (matchedAssignees.length >= 1 && matchedTags.length === 0) // Require term to match only assignee
        )
        ? 'assignee'
        : (matchedTags.length >= 1)
        ? 'tag'
        : null

      return {
        wanted,
        assignees: uniq([...acc.assignees, ...matchedAssignees]),
        tags: uniq([...acc.tags, ...matchedTags])
      }
    }, emptyQuery)

  // Keep only availabilities that match all fields of parsedQuery
  const filtered = (parsedQuery.wanted === 'assignee')
    ? parsedQuery.assignees
      .filter(a => availabilities[a._id] && availabilities[a._id].length >= 1)
      .map(a => ({
        key: a._id,
        assignee: a,
        availabilities:
          highlightAndCollapse(
            (availabilities[a._id] || []).filter(a =>
              (parsedQuery.tags && parsedQuery.tags.length >= 1)
              ? parsedQuery.tags.some(t => a.tags.map(at => at._id).includes(t._id))
              : true
            ), {
              parsedQuery,
              hoverAvailability,
              calendars
            })
      })).filter(a => a.availabilities.length >= 1)
    : (parsedQuery.wanted === 'tag')
    ? parsedQuery.tags.map(t => ({
      key: t._id,
      tag: t,
      assignees: map(availabilities, (assigneeAvailabilities, assigneeId) => {
        return {
          key: assigneeId,
          assignee: assignees.find(a => a._id === assigneeId), // Weird, sometimes undefined
          availabilities: highlightAndCollapse(
            assigneeAvailabilities.filter(a =>
              a.tags.map(at => at._id).includes(t._id)
            ), {
              parsedQuery,
              hoverAvailability,
              calendars
            })
        }
      }).filter(a => a.assignee && a.availabilities.length >= 1)
    }))
    : []

  return { results: filtered, parsedQuery }
}

const isMatchingString = (term, haystack) =>
  haystack
    .toLowerCase()
    .split(/\s|-|\(|\)|\/|\./)
    .map(t => t && t.trim())
    .filter(t => t && t.length >= 1)
    .some(token => token.indexOf(term) === 0)

const isMatchingStrings = (term, haystack = []) =>
  haystack.some(hay => isMatchingString(term, hay))

const highlightAndCollapse = (availabilities, { parsedQuery, hoverAvailability, calendars }) =>
  availabilities
    .map(highlightMatchedTags({ parsedQuery, hoverAvailability, calendars }))
    .reduce(collapseConsecutive, {})

const highlightMatchedTags = ({ parsedQuery, hoverAvailability = {}, calendars }) => {
  const queryTags = parsedQuery.tags.map(t => t._id)

  return availability => {
    // const calendar = calendars.find(c => c._id === availability.calendarId)

    return {
      ...availability,
      // calendar,
      isHovering: hoverAvailability._id === availability._id,
      matchedTags:
        (queryTags.length >= 1)
        ? availability.tags.filter(t => queryTags.includes(t._id))
        : availability.tags
    }
  }
}

const collapseConsecutive = (
  { result = [], wip, prevKey = '' },
  currAva,
  i,
  allAvas
) => {
  const isLast = i === (allAvas.length - 1)
  const currKey = currAva.matchedTags && currAva.matchedTags.map(t => t.tagId).join(',') || i
  const shouldCollapse = prevKey === currKey

  if (shouldCollapse && wip) {
    wip = {
      ...wip,
      collapsedAvailabilities: [
        ...(wip.collapsedAvailabilities || []),
        currAva
      ]
    }
  } else {
    if (wip) {
      result = [...result, wip]
    }
    wip = {
      ...currAva,
      collapsedAvailabilities: [
        currAva
      ]
    }
  }

  if (isLast) {
    return wip ? [...result, wip] : result
  } else {
    return {
      prevKey: currKey,
      result,
      wip
    }
  }
}
