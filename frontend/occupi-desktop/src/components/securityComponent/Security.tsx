import { useState, useEffect } from 'react';
import { Button, Input, Switch } from "@nextui-org/react";
import { motion } from "framer-motion";
import { getSecuritySettings, updateSecuritySettings, SecuritySettings } from 'SecurityService';

const Security = () => {
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    useBiometrics: false,
    use2FA: false,
    forceLogoutOnAppClose: false,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchSecuritySettings = async () => {
      try {
        const response = await getSecuritySettings('tintinaustin12345@gmail.com');
        setSecuritySettings(response.data);
      } catch (error) {
        console.error('Error fetching security settings:', error);
      }
    };
    fetchSecuritySettings();
  }, []);

  const handleSaveChanges = async () => {
    try {
      await updateSecuritySettings({
        email: 'tintinaustin12345@gmail.com',
        mfa: securitySettings.use2FA ? 'on' : 'off',
        currentPassword,
        newPassword,
        newPasswordConfirm: confirmPassword,
      });
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

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
          <Switch
            color="success"
            checked={securitySettings.useBiometrics}
            onChange={(e) =>
              setSecuritySettings((prev) => ({
                ...prev,
                useBiometrics: e.target.checked,
              }))
            }
          />
        </div>
        <div className="flex justify-between items-center bg-secondary p-4 rounded-lg">
          <p className="text-text_col">
            Use 2FA To login(You will be asked to enter an OTP each time you
            Login){" "}
          </p>
          <Switch
            color="success"
            checked={securitySettings.use2FA}
            onChange={(e) =>
              setSecuritySettings((prev) => ({
                ...prev,
                use2FA: e.target.checked,
              }))
            }
          />
        </div>
        <div className="flex justify-between items-center bg-secondary p-4 rounded-lg">
          <p className="text-text_col">Force Logout on App Close</p>
          <Switch
            color="success"
            checked={securitySettings.forceLogoutOnAppClose}
            onChange={(e) =>
              setSecuritySettings((prev) => ({
                ...prev,
                forceLogoutOnAppClose: e.target.checked,
              }))
            }
          />
        </div>
      </div>

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <div className="w-full h-9 text-text_col text-base font-semibold leading-none">
        Change Password
      </div>

      <div className="w-full flex flex-col justify-between gap-4">
        <Input
          type="password"
          label="Current Password"
          labelPlacement="outside"
          placeholder="Enter Your Password"
          description="Enter The Password You Are Currently Using"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          type="password"
          label="New Password"
          labelPlacement="outside"
          placeholder="Enter Your New Password"
          description="Enter The Password You want to use now"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          type="password"
          label="Confirm Password"
          labelPlacement="outside"
          placeholder="Confirm Your New Password"
          description="Confirm The Password You want to use now"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <Button className="bg-red_salmon" onClick={handleSaveChanges}>
        Save changes
      </Button>
    </motion.div>
  );
};

export default Security;