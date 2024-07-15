// ProfileDropdown.tsx
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User } from "@nextui-org/react";
import { Logout, Bell, SettingsIcon, Faq } from "@assets/index";
import { useNavigate } from "react-router-dom";
import {useUser} from "UserContext";
import AuthService from "AuthService";

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { userDetails, setUserDetails } = useUser();

  function navigateTo(path: string) {
    navigate(path);
  }
const handleLogout = async () => {




    try {
      await AuthService.logout();
      setUserDetails(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
}
return (
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
                <p className="font-bold text-text_col">{userDetails?.email}</p>
                <p className="text-text_col">Email: {userDetails?.email}</p>
            </DropdownItem>
            <DropdownItem key="/notifications" shortcut="⌘N" startContent={<Bell />}>Notifications</DropdownItem>
            <DropdownItem key="/settings" shortcut="⌘S" startContent={<SettingsIcon />}>Settings</DropdownItem>
            <DropdownItem key="/faq" shortcut="⌘H" startContent={<Faq />}>Help/FAQ</DropdownItem>
            <DropdownItem key="/logout" color="danger"  onClick={handleLogout}>Logout</DropdownItem>
        </DropdownMenu>
    </Dropdown>
);
}

export default ProfileDropdown;
