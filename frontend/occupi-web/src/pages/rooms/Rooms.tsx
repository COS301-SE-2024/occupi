import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Modal,
  Image,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
  Chip,
  ModalContent,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import {
  FaRegBuilding,
  FaRegUser,
  FaRegComments,
  FaFilter,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaUpload,
} from "react-icons/fa";
import { AddRoomModal, FeedBackModal, TopNav } from "@components/index";
import { uploadRoomImage } from 'Api';
import axios from "axios";

interface Room {
  description: string;
  floorNo: string;
  maxOccupancy: number;
  minOccupancy: number;
  roomId: string;
  roomName: string;
  roomNo: string;
  roomImage?: {
    uuid: string;
    thumbnailRes: string;
    lowRes: string;
    midRes: string;
    highRes: string;
  };
  isDisabled: boolean;
  resources: string[];
}

interface ApiResponse {
  data: Room[];
  message: string;
  meta: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
  status: number;
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [filterCriteria, setFilterCriteria] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [, setIsEditModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [roomToDisable, setRoomToDisable] = useState<Room | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [rooms, filterCriteria]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/view-rooms?filter={}");
      setRooms(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setLoading(false);
      setErrorMessage("Failed to fetch rooms. Please try again later.");
    }
  };

  const applyFilter = () => {
    if (filterCriteria === "all") {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter((room) => room.floorNo === filterCriteria);
      setFilteredRooms(filtered);
    }
  };

  const uploadImage = async () => {
    if (!imageFile || !selectedRoom) return;

    try {
      const response = await uploadRoomImage(imageFile, selectedRoom.roomId);
      if (response.status === 200) {
        const updatedRoom = {
          ...selectedRoom,
          imageUrl: response.data.id,
        };
        setRooms(rooms.map(r => r.roomId === selectedRoom.roomId ? updatedRoom : r));
        setFilteredRooms(filteredRooms.map(r => r.roomId === selectedRoom.roomId ? updatedRoom : r));
        setIsUploadModalOpen(false);
        setSelectedRoom(null);
        setImageFile(null);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage("Failed to upload image. Please try again.");
    }
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  const handleDisable = (room: Room) => {
    setRoomToDisable(room);
    setIsFeedbackModalOpen(true);
  };

  const confirmDisable = async () => {
    if (!roomToDisable) return;

    try {
      // Make an API call to toggle the room's disabled state
      // await axios.post(`/api/toggle-room-state/${roomToDisable.roomId}`);

      // Update the state
      const updatedRoom = {
        ...roomToDisable,
        isDisabled: !roomToDisable.isDisabled,
      };

      setRooms(rooms.map((r) => (r.roomId === roomToDisable.roomId ? updatedRoom : r)));
      setFilteredRooms(filteredRooms.map((r) => (r.roomId === roomToDisable.roomId ? updatedRoom : r)));

      setIsFeedbackModalOpen(false);
      setRoomToDisable(null);
    } catch (error) {
      console.error("Error toggling room state:", error);
      setErrorMessage("Failed to update room state. Please try again.");
    }
  };

  // const handleSaveRoom = async (updatedRoom: Room) => {
  //   try {
  //     await axios.put(`/api/update-room/${updatedRoom.roomId}`, updatedRoom);
  //     setRooms(rooms.map((r) => (r.roomId === updatedRoom.roomId ? updatedRoom : r)));
  //     setFilteredRooms(filteredRooms.map((r) => (r.roomId === updatedRoom.roomId ? updatedRoom : r)));
  //   } catch (error) {
  //     console.error("Error updating room:", error);
  //     setErrorMessage("Failed to update room. Please try again.");
  //   }
  // };

  const handleAddRoom = async (newRoom: Omit<Room, 'roomId' | 'imageUrl' | 'isDisabled'>) => {
    try {
      // Generate a unique roomId
      const roomId = `RM${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const roomToAdd = {
        ...newRoom,
        roomId,
        resources: [], // Add default resources or get from form
        isDisabled: false
      };

      console.log("Sending room data:", roomToAdd); // Log the data being sent

      const response = await axios.put("/api/add-room", roomToAdd);
      
      console.log("Server response:", response.data); // Log the server's response

      if (response.data.status === 200) {
        setRooms([...rooms, roomToAdd]);
        setFilteredRooms([...filteredRooms, roomToAdd]);
        setIsAddRoomModalOpen(false);
      } else {
        console.error("Error adding room:", response.data.message);
        setErrorMessage(`Failed to add room: ${response.data.message}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data);
        console.error("Request config:", error.config);
        setErrorMessage(`Error adding room: ${error.response?.data?.message || error.message}`);
      } else {
        console.error("Error adding room:", error);
        setErrorMessage("An unexpected error occurred while adding the room.");
      }
    }
  };

