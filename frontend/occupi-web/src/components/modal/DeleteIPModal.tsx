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

const DeleteIPModal = ({
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
        Remove IP address {selectedUser?.ipAddress}
      </ModalHeader>
      <ModalBody>
        <h3>Are you sure you want to remove this IP address?</h3>
        <h4>This will prevent {selectedUser?.email} from logging in from: </h4>
        <ul>{selectedUser?.city}</ul>
        <ul>{selectedUser?.region}</ul>
        <ul>{selectedUser?.country}</ul>
        <h4>They will recieve an email notifying them of this change</h4>
        {err && <p className="text-red-500">{err}</p>}
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
            }).catch((err) => {
              setErr(err.message);
              setIsLoading(false);
            });
          }}
        >
          Remove IP
        </Button>
      </ModalFooter>
    </>
  );
}

export default DeleteIPModal