import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Badge } from '@nextui-org/react';
import { FaBell, FaCheckCircle, FaTools, FaUserCheck, FaChartBar } from 'react-icons/fa';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'booking' | 'capacity' | 'maintenance';
}

interface NotificationsModalProps {
  title: string;
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  markAsRead: (id: number) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ title, notifications, isOpen, onClose, markAsRead }) => {
  const unreadCount = notifications.filter(notification => !notification.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <FaUserCheck color='blue' />;
      case 'capacity':
        return <FaChartBar color='purple' />;
      case 'maintenance':
        return <FaTools color='red' />;
      default:
        return <FaBell color='orange' />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop='blur' size='4xl'>
      <ModalContent>
        <ModalHeader>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaBell style={{ marginRight: '10px' }} />
            {title}
            <Badge color='warning' style={{ marginLeft: 'auto' }}>{unreadCount}</Badge>
          </div>
        </ModalHeader>
        <ModalBody>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              No new notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ marginRight: '10px' }}>
                  {getIcon(notification.type)}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div>{notification.message}</div>
                  <div style={{ fontSize: '12px', color: 'gray' }}>{new Date(notification.timestamp).toLocaleString()}</div>
                </div>
                {!notification.read && (
                  <Button className=' bg-secondary_alt text-text_col_alt' onClick={() => markAsRead(notification.id)}>
                    Mark as read
                  </Button>
                )}
              </div>
            ))
          )}
        </ModalBody>
        <ModalFooter>
          <Button color='danger' onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NotificationsModal;
