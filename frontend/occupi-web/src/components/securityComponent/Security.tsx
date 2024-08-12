import {
    Button, Input, Switch
} from "@nextui-org/react";
import { motion } from "framer-motion";

const Security = () => {
  
  return (
    <motion.div
      className="w-full p-4 rounded-lg overflow-y-auto overflow-x-hidden"
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.2, ease: "linear" }}
    >
      <div className="w-full flex flex-col gap-3 justify-between">
        <div className="flex justify-between items-center bg-secondary p-4 rounded-lg">
          <p className="text-text_col">
            Use Biometrics/Platform Authenticator to Enter Application
          </p>
          <Switch color="success" />
        </div>
        <div className="flex justify-between items-center bg-secondary p-4 rounded-lg">
          <p className="text-text_col">
            Use 2FA To login(You will be asked to enter an OTP each time you
            Login){" "}
          </p>
          <Switch color="success" />
        </div>
        <div className="flex justify-between items-center bg-secondary p-4 rounded-lg">
          <p className="text-text_col">Force Logout on App Close</p>
          <Switch color="success" />
        </div>
      </div>

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <div className="w-full h-9 text-text_col text-base font-semibold leading-none">
        Change Password
      </div>

      <div className="w-full flex flex-col justify-between  gap-4">
        <Input
          type="text"
          label="Current Password"
          labelPlacement="outside"
          placeholder="Enter Your Password"
          description="Enter The Password You Are Currently Using"
        />

        <Input
          type="text"
          label="New Password"
          labelPlacement="outside"
          placeholder="Enter Your New Password"
          description="Enter The Password You want to use now"
        />

        <Input
          type="text"
          label="Confirm Password"
          labelPlacement="outside"
          placeholder="Confirm Your New Password"
          description="Confirm The Password You want to use now"
        />
      </div>


    

      


      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      

     



      <Button className="bg-red_salmon">Save changes</Button>
    </motion.div>
  );
};

export default Security;
