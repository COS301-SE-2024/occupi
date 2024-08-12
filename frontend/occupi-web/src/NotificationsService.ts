import axios from 'axios';
import { useUserStore } from 'userStore';

const API_USER_URL = '/api'; // Adjust this if needed

interface NotificationResponseItem {
  id: number;
  message: string;
  title: string;
  unreadEmails: string[];
  timestamp: string;
  type: string;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'booking' | 'capacity' | 'maintenance';
}

const NotificationService = {
  fetchNotifications: async (): Promise<Notification[]> => {
    const userDetails = useUserStore.getState().userDetails;
    const email = userDetails?.email;

    if (!email) {
      throw new Error('User email is not available in the store.');
    }

    const filter = JSON.stringify({ emails: [email] });
    const url = `${API_USER_URL}/get-notifications?filter=${encodeURIComponent(filter)}&projection=message,title,unreadEmails&limit=50&page=1`;

    try {
      const response = await axios.get<{ data: NotificationResponseItem[] }>(url);

      return response.data.data.map((item) => ({
        id: item.id,
        message: item.message,
        read: item.unreadEmails.length === 0,
        timestamp: item.timestamp,
        type: item.type as 'booking' | 'capacity' | 'maintenance',
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      }
      throw new Error('An unexpected error occurred while fetching notifications');
    }
  },

  markNotificationAsRead: async (notificationId: number): Promise<void> => {
    try {
      const response = await axios.post(`${API_USER_URL}/mark-notification-read`, { id: notificationId });
      if (response.status !== 200) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      }
      throw new Error('An unexpected error occurred while marking notification as read');
    }
  },

  getNotificationSummary: async (): Promise<Pick<Notification, 'id' | 'message' | 'type'>[]> => {
    try {
      const fullData = await NotificationService.fetchNotifications();
      return fullData.map(({ id, message, type }) => ({ id, message, type }));
    } catch (error) {
      console.error("Error getting notification summary:", error);
      throw error;
    }
  }
};

export default NotificationService;