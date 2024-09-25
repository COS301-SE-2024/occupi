import { LoadingSM, Upload } from '@assets/index';
import { UploadButton } from '@assets/index';
import { Button, DatePicker, Input, SelectItem, User } from '@nextui-org/react';
import AuthService from 'AuthService';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useUser } from 'userStore';
import { FeedBackModal } from '@components/index';
import {OccupiLoader} from '@components/index';

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

  // State for managing the modal and loader
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

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
    setIsUploading(true);
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPfp(reader.result);
      };
      reader.readAsDataURL(file);
    }

    AuthService.uploadImage(file)
    .then(_ => {
      setUploadStatus(`Upload successful`);
        setIsUploading(false);
    })
    .catch(error => {
        console.error('Upload error:', error);
        setUploadStatus('Upload failed.');
        setIsUploading(false);
    });
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true); // Show loader
      const updatedDetails = {
        email,
        name: `${firstName} ${lastName}`,
        dob: dateOfBirth?.toISOString().split('T')[0] || '',
        gender,
        session_email: userDetails?.email || '',
        employeeid: userDetails?.employeeid || '',
        number,
        pronouns,
      };

      // Call the API to update the user details
      const result = await AuthService.updateUserDetails(updatedDetails);

      if (result.status === 200) {
        // Update the user details in the store
        setUserDetails(updatedDetails);
        console.log('User details updated successfully');
      } else {
        throw new Error(result.message || 'Failed to update user details');
      }
    } catch (error) {
      console.error('Error updating user details:', error);
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const handleModalAction = () => {
    setIsModalOpen(false);
    handleSaveChanges();
  };

  const changesToBeMade = `
  ${userDetails?.name !== `${firstName} ${lastName}` ? `Name: ${userDetails?.name} -> ${firstName} ${lastName}\n` : ''}
  ${userDetails?.email !== email ? `Email: ${userDetails?.email} -> ${email}\n` : ''}
  ${userDetails?.number !== number ? `Phone Number: ${userDetails?.number} -> ${number}\n` : ''}
  ${userDetails?.gender !== gender ? `Gender: ${userDetails?.gender} -> ${gender}\n` : ''}
  ${userDetails?.pronouns !== pronouns ? `Pronouns: ${userDetails?.pronouns} -> ${pronouns}\n` : ''}
  ${userDetails?.dob !== dateOfBirth?.toISOString().split('T')[0] ? `Birth Date: ${userDetails?.dob} -> ${dateOfBirth?.toISOString().split('T')[0] || 'Not Set'}\n` : ''}
`.trim();

  useEffect(() => {
    setPfp("https://dev.occupi.tech/api/download-profile-image?quality=low");
  }, []);

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
          {/**make button unclickable during uploads */}
        <UploadButton
          accept="image/jpeg, image/png, image/jpg"
          startContent={<Upload />}
          endContent={isUploading ? <div className='flex'>Uploading {<LoadingSM/>}</div> : <div>Upload profile picture</div>}
          onUpload={handleFile}
          classNames={isUploading ? { button: 'cursor-not-allowed' } : {}}
        />
      </div>
      {uploadStatus !== '' && <p className='w-full h-9 text-text_col text-sm leading-none mt-4'>{uploadStatus}</p>}
      <div className="w-full h-9 text-text_col text-base font-semibold leading-none">Full name Test</div>

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
          description="Your gender"
        >
          {['male', 'female', 'other'].map((gender) => (
            <SelectItem key={gender}>{gender}</SelectItem>
          ))}
        </Input>
      </div>

      <DatePicker
        label="Birth date"
        className="max-w-[284px] my-4"
        description="The day you were born on"
      />

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <Button className="bg-red_salmon" onClick={() => setIsModalOpen(true)}>
        Save changes
      </Button>

      {/* Feedback Modal */}
      <FeedBackModal
        title="Confirm Save Changes"
        message={`Are you sure you want to save these changes?\n\n${changesToBeMade}`}
        closeButtonLabel="Cancel"
        actionButtonLabel="Confirm"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAction={handleModalAction}
      />

      {/* Loader */}
      {isLoading && <OccupiLoader message="Saving your changes..." />}
    </motion.div>
  );
};

export default ProfileView;
