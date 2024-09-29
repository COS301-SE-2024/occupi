import React, { useState, useEffect } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Avatar,
} from "@nextui-org/react";
import { SettingsIcon, Faq, Bell } from "@assets/index";
import { useNavigate } from "react-router-dom";
import { useUser } from "userStore";
import AuthService from "AuthService";
import {
  FeedBackModal,
  OccupiLoader,
  NotificationModal,
} from "@components/index";
import NotificationService from "NotificationsService";

interface ProfileDropdownProps {
  isMinimized: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isMinimized }) => {
  const navigate = useNavigate();
  const { userDetails, setUserDetails } = useUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isNotificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  function navigateTo(path: string) {
    navigate(path);
  }

  const handleLogout = () => {
    setModalOpen(true);
  };

  const confirmLogout = async () => {
    setModalOpen(false);
    setLoading(true);
    try {
      await AuthService.logout();
      setUserDetails(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelLogout = () => {
    setModalOpen(false);
  };

  const handleOpenNotifications = () => {
    setNotificationsModalOpen(true);
  };

  const handleCloseNotifications = () => {
    setNotificationsModalOpen(false);
  };

  useEffect(() => {
    // get initial notification count
    NotificationService.getNotificationsCount().then((res) => {
      setUnreadCount(res);
    });
    // get notification count every 2 minutes or so
    const interval = setInterval(async() => {
      const res = await NotificationService.getNotificationsCount();
      setUnreadCount(res);
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Dropdown placement="top-end">
        <DropdownTrigger>
          <div style={{ position: "relative", display: "flex" }}>
            <Badge content={unreadCount} shape="circle" color="danger" >
              <Avatar
                as="button"
                radius="full"
                size="md"
                src="https://dev.occupi.tech/api/download-profile-image?quality=low"
              />
            </Badge>
            <div className="ml-[10px]">
              <p className="font-bold text-text_col">{isMinimized ? '' : userDetails?.name === "" ? "No name set" : userDetails?.name}</p>
              <p className="font-thin text-text_col">{isMinimized ? '' : userDetails?.employeeid === "" ? "No id assigned" : userDetails?.employeeid}</p>
            </div>
          </div>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="User Actions"
          variant="flat"
          className={isMinimized ? "ml-2" : ""}>
          <DropdownItem key="profile" className="h-14 gap-2">
            <p className="font-bold text-text_col">Signed in as</p>
            <p className="font-bold text-text_col">{userDetails?.email}</p>
          </DropdownItem>
          <DropdownItem
            key="notifications"
            shortcut="⌘N"
            startContent={
              <div style={{ display: "flex", alignItems: "center" }}>
                <Badge content={unreadCount} shape="circle" color="danger">
                    <Bell/>
                </Badge>
              </div>
            }
            onClick={handleOpenNotifications}>
            Notifications
          </DropdownItem>
          <DropdownItem
            key="settings"
            shortcut="⌘S"
            startContent={<SettingsIcon />}
            onClick={() => navigateTo("/settings")}>
            Settings
          </DropdownItem>
          <DropdownItem
            key="faq"
            shortcut="⌘H"
            startContent={<Faq />}
            onClick={() => navigateTo("/faq")}>
            Help/FAQ
          </DropdownItem>
          <DropdownItem
            data-testid="logout"
            key="logout"
            color="danger"
            onClick={handleLogout}>
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

      {isLoading && <OccupiLoader message="Logging you out..." />}

      <NotificationModal
        title="Notifications"
        isOpen={isNotificationsModalOpen}
        onClose={handleCloseNotifications}
      />
    </>
  );
};

export default ProfileDropdown;
