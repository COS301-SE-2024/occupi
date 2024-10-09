import React, { useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  User,
  Selection,
  Code,
  Spinner,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { SearchIcon, DeleteIcon, Reload } from "@assets/index";
import DataService from "DataService";
import { motion } from "framer-motion";
import { TopNav } from "@components/index";

type User = {
  email: string;
  name: string;
  city: string;
  region: string;
  country: string;
  location: string;
  ipAddress: string;
  blackListedIP: string;
};

const WHITELISTEDHEAD = [
  {
    key: "name",
    label: "NAME",
  },
  {
    key: "location",
    label: "LOCATION",
  },
  {
    key: "IP address",
    label: "IP ADDRESS",
  },
  {
    key: "actions",
    label: "ACTIONS",
  },
]

const BLACKLISTEDHEAD = [
  {
    key: "name",
    label: "NAME",
  },
  {
    key: "BlackListed IP address",
    label: "IP ADDRESS",
  },
  {
    key: "actions",
    label: "ACTIONS",
  },
]

const DeleteIPModal = ({
  selectedUser,
  onClose,
}: {
  selectedUser: User | null;
  onClose: () => void;
}) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        Remove IP address {selectedUser?.ipAddress}
      </ModalHeader>
      <ModalBody>
        <h3>Are you sure you want to remove this IP address?</h3>
        <h4>This will prevent {selectedUser?.email} from logging in from: </h4>
        <ul>{selectedUser?.city}</ul>
        <ul>{selectedUser?.region}</ul>
        <ul>{selectedUser?.country}</ul>
        <h4>They will recieve an email notifying them of this change</h4>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" variant="light" onPress={onClose}>
          Close
        </Button>
        <Button
          color="danger"
          isLoading={isLoading}
          onPress={() => {
            setIsLoading(true);
            DataService.removeIP(
              selectedUser?.email ?? "",
              selectedUser?.ipAddress ?? ""
            ).then(() => {
              setIsLoading(false);
              onClose();
            });
          }}
        >
          Remove IP
        </Button>
      </ModalFooter>
    </>
  );
};

const AddIPModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = React.useState<{
    email: string;
    ip: string;
  }>({ email: "", ip: "" });

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        Add new IP address
      </ModalHeader>
      <ModalBody>
        <Input
          autoFocus
          label="Email"
          placeholder="Enter the users email"
          variant="bordered"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="text"
          placeholder="Enter the ip address"
          variant="bordered"
          onChange={(e) => setForm({ ...form, ip: e.target.value })}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" variant="light" onPress={onClose}>
          Close
        </Button>
        <Button
          color="default"
          isLoading={isLoading}
          onPress={() => {
            setIsLoading(true);
            DataService.addIP(form.ip, form.email).then(() => {
              setIsLoading(false);
              onClose();
            });
          }}
        >
          Add IP
        </Button>
      </ModalFooter>
    </>
  );
};

const UnblockIPModal = ({
  selectedUser,
  onClose,
}: {
  selectedUser: User | null;
  onClose: () => void;
}) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        Add new IP address
      </ModalHeader>
      <ModalBody>
        <h3>Are you sure you want to allow this IP address?</h3>
        <h4>This will allow {selectedUser?.email} to use to login: </h4>
        <ul>{selectedUser?.blackListedIP}</ul>
        <h4>They will recieve an email notifying them of this change</h4>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" variant="light" onPress={onClose}>
          Close
        </Button>
        <Button
          color="default"
          isLoading={isLoading}
          onPress={() => {
            setIsLoading(true);
            DataService.addIP(selectedUser?.blackListedIP ?? "", selectedUser?.blackListedIP ?? "").then(() => {
              setIsLoading(false);
              onClose();
            });
          }}
        >
          Allow IP
        </Button>
      </ModalFooter>
    </>
  );
};

const LocationPage = () => {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set([])
  );
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [openModal, setOpenModal] = React.useState<"delete" | "add" | "allowip" | null>(
    null
  );
  const [isValidEmail, setIsValidEmail] = React.useState<boolean>(true);
  const view = React.useRef<"whitelisted" | "blacklisted">("whitelisted");

  const renderCell = React.useCallback((user: User, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof User];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{
              radius: "lg",
              src: `https://dev.occupi.tech/api/download-profile-image?email=${user.email}&quality=low`,
            }}
            description={user.email}
            name={user.name === "" ? "No name" : user.name}
          >
            {user.email}
          </User>
        );
      case "location":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize text-default-700">
              {user.country}
            </p>
            <p className="text-bold text-tiny capitalize text-default-400">
              {user.city},{user.region}
            </p>
          </div>
        );
      case "IP address":
        return (
          <Code>
            {user.ipAddress === "" ? "No ip address available" : user.ipAddress}
          </Code>
        );
      case "BlackListed IP address":
        return (
          <Code>
            {user.blackListedIP === "" ? "No ip address available" : user.blackListedIP}
          </Code>
        );
      case "whitelisted actions":
        return (
          <Button
            color="danger"
            isIconOnly
            onClick={() => {
              onOpen();
              setSelectedUser(user);
              setOpenModal("delete");
            }}
          >
            <DeleteIcon />
          </Button>
        );
      case "blacklisted actions":
        return (
          <Button
            color="default"
            isIconOnly
            onClick={() => {
              onOpen();
              setSelectedUser(user);
              setOpenModal("allowip");
            }}
          >
            <Reload />
          </Button>
        );
      default:
        return cellValue;
    }
  }, []);

  const validateEmail = (email: string) => {
    return email.match(
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  const onSearchChange = React.useCallback(async (value?: string) => {
    // validate that value is valid email otherwise return
    if (!validateEmail(value ?? "") && value !== "") {
      setIsValidEmail(false);
      setFilterValue(value ?? "");
      return;
    }
    if (value === "") {
      setIsValidEmail(true);
      setFilterValue("");
    }
    if (value) {
      setIsLoading(true);
      setIsValidEmail(true);
      setFilterValue(value);
      let res;
      if (view.current === "whitelisted"){
        res = await DataService.fetchUserLocationsWithOptions(
          1,
          "asc",
          value
        );
      } else {
        res = await DataService.fetchUserBlacklistWithOptions(
          1,
          "asc",
          value
        );
      }
      if (res.data === null) {
        setUsers([]);
      } else {
        const users: User[] = res.data;
        setUsers(users);
      }
      setIsLoading(false);
    } else {
      setIsValidEmail(true);
      setFilterValue("");
    }
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    let res;
    if (view.current === "whitelisted") {
      res = await DataService.fecthUserLocations();
    } else {
      res = await DataService.fetchUserBlacklist();
    }
    const users: User[] = res?.data;
    setUsers(users);
    setIsLoading(false);
  }

  const onClear = React.useCallback(async() => {
    setIsValidEmail(true);
    setFilterValue("");
    await fetchAll();
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by email..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            errorMessage="Please enter a valid email"
            isInvalid={!isValidEmail}
          />
          <div className="flex gap-3">
            <Button
              color="default"
              onClick={() => {
                onOpen();
                setOpenModal("add");
              }}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Button
              color={view.current === "whitelisted" ? "primary" : "default"}
              variant={view.current === "whitelisted" ? "flat" : "solid"}
              onClick={async() => {view.current = "whitelisted"; await fetchAll();}}
            >
              Whitelisted IP's
            </Button>
            <Button
              color={view.current === "whitelisted" ? "primary" : "default"}
              variant={view.current === "blacklisted" ? "flat" : "solid"}
              onClick={async() => {view.current = "blacklisted"; await fetchAll();}}
            >
              Blacklisted IP's
            </Button>
          </div>
          <span className="text-default-400 text-small">
            Total {users.length} results
          </span>
        </div>
      </div>
    );
  }, [filterValue, onSearchChange, users.length]);

  useEffect(() => {
    const fetchUsers = async() => { await fetchAll();}

    fetchUsers();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full overflow-auto"
    >
      <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            Employees
            <span className="block text-sm opacity-65  text-text_col_secondary_alt ">
              Manage your Employees allowed Login Locations
            </span>
          </div>
        }
        searchQuery={""}
        onChange={() => {}}
      />

      <div data-testid="table" className="max-w-[95%] mx-auto mt-5">
        <Table
          isHeaderSticky
          classNames={{
            wrapper: "max-h-[65vh]",
          }}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
        >
          <TableHeader columns={view.current === "whitelisted" ? WHITELISTEDHEAD : BLACKLISTEDHEAD}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody
            isLoading={isLoading}
            loadingContent={<Spinner color="white" />}
            emptyContent={"No users found"}
          >
            {users.map((item, index) => (
              <TableRow key={item.email + "#" + index}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) =>
            openModal === "delete" ? (
              <DeleteIPModal selectedUser={selectedUser} onClose={async() => {
                onClose();
                await fetchAll();
              }} />
            ) : openModal === "add" ? (
              <AddIPModal onClose={async() => {
                onClose();
                await fetchAll();
              }} />
            ) : openModal === "allowip" ? (
              <UnblockIPModal selectedUser={selectedUser} onClose={async() => {
                onClose();
                await fetchAll();
              }} />
            ) : <></>
          }
        </ModalContent>
      </Modal>
    </motion.div>
  );
};

export default LocationPage;
