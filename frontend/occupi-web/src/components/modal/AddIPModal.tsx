import React from "react";
import {
  Input,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import DataService from "DataService";

const AddIPModal = ({ 
  onClose,
  view
}: { 
  onClose: () => void,
  view: "whitelisted" | "blacklisted"
}) => {
  const [form, setForm] = React.useState<{
    email: string;
    ip: string;
  }>({ email: "", ip: "" });

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [err, setErr] = React.useState<string | null>(null);

  const validateEmail = (email: string) => {
    return email === "" || email.match(
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  const validateIP = (ip: string) => {
    return ip === "" || ip.match(
      /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
    );
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        {view === "whitelisted" ? "Add new IP address" : "Add new Blacklisted IP address"}
      </ModalHeader>
      <ModalBody>
        <Input
          value={form.email}
          autoFocus
          label="Email"
          placeholder="Enter the users email"
          variant="bordered"
          errorMessage="Please enter a valid email"
          isInvalid={!validateEmail(form.email)}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          value={form.ip}
          label="IP address"
          placeholder="Enter the ip address"
          variant="bordered"
          errorMessage="Please enter a valid ip address"
          isInvalid={!validateIP(form.ip)}
          onChange={(e) => setForm({ ...form, ip: e.target.value })}
        />
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
            if (view === "whitelisted"){
              DataService.addIP(form.ip, form.email).then(() => {
                setIsLoading(false);
                onClose();
              }).catch((err) => {
                setErr(err.message);
                setIsLoading(false);
              });
            } else{
              DataService.removeIP(form.ip, form.email).then(() => {
                setIsLoading(false);
                onClose();
              }).catch((err) => {
                setErr(err.message);
                setIsLoading(false);
              });
            }
          }}
        >
          {view === "whitelisted" ? "Add IP" : "Block IP"}
        </Button>
      </ModalFooter>
    </>
  );
};

export default AddIPModal;