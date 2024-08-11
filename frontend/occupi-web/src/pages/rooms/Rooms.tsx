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
} from "@nextui-org/react";
import axios from "axios";
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
import {
  AddRoomModal,
  EditRoomModal, TopNav
} from "@components/index";

interface Room {
  description: string;
  floorNo: string;
  maxOccupancy: number;
  minOccupancy: number;
  roomId: string;
  roomName: string;
  roomNo: string;
  imageUrl?: string;
  isDisabled: boolean;
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
  const [, setEditingRoom] = useState<Room | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [filterCriteria, setFilterCriteria] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [rooms, filterCriteria]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get<ApiResponse>(
        "/api/view-rooms?filter={}"
      );
      setRooms(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setLoading(false);
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

  // const uploadImage = async () => {
  //   if (!imageFile || !selectedRoom) return;

  //   const formData = new FormData();
  //   formData.append("image", imageFile);
  //   formData.append("roomId", selectedRoom.roomId);

  //   try {
  //     await axios.post("/api/upload-room-image", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //     setIsUploadModalOpen(false);
  //     setSelectedRoom(null);
  //     setEditingRoom(null);
  //     setImageFile(null);
  //     fetchRooms();
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //   }
  // };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  const handleDisable = async (room: Room) => {
    try {
      // Make an API call to disable the room
      // await axios.post(`/api/disable-room/${room.roomId}`);

      // Update the state
      // const updatedRoom = { ...room, isDisabled: !room.isDisabled };

      setRooms(
        rooms.map((r) =>
          r.roomId === room.roomId ? { ...r, isDisabled: true } : r
        )
      );
      setFilteredRooms(
        filteredRooms.map((r) =>
          r.roomId === room.roomId ? { ...r, isDisabled: true } : r
        )
      );
    } catch (error) {
      console.error("Error disabling room:", error);
    }
  };

  const handleSaveRoom = async (updatedRoom: Room) => {
    try {
      // Make an API call to update the room
      await axios.put(`/api/update-room/${updatedRoom.roomId}`, updatedRoom);
      // Update the rooms state
      setRooms(
        rooms.map((r) => (r.roomId === updatedRoom.roomId ? updatedRoom : r))
      );
      setFilteredRooms(
        filteredRooms.map((r) =>
          r.roomId === updatedRoom.roomId ? updatedRoom : r
        )
      );
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  const handleAddRoom = async (newRoom: Room) => {
    try {
      const response = await axios.put("/api/add-room", newRoom);
      if (response.data.status === 200) {
        setRooms([...rooms, newRoom]);
        setFilteredRooms([...filteredRooms, newRoom]);
        setIsAddRoomModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  const uploadImage2 = async () => {
    if (!imageFile || !selectedRoom) return;

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("roomId", selectedRoom.roomId);

    try {
      const response = await axios.post("/api/upload-room-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === 200) {
        // Update the room's imageUrl in the state
        const updatedRoom = {
          ...selectedRoom,
          imageUrl: response.data.data.id,
        };
        setRooms(
          rooms.map((r) => (r.roomId === selectedRoom.roomId ? updatedRoom : r))
        );
        setFilteredRooms(
          filteredRooms.map((r) =>
            r.roomId === selectedRoom.roomId ? updatedRoom : r
          )
        );
        setIsUploadModalOpen(false);
        setSelectedRoom(null);
        setImageFile(null);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="w-full overflow-auto">
      <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            Rooms
            <span className="block text-sm opacity-65  text-text_col_secondary_alt ">
              Update And Edit Available rooms in the Building{" "}
            </span>
          </div>
        }
        searchQuery={""}
        onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
          console.log(e.target.value);
          // Weird linting fix
          throw new Error("Function not implemented.");
        }}
      />

      <div className="flex items-center justify-between mb-4">
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
            <DropdownItem onPress={() => setFilterCriteria("all")}>
              All
            </DropdownItem>
            <DropdownItem onPress={() => setFilterCriteria("1")}>
              Floor 1
            </DropdownItem>
            <DropdownItem onPress={() => setFilterCriteria("2")}>
              Floor 2
            </DropdownItem>
            <DropdownItem onPress={() => setFilterCriteria("3")}>
              Floor 3
            </DropdownItem>
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
              <Skeleton key={index} className=" h-48 bg-secondary rounded-lg" />
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
                      {room.imageUrl ? (
                        <Image
                          src={room.imageUrl}
                          alt={room.roomName}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                          <span className="text-gray-400">
                            No image available
                          </span>
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
                      <h4 className="text-text_col text-xl font-bold mb-2">
                        {room.roomName}
                      </h4>
                      <p className="text-text_col mb-2 flex-grow">
                        {room.description}
                      </p>
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
                          disabled={room.isDisabled}
                        >
                          <FaTrashAlt className="mr-2" />
                          {room.isDisabled ? "Enable Room" : "Disable"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
      </motion.div>

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedRoom(null);
          setEditingRoom(null);
        }}
        motionProps={{
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
        }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-sm"
      >
        <ModalHeader>
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
          <Button color="primary" onPress={uploadImage2}>
            Upload Image
          </Button>
        </ModalFooter>
      </Modal>

      <EditRoomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveRoom}
        room={selectedRoom}
      />

      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        onSave={handleAddRoom}
      />
    </div>
  );
};

export default Rooms;
