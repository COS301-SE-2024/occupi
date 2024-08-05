// TopNav.tsx
import React, { useState } from 'react';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileDropDown } from '@components/index';

type TopNavProps = {
  mainComponent?: JSX.Element;
  searchQuery: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TopNav = (props: TopNavProps) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  return (
    <div data-testid='topnav' className="sticky top-0 z-10 overflow-visible border-b-[2px] border-b-secondary flex items-center justify-between h-[70px] md:h-[110px] backdrop-blur-[20px] bg-primary_40 px-4 md:px-8">
      <div className="hidden md:block">
        {props.mainComponent}
      </div>

      <div className="md:hidden">
        <FaBars size={24} className="text-text_col" />
      </div>

      <div className="hidden md:block relative">
        <input
          type="text"
          placeholder="ctrl-k/⌘-k to search"
          className="w-[30vw] h-[45px] rounded-[15px] bg-secondary p-[8px]"
          value={props.searchQuery}
          onChange={props.onChange}
        />
      </div>

      <AnimatePresence>
        {isSearchVisible && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-full px-4 py-2 bg-primary_40 border-b-[2px] border-b-secondary"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-[35px] rounded-[15px] bg-secondary p-[8px] pr-10"
                value={props.searchQuery}
                onChange={props.onChange}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setIsSearchVisible(false)}
              >
                <FaTimes size={20} className="text-text_col" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="md:hidden"
          onClick={() => setIsSearchVisible(!isSearchVisible)}
        >
          <FaSearch size={24} className="text-text_col" />
        </motion.button>
        <ProfileDropDown />
      </div>
    </div>
  )
}

export default TopNav;
