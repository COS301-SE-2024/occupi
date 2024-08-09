import { Upload } from '@assets/index';
import { UploadButton } from '@assets/index';
import { Button, DatePicker, Input, Select, SelectItem, User } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useUserStore, useUser } from 'userStore';
import AuthService from 'AuthService';

const ProfileView = () => {
  const { userDetails, setUserDetails } = useUser();
  const [pfp, setPfp] = useState<string | ArrayBuffer | null>(null);
  const [firstName, setFirstName] = useState(userDetails?.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(userDetails?.name.split(' ')[1] || '');
  const [email, setEmail] = useState(userDetails?.email || '');
  const [number, setNumber] = useState(userDetails?.number || '');
  const [gender, setGender] = useState(userDetails?.gender || '');
  const [pronouns, setPronouns] = useState(userDetails?.pronouns || '');
  const [dateOfBirth, setDateOfBirth] = useState(userDetails?.dob ? new Date(userDetails.dob) : null);

  useEffect(() => {
    // Preload user details from the store
    setFirstName(userDetails?.name.split(' ')[0] || '');
    setLastName(userDetails?.name.split(' ')[1] || '');
    setEmail(userDetails?.email || '');
    setNumber(userDetails?.number || '');
    setGender(userDetails?.gender || '');
    setPronouns(userDetails?.pronouns || '');
    setDateOfBirth(userDetails?.dob ? new Date(userDetails.dob) : null);
  }, [userDetails]);

  const handleFile = (files: File[]) => {
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPfp(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updatedDetails = {
        email,
        name: `${firstName} ${lastName}`,
        dob: dateOfBirth?.toISOString() || '',
        gender,
        session_email: userDetails?.email || '',
        employeeid: userDetails?.employeeid || '',
        number,
        pronouns,
      };

      // Update the user details in the store
      setUserDetails(updatedDetails);

      // Call the API to update the user details
      // await AuthService.updateUserDetails(updatedDetails);
      console.log('User details updated successfully');
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  return (
    <motion.div
      className="w-full p-4 rounded-lg overflow-y-auto overflow-x-hidden"
      initial={{ x: '100vw' }}
      animate={{ x: 0 }}
      transition={{ duration: 0.2, ease: 'linear' }}
    >
      <div className="w-full flex justify-between">
        <User
          name={`${firstName} ${lastName}`}
          description="occupi-admin"
          avatarProps={{
            isBordered: true,
            src: pfp as string,
            size: 'lg',
          }}
        />
        <UploadButton
          accept="image/jpeg, image/png, image/jpg"
          startContent={<Upload />}
          endContent={<div>Upload profile picture</div>}
          onUpload={handleFile}
        />
      </div>

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <div className="w-full h-9 text-text_col text-base font-semibold leading-none">Full name</div>

      <div className="w-full flex justify-between gap-4">
        <Input
          type="text"
          label="First name"
          labelPlacement="outside"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter your first name"
          description="Your given name"
        />

        <Input
          type="text"
          label="Last name"
          labelPlacement="outside"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter your last name"
          description="Your family name"
        />
      </div>

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <div className="w-full h-9 text-text_col text-base font-semibold leading-none">Contact</div>

      <div className="w-full flex justify-between gap-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          description="Your email address, note if you change this you will need to verify the new email address"
        />

        <Input
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">+27</span>
            </div>
          }
          type="number"
          label="Number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          description="Your phone number"
        />
      </div>

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <div className="w-full h-9 text-text_col text-base font-semibold leading-none">Additional information</div>

      <div className="w-full flex justify-between gap-4 ">
        <Input
          isReadOnly
          type="text"
          label="Employee id"
          value={userDetails?.employeeid || ''}
          description="Your employee id, you cannot change this"
        />

        <Input
          type="text"
          label="pronouns"
          value={pronouns}
          onChange={(e) => setPronouns(e.target.value)}
          description="Your pronouns"
        />

        <Input
        type='text'
          label="Gender"
          placeholder="Select your gender"
          value={gender}
          // onChange={(val) => setGender(val as string)}
          description="Your gender"
        >
          {['male', 'female', 'other'].map((gender) => (
            <SelectItem key={gender}>{gender}</SelectItem>
          ))}
        </Input>
      </div>

      <DatePicker
        label="Birth date"
        // value={dateOfBirth}
        // onChange={setDateOfBirth}
        className="max-w-[284px] my-4"
        description="The day you were born on"
      />

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <Button className="bg-red_salmon" onClick={handleSaveChanges}>
        Save changes
      </Button>
    </motion.div>
  );
};

export default ProfileView