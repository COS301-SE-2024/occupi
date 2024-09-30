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
import ReactTimeAgo from 'react-time-ago'

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
  }

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
    <Modal isOpen={isOpen} onClose={onClose} backdrop='blur' size='4xl' scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Badge content={unreadCount} shape="circle" color="danger" className='mr-[10px]'>
              <Button
                radius="full"
                isIconOnly
                aria-label={`You have ${unreadCount} notifications`}
                variant="light"
              >
                <FaBell size={24} />
              </Button>
            </Badge>
            {title}
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
                  <div>{notification.title}</div>
                  <div style={{ fontSize: '14px'}}>{notification.message}</div>
                  <div style={{ fontSize: '12px', color: 'gray' }}>
                    <ReactTimeAgo date={new Date(notification.timestamp)} locale="en-US"/>
                  </div>
                </div>
                {!notification.read && (
                  <div className="h-[10px] w-[10px] rounded-full bg-blue-500"/>
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
