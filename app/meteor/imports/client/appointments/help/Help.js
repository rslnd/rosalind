import React from 'react'
import { Search } from './Search'
import { Drawer } from './Drawer'

export const Help = ({
  isOpen,
  setOpen,
  searchValue,
  handleSearchValueChange,
  constraints
}) =>
  <Drawer isOpen={isOpen} setOpen={setOpen}>
    <Search value={searchValue} onChange={handleSearchValueChange} />
    {
      constraints.map(c =>
        <div key={c._id}>
          <Constraint constraint={c} /><br />
        </div>
      )
    }
  </Drawer>

const Constraint = ({ constraint }) => JSON.stringify(constraint)
