import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Badge,
} from '@nextui-org/react';
import { FaBell, FaTools, FaUserCheck, FaChartBar } from 'react-icons/fa';
import NotificationService, { Notification } from 'NotificationsService';
import { OccupiLoader } from '@components/index'; // Assuming you have this loading component

interface NotificationsModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  title,
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await NotificationService.fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await NotificationService.markNotificationAsRead(id);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

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
            <Badge color='warning' style={{ marginLeft: 'auto' }}>
              {unreadCount}
            </Badge>
          </div>
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <OccupiLoader message='Loading notifications...' />
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              No new notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
              >
                <div style={{ marginRight: '10px' }}>{getIcon(notification.type)}</div>
                <div style={{ flexGrow: 1 }}>
                  <div>{notification.message}</div>
                  <div style={{ fontSize: '12px', color: 'gray' }}>
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    className='bg-secondary_alt text-text_col_alt'
                    onClick={() => markAsRead(notification.id)}
                  >
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
