import React, { useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User } from "@nextui-org/react";
import { Bell, SettingsIcon, Faq } from "@assets/index";
import { useNavigate } from "react-router-dom";
import { useUser } from "userStore";
import AuthService from "AuthService";
import { FeedBackModal, OccupiLoader } from "@components/index";

interface ProfileDropdownProps {
  isMinimized: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isMinimized }) => {
  const navigate = useNavigate();
  const { userDetails, setUserDetails } = useUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false); // State for loader visibility

  function navigateTo(path: string) {
    navigate(path);
  }

  const handleLogout = () => {
    setModalOpen(true); // Show the modal when logout is clicked
  };

  const confirmLogout = async () => {
    setModalOpen(false); // Close the modal
    setLoading(true); // Show loader
    try {
      await AuthService.logout();
      setUserDetails(null);
      navigate("/");
      setModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Logout error:", error);
      setModalOpen(false); // Close the modal
    } finally {
      setLoading(false); // Hide loader
      setModalOpen(false); // Close the modal
    }
  };

  const cancelLogout = () => {
    setModalOpen(false); // Close the modal if cancelled
  };

  return (
    <>
      <Dropdown placement="top-end">
        <DropdownTrigger>
          <User
            as="button"
            avatarProps={{
              isBordered: true,
              src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
              size: "md",
            }}
            className={`transition-transform ${isMinimized ? 'p-0' : 'w-full p-2'}`}
            description={isMinimized ? null : "occupi-admin"}
            name={isMinimized ? null : "Tinashe Austin"}
          />
        </DropdownTrigger>
        <DropdownMenu
          aria-label="User Actions"
          variant="flat"
          className={isMinimized ? 'ml-2' : ''}
        >
          <DropdownItem key="profile" className="h-14 gap-2">
            <p className="font-bold text-text_col">Signed in as</p>
            <p className="font-bold text-text_col">{userDetails?.email}</p>
          </DropdownItem>
          <DropdownItem key="notifications" shortcut="⌘N" startContent={<Bell />} onClick={() => navigateTo("/notifications")}>
            Notifications
          </DropdownItem>
          <DropdownItem key="settings" shortcut="⌘S" startContent={<SettingsIcon />} onClick={() => navigateTo("/settings")}>
            Settings
          </DropdownItem>
          <DropdownItem key="faq" shortcut="⌘H" startContent={<Faq />} onClick={() => navigateTo("/faq")}>
            Help/FAQ
          </DropdownItem>
          <DropdownItem data-testid="logout" key="logout" color="danger" onClick={handleLogout}>
            Logout
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      
      <FeedBackModal
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        closeButtonLabel="Cancel"
        actionButtonLabel="Logout"
        isOpen={isModalOpen}
        onClose={cancelLogout}
        onAction={confirmLogout}
      />
      
      {isLoading && <OccupiLoader message="Logging you out..." />} {/* Display loader */}
    </>
  );
};

export default ProfileDropdown;
