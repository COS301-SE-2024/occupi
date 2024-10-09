// DataService.ts

import axios from 'axios';

export interface User {
  id: number;
  name: string;
  role: string;
  team: string;
  status: string;
  email: string;
  bookings: number;
}

interface ApiResponse {
  status: number;
  message: string;
  data: User[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
}

export class DataService {
  private static instance: DataService;
  private baseUrl: string = '/api'; // You can change this to your API base URL if different

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public async fetchUsers(page: number = 1, limit: number = 50, filter: object = {}): Promise<User[]> {
    try {
      const response = await axios.get<ApiResponse>(`${this.baseUrl}/get-users`, {
        params: {
          filter: JSON.stringify(filter),
          projection: JSON.stringify(["id", "name", "role", "team", "status", "email"]),
          limit,
          page,
        }
      });

      // Transform the API response to match your current data structure
      return response.data.data.map(user => ({
        ...user,
        bookings: Math.floor(Math.random() * 5), // Random number for bookings as it's not in the API
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error; // Rethrow the error so it can be handled by the caller
    }
  }

  public async fecthUserLocations() {
    try {
      const response = await axios.get(`${this.baseUrl}/get-users-locations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user locations:', error);
      throw error;
    }
  }

  public async fetchUserLocationsWithOptions(page: number = 1, order: "asc" | "desc" = "asc", email: string = ""){
    try {
      const response = await axios.get(`${this.baseUrl}/get-users-locations?email=${email}&page=${page}&sort=${order}&limit=50`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user locations:', error);
      throw error;
    }
  }

  public async fetchUserBlacklist() {
    try {
      const response = await axios.get(`${this.baseUrl}/get-blacklist`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user blacklist:', error);
      throw error;
    }
  }

  public async fetchUserBlacklistWithOptions(page: number = 1, order: "asc" | "desc" = "asc", email: string = ""){
    try {
      const response = await axios.get(`${this.baseUrl}/get-blacklist?email=${email}&page=${page}&sort=${order}&limit=50`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user blacklist:', error);
      throw error;
    }
  }

  public async addIP(ip: string, email: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/add-ip`, {
        "emails": [email],
        "ip": ip,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding IP:', error);
      throw error;
    }
  }

  public async removeIP(email: string, ip: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/remove-ip`, 
        {
          data: {
              "emails": [email],
              "ip": ip,
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error removing IP:', error);
      throw error;
    }
  }

  // You can add more methods here for other API calls
}

// Export a default instance
export default DataService.getInstance();