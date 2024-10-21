import React from "react";
import {
  Button,
  User,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import DataService from "DataService";

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

const UnblockIPModal = ({
    selectedUser,
    onClose,
  }: {
    selectedUser: User | null;
    onClose: () => void;
  }) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [err, setErr] = React.useState<string | null>(null);
  
    return (
      <>
        <ModalHeader className="flex flex-col gap-1">
          Add new IP address
        </ModalHeader>
        <ModalBody>
          <h3>Are you sure you want to allow this IP address?</h3>
          <h4>This will allow {selectedUser?.email} to use <ul>{selectedUser?.blackListedIP}</ul> to login</h4>
          <h4>They will recieve an email notifying them of this change</h4>
          {err && <p className="text-red-500">{err}</p>}
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
              DataService.addIP(selectedUser?.blackListedIP ?? "", selectedUser?.email ?? "").then(() => {
                setIsLoading(false);
                onClose();
              }).catch((err) => {
                setErr(err.message);
                setIsLoading(false);
              });
            }}
          >
            Allow IP
          </Button>
        </ModalFooter>
      </>
    );
  };

  export default UnblockIPModal;