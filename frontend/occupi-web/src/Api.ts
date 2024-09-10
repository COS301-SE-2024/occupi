// src/services/api.ts

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const uploadRoomImage = async (imageFile: File, roomId: string) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('roomId', roomId);
  
    try {
      const response = await api.post('/upload-room-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };
export const getImageUrl = (imageId: string, quality: string = 'mid') => {
  return `/api/image/${imageId}?quality=${quality}`;
};

export default api;