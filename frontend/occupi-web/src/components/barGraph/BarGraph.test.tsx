// // src/CapacityComparisonBarChart.test.tsx
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import CapacityComparisonBarChart from './BarGraph';
// import { act } from 'react-dom/test-utils';
// import axios from 'axios';
// import html2canvas from 'html2canvas';

// // Mock the axios API calls
// jest.mock('axios');
// const mockedAxios = axios as jest.Mocked<typeof axios>;

// // Mock html2canvas to avoid actual canvas creation
// jest.mock('html2canvas', () => jest.fn(() => Promise.resolve({
//   toDataURL: () => 'data:image/png;base64,FAKE_BASE64_IMAGE',
// })));

// describe('CapacityComparisonBarChart', () => {
//   beforeEach(() => {
//     mockedAxios.get.mockClear();
//     (html2canvas as jest.Mock).mockClear();
//   });

//   test('renders the chart correctly with mock data', async () => {
//     // Mock API response for this week and last week data
//     const mockThisWeekData = [
//       { day: 'Mon', date: '2024-08-01', predicted: 100 },
//       { day: 'Tue', date: '2024-08-02', predicted: 200 },
//     ];
//     const mockLastWeekData = [
//       { day: 'Mon', date: '2024-07-25', predicted: 150 },
//       { day: 'Tue', date: '2024-07-26', predicted: 250 },
//     ];

//     // Mock axios calls
//     mockedAxios.get.mockResolvedValueOnce({ data: mockThisWeekData });
//     mockedAxios.get.mockResolvedValueOnce({ data: mockLastWeekData });

//     // Render the component
//     render(<CapacityComparisonBarChart />);

//     // Check for loading state
//     expect(screen.getByText(/Loading/i)).toBeInTheDocument();

//     // Wait for the data to be fetched and chart to render
//     await waitFor(() => expect(screen.getByTestId('bar-graph')).toBeInTheDocument());

//     // Check if chart is rendered with correct data
//     expect(screen.getByText(/Mon/i)).toBeInTheDocument();
//     expect(screen.getByText(/Tue/i)).toBeInTheDocument();
//   });

//   test('shows error message when fetching fails', async () => {
//     // Mock axios to return error
//     mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch data'));

//     // Render the component
//     render(<CapacityComparisonBarChart />);

//     // Wait for the error to appear
//     await waitFor(() => {
//       expect(screen.getByText(/Error:/i)).toBeInTheDocument();
//       expect(screen.getByText(/Failed to fetch data/i)).toBeInTheDocument();
//     });
//   });

//   test('triggers the download functionality', async () => {
//     // Mock API response for chart data
//     const mockThisWeekData = [
//       { day: 'Mon', date: '2024-08-01', predicted: 100 },
//       { day: 'Tue', date: '2024-08-02', predicted: 200 },
//     ];

//     mockedAxios.get.mockResolvedValueOnce({ data: mockThisWeekData });
//     mockedAxios.get.mockResolvedValueOnce({ data: mockThisWeekData });

//     // Render the component
//     render(<CapacityComparisonBarChart />);

//     // Wait for the chart to load
//     await waitFor(() => expect(screen.getByTestId('bar-graph')).toBeInTheDocument());

//     // Simulate clicking the download button
//     const downloadButton = screen.getByTestId('download-button1');
//     fireEvent.click(downloadButton);

//     // Check if html2canvas was called
//     expect(html2canvas).toHaveBeenCalled();

//     // Simulate image download (fake download process since it's mocked)
//     const downloadLink = document.createElement('a');
//     const clickSpy = jest.spyOn(downloadLink, 'click');

//     act(() => {
//       html2canvas.mockImplementationOnce(() =>
//         Promise.resolve({
//           toDataURL: () => 'data:image/png;base64,FAKE_BASE64_IMAGE',
//         })
//       );
//       fireEvent.click(downloadButton);
//     });

//     expect(clickSpy).toHaveBeenCalled();
//   });
// });
