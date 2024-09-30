// src/YourService.test.ts
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetchUsers } from './Data'; // Replace 'YourService' with the actual file name

// Create a mock adapter for axios
const mockAxios = new MockAdapter(axios);

describe('User Service', () => {
  afterEach(() => {
    // Clear the mock after each test
    mockAxios.reset();
  });

  test('fetchUsers fetches users successfully', async () => {
    // Mock successful API response
    const mockResponse = {
      data: [
        {
          _id: '123',
          occupiId: 'OCCUPI001',
          details: { name: 'John Doe' },
          email: 'john.doe@example.com',
          role: 'Developer',
          onSite: true,
          status: 'ONSITE',
        },
      ],
      meta: {
        currentPage: 1,
        totalPages: 1,
        totalResults: 1,
      },
      status: 200,
    };

    // Mock the API response
    mockAxios.onGet('/api/get-users').reply(200, mockResponse);

    // Call the fetchUsers function
    const users = await fetchUsers();

    // Expected result
    const expectedUsers = [
      {
        id: 'OCCUPI001',
        name: 'John Doe',
        role: 'Developer',
        position: 'N/A', // Default value
        team: 'N/A', // Default value
        status: 'ONSITE',
        email: 'john.doe@example.com',
        bookings: expect.any(Number), // Random number of bookings
        avatar: 'https://i.pravatar.cc/150?u=OCCUPI001', // Generated avatar URL
      },
    ];

    // Assert that the fetched users match the expected result
    expect(users).toEqual(expectedUsers);
  });

  test('fetchUsers handles API error', async () => {
    // Mock API to simulate an error
    mockAxios.onGet('/api/get-users').reply(500);

    // Call the fetchUsers function
    const users = await fetchUsers();

    // Since the API fails, we expect an empty array
    expect(users).toEqual([]);
  });
});
