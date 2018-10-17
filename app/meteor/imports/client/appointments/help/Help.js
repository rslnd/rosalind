import React from 'react'
import { Search } from './Search'
import { Drawer } from './Drawer'
import { TagsList } from '../../tags/TagsList'

export const Help = ({
  isOpen,
  setOpen,
  searchValue,
  handleSearchValueChange,
  constraintsMatchingAssignee,
  constraintsMatchingTag
}) =>
  <Drawer isOpen={isOpen} setOpen={setOpen}>
    <div style={containerStyle}>
      <Search value={searchValue} onChange={handleSearchValueChange} />
      <div style={resultsStyle}>
        {
          constraintsMatchingAssignee.map(group =>
            <Group key={group.assignee._id} assignee={group.assignee}>
              {
                group.constraints.map(c =>
                  <Constraint key={c.key} constraint={c} />
                )
              }
            </Group>
          )
        }
        {
          constraintsMatchingTag.map(group =>
            <Group key={group.tag._id} tag={group.tag}>
              {
                group.constraints.map(c =>
                  <Constraint key={c.key} constraint={c} />
                )
              }
            </Group>
          )
        }
      </div>
    </div>
  </Drawer>

const Group = ({ assignee, tag, children }) =>
  <div>
    <h3>{
      assignee
      ? assignee.fullNameWithTitle
      : tag
      ? <TagsList tags={[tag]} />
      : '---'
    }</h3>
    {children}
  </div>

const Constraint = ({ constraint: { tags, ...rest } }) =>
  <div>
    {JSON.stringify(rest)}
    <TagsList tags={tags} tiny />
  </div>

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '100%'
}

const resultsStyle = {
  flex: 1,
  overflowY: 'scroll'
}