  return (
    <div className="w-full overflow-auto">
      <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            Rooms
            <span className="block text-sm opacity-65 text-text_col_secondary_alt">
              Update And Edit Available rooms in the Building
            </span>
          </div>
        }
        searchQuery={""}
        onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
          console.log(e.target.value);
        }}
      />

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onClick={() => setErrorMessage("")}>
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 mt-2">
        <h2 className="text-text_col text-2xl font-bold"></h2>
        <Button
          className="text-text_col_alt font-semibold bg-secondary_alt"
          onPress={() => setIsAddRoomModalOpen(true)}
        >
          <FaPlus className="mr-2" />
          Add New Room
        </Button>
        <Dropdown>
          <DropdownTrigger>
            <Button className="text-text_col_alt font-semibold bg-secondary_alt">
              <FaFilter className="mr-2 " />
              Filter by Floor
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem onPress={() => setFilterCriteria("all")}>All</DropdownItem>
            <DropdownItem onPress={() => setFilterCriteria("1")}>Floor 1</DropdownItem>
            <DropdownItem onPress={() => setFilterCriteria("2")}>Floor 2</DropdownItem>
            <DropdownItem onPress={() => setFilterCriteria("3")}>Floor 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-48 bg-secondary rounded-lg" />
            ))
          : filteredRooms.map((room) => (
              <motion.div
                key={room.roomId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mb-4 relative"
              >
                <Card className="w-full bg-secondary mx-4 relative">
                  {room.isDisabled && (
                    <Chip color="danger" className="absolute top-2 right-2">
                      Disabled
                    </Chip>
                  )}
                  <div className="p-4 flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4">
                      {room.roomImage ? (
                        <Image

                          src={room.roomImage.midRes}

                          alt={room.roomName}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                          <span className="text-gray-400">No image available</span>
                        </div>
                      )}
                      <Button
                        className="mt-2 text-text_col_alt font-semibold bg-secondary_alt"
                        onPress={() => {
                          setSelectedRoom(room);
                          setIsUploadModalOpen(true);
                        }}
                      >
                        <FaUpload className="mr-2" />
                        Upload Image
                      </Button>
                    </div>
                    <div className="w-full md:w-2/3 flex flex-col">
                      <h4 className="text-text_col text-xl font-bold mb-2">{room.roomName}</h4>
                      <p className="text-text_col mb-2 flex-grow">{room.description}</p>
                      <div className="flex items-center mb-1">
                        <FaRegBuilding className="mr-2" />
                        <p className="text-text_col">Floor: {room.floorNo}</p>
                      </div>
                      <div className="flex items-center mb-1">
                        <FaRegUser className="mr-2" />
                        <p className="text-text_col">
                          Capacity: {room.minOccupancy} - {room.maxOccupancy}
                        </p>
                      </div>
                      <div className="flex items-center mb-4">
                        <FaRegComments className="mr-2" />
                        <p className="text-text_col">Room No: {room.roomNo}</p>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button
                          className="text-text_col_alt font-semibold bg-secondary_alt mr-2"
                          onPress={() => handleEdit(room)}
                        >
                          <FaEdit className="mr-2" />
                          Edit
                        </Button>
                        <Button
                          className="text-text_col_alt font-semibold bg-secondary_alt"
                          onPress={() => handleDisable(room)}
                        >
                          <FaTrashAlt className="mr-2" />
                          {room.isDisabled ? "Enable" : "Disable"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
      </motion.div>

      <Modal
        backdrop="blur"
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedRoom(null);
          setImageFile(null);
        }}
        motionProps={{
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
        }}
      >
        <ModalContent>
          <ModalHeader className="text-text_col flex flex-col gap-1">
            <h3 className="text-text_col text-lg font-bold">Upload Room Image</h3>
          </ModalHeader>
          <ModalBody>
            <Input
              type="file"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setImageFile(files[0]);
                }
              }}
              accept="image/*"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={uploadImage}>
              Upload Image
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* <EditRoomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveRoom}
        room={selectedRoom}
      /> */}

      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        onSave={handleAddRoom}
      />

      <FeedBackModal
        title="Confirm Action"
        message={`Are you sure you want to ${roomToDisable?.isDisabled ? 'enable' : 'disable'} this room?`}
        closeButtonLabel="Cancel"
        actionButtonLabel="Confirm"
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setRoomToDisable(null);
        }}
        onAction={confirmDisable}
      />
    </div>
  );
};

export default Rooms;