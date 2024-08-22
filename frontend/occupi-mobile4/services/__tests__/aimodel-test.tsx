import axios from 'axios';
import { getPredictions, getDayPredictions, Prediction } from '../aimodel';

jest.mock('axios');

describe('aimodel', () => {
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  describe('getPredictions', () => {
    it('should return an array of Prediction objects', async () => {
      const mockPredictions: Prediction[] = [
        { value: 123, timestamp: new Date() },
        { value: 456, timestamp: new Date() },
      ];

      (axios.get as jest.Mock).mockResolvedValue({ data: mockPredictions });

      const predictions = await getPredictions();
      expect(predictions).toEqual(mockPredictions);
    });

    it('should handle errors and return undefined', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const predictions = await getPredictions();
      expect(predictions).toBeUndefined();
    });
  });

  describe('getDayPredictions', () => {
    it('should return a Prediction object', async () => {
      const mockPrediction: Prediction = { value: 789, timestamp: new Date() };

      (axios.get as jest.Mock).mockResolvedValue({ data: mockPrediction });

      const prediction = await getDayPredictions();
      expect(prediction).toEqual(mockPrediction);
    });

    it('should handle errors and return undefined', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const prediction = await getDayPredictions();
      expect(prediction).toBeUndefined();
    });
    
  });
});