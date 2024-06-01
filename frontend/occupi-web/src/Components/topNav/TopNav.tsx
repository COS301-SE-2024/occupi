import React from 'react'
import SearchBar from '../searchBarComponent/SearchBar'
import TabComponent from '../tabComponent/TabComponent'
const TopNav = () => {
  return (
    <div>
       <div className="relative w-full h-7 border-b-2 border-#EBEBEB">
        {/* GraphContainer (Right side with space) */}

        {/* TabComponent (Left of Sidebar on large screens, below on small screens) */}
        <div className="fixed left-72 top-2">
          <TabComponent />
        </div>

        {/* SearchBar (Top Right Corner) */}
        <div className="fixed top-2 right-9">
          <SearchBar />
        </div>
      </div>
    </div>
  )
}

export default TopNav
