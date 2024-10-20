import React from "react";
import {
  Input,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import DataService from "DataService";
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import axios from "axios";

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
    const [selectedLocation, setSelectedLocation] = React.useState({lat: 0, lng: 0});
    const { isLoaded } = useJsApiLoader({
      id: 'google-map-script',
      googleMapsApiKey: 'YOUR_API_KEY',
    })
  
    const validateEmail = (email: string) => {
      return email === "" ? true : email.match(
        /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    };
  
    const validateIP = (ip: string) => {
      return ip === "" ? true : ip.match(
        /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
      );
    };

    const onMapClick = (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if(lat === undefined || lng === undefined) return;
      setSelectedLocation({ lat, lng });
      estimateIp(lat, lng); // Call the function to estimate IP
    };

    const estimateIp = async (lat: number, lng: number) => {
      try {
        const response = await axios.get(
          `https://ipinfo.io/${lat},${lng}/json?token=YOUR_IPINFO_TOKEN`
        );
        if(response.data.ip){
          setForm({ ...form, ip: response.data.ip });
        }else{
          setErr('Failed to estimate IP');
        }
      } catch (error) {
        console.error(error);
        setErr('Failed to estimate IP');
      }
    };
  
    return (
      <>
        <ModalHeader className="flex flex-col gap-1">
          {view === "whitelisted" ? "Add new IP address" : "Add new Blacklisted IP address"}
        </ModalHeader>
        <ModalBody className="flex">
          <div className="bg-slate-100 w-[20vw] h-full">
            {
              isLoaded ?
                <GoogleMap
                  mapContainerStyle={{width: "20vw", height: "100%"}}
                  center={{ lat: 0, lng: 0 }}
                  zoom={10}
                  onClick={onMapClick}
                >
                  {selectedLocation && <Marker position={selectedLocation} />}
                </GoogleMap>
                :
                <></>
            }
          </div>
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