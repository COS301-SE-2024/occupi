import { Upload } from "@assets/index"
import {FileUploadButton} from "@components/index"
import { Button, DatePicker, Input, Select, SelectItem, User } from "@nextui-org/react"
import { motion } from "framer-motion"
import { useState } from "react"

const ProfileView = () => {
  const [pfp, setPfp] = useState<string | ArrayBuffer | null>(null)

  function handleFile(files: File[]){
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPfp(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }
  return (
    <motion.div
      className="w-full p-4 rounded-lg overflow-y-auto overflow-x-hidden"
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.2, ease: "linear" }}
    >
      <div className="w-full flex justify-between">
      <User   
          name="Tinashe Austin"
          description="occupi-admin"
          avatarProps={{
            isBordered: true,
            src: pfp as string,
            size: "lg"
          }}
        />
        <FileUploadButton
          accept="image/jpeg, image/png, image/jpg"
          startContent={<Upload />}
          endContent={<div>Upload profile picture</div>}
          onUpload={handleFile}
         />
      </div>

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <div className="w-full h-9 text-text_col text-base font-semibold leading-none">
        Full name
      </div>

      <div className="w-full flex justify-between  gap-4">
          <Input
              type="text"
              label="First name"
              labelPlacement="outside"
              placeholder="Enter your first name"
              description="Your given name"
            />

          <Input
              type="text"
              label="Last name"
              labelPlacement="outside"
              placeholder="Enter your last name"
              description="Your family name"
            />
      </div>

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <div className="w-full h-9 text-text_col text-base font-semibold leading-none">
        Contact
      </div>

      <div className="w-full flex justify-between  gap-4">
          <Input
              type="email"
              label="Email"
              description="Your email address, note if you change this you will need to verify the new email address"
            />

          <Input
              startContent={
                <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">+27</span>
              </div>}
              type="number"
              label="Number"
              description="Your phone number"
            />
      </div>

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <div className="w-full h-9 text-text_col text-base font-semibold leading-none">
        Additional information
      </div>

      <div className="w-full flex justify-between gap-4 ">
          <Input
              isReadOnly
              type="text"
              label="Employee id"
              description="Your employee id, you cannot change this"
            />

          <Input
              type="text"
              label="pronouns"
              description="Your pronouns"
            />

          <Select
            label="Gender"
            placeholder="Select your gender"
            description="Your gender"
          >
            {["male", "female", "other"].map((gender) => (
              <SelectItem key={gender}>
                {gender}
              </SelectItem>
            ))}
          </Select>
      </div>

      <DatePicker label="Birth date" className="max-w-[284px] my-4" description="The day you were born on"/>

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <Button className="bg-red_salmon">
        Save changes
      </Button>

    </motion.div>
  )
}

export default ProfileView