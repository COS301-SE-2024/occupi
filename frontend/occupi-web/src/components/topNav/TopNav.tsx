import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User} from "@nextui-org/react";
import { Logout, Bell, SettingsIcon ,Faq} from "@assets/index";
import { useNavigate } from "react-router-dom";

type TopNavProps = {
    mainComponent?: JSX.Element;
    searchQuery: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
  
  
const TopNav = (props: TopNavProps) => {
  const navigate = useNavigate();

  function navigateTo(path: string) {
    navigate(path);
  }
  
    return (
        <div className="sticky top-0 z-10 overflow-hidden border-b-[2px] border-b-secondary flex items-center justify-between h-[110px] backdrop-blur-[20px] bg-primary_40">
          <div className="ml-[30px]">
            {props.mainComponent}
          </div>
  
          <input
            type="text"
            placeholder="ctrl/cmd-k to search"
            className="w-[30vw] h-[45px] rounded-[15px] bg-secondary p-[8px] mr-[30px]"
            value={props.searchQuery}
            onChange={props.onChange}
          />

          <div className="flex items-center gap-4 mr-[30px]">
                <Dropdown placement="bottom-start">
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
                      <p className="font-bold text-text_col">@tinashautstin</p>
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
  
  export default TopNav