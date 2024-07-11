import React, { useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User } from "@nextui-org/react";
import { Logout, Bell, SettingsIcon, Faq } from "@assets/index";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

type TopNavProps = {
  mainComponent?: JSX.Element;
  searchQuery: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TopNav = (props: TopNavProps) => {
  const navigate = useNavigate();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  function navigateTo(path: string) {
    navigate(path);
  }

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
          placeholder="ctrl/cmd-k to search"
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

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <User
              as="button"
              avatarProps={{
                isBordered: true,
                src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
              }}
              className="transition-transform"
              description="occupi-admin"
              name="Tinashe Austin"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="flat" onAction={(key) => navigateTo(key.toString())}>
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-bold text-text_col">Signed in as</p>
              <p className="font-bold text-text_col">@tinasheutstin</p>
            </DropdownItem>
            <DropdownItem key="/notifications" shortcut="⌘N" startContent={<Bell />}>Notifications</DropdownItem>
            <DropdownItem key="/settings" shortcut="⌘S" startContent={<SettingsIcon />}>Settings</DropdownItem>
            <DropdownItem key="/faq" shortcut="⌘H" startContent={<Faq />}>Help/FAQ</DropdownItem>
            <DropdownItem key="/logout" color="danger" startContent={<Logout />}>Logout</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  )
}

export default TopNav;