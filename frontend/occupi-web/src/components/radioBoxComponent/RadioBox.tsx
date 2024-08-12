import React, { useState } from 'react';
import { Switch, Button, Spacer } from '@nextui-org/react';

const RadioBox: React.FC = () => {
  const [inviteNotification, setInviteNotification] = useState(true);
  const [bookingNotification, setBookingNotification] = useState(true);
  const [overrideNotification, setOverrideNotification] = useState(false);

  const handleSave = () => {
    // Handle save logic
    console.log('Settings saved');
  };

  return (
    <div className="min-h-screen p-4">
    

      <div className="space-y-4">
        <div className="flex justify-between items-center  bg-secondary p-4 rounded-lg">
          <p className='text-text_col'>Notify when someone invites me</p>
          <Switch
            checked={inviteNotification}
            onChange={() => setInviteNotification(!inviteNotification)}
            color="success"
          />
        </div>
        <div className="flex justify-between items-center bg-secondary p-4 rounded-lg">
          <p className='text-text_col'>Notify when booking is starting</p>
          <Switch
            checked={bookingNotification}
            onChange={() => setBookingNotification(!bookingNotification)}
            color="success"
          />
        </div>
        <div className="flex justify-between items-center bg-secondary p-4 rounded-lg">
          <p className='text-text_col'>Notify when booking is overridden</p>
          <Switch
            checked={overrideNotification}
            onChange={() => setOverrideNotification(!overrideNotification)}
            color="success"
          />
        </div>
      </div>

      <Spacer y={2} />

      <div className="border-b-secondary border-b-[2px] rounded-2xl my-4" />

      <div className="flex">
      <Button onPress={handleSave} className="bg-red_salmon">
        Save changes
      </Button>

      </div>
    </div>
  );
};

export default RadioBox;
