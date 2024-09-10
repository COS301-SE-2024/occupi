import React, { useState, useEffect } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
  Badge,
} from "@nextui-org/react";
import { Bell, SettingsIcon, Faq } from "@assets/index";
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
  const [notifications, setNotifications] = useState<
    import("NotificationsService").Notification[]
  >([]);

  useEffect(() => {
    loadNotifications();
  }, []);


  

  const loadNotifications = async () => {
    try {
      const fetchedNotifications =
        await NotificationService.fetchNotifications();
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

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

  return (
    <>
      <Dropdown placement="top-end">
        <DropdownTrigger>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Badge content={unreadCount} color="warning">
              <User
                as="button"
                avatarProps={{
                  isBordered: true,
                  src: `https://i.pravatar.cc/150?u=${userDetails?.employeeid}`,
                  size: "md",
                }}
                className={`transition-transform ${
                  isMinimized ? "p-0" : "w-full p-2"
                }`}
                description={isMinimized ? null : "occupi-admin"}
                name={isMinimized ? null : userDetails?.name}
              />
            </Badge>
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
                <Badge
                  content={unreadCount}
                  color="warning"
                  style={{ position: "absolute", top: 0, right: 0 }}>
                  <Bell />
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
