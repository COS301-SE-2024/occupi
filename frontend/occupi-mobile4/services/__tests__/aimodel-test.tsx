import axios from "axios";
import { getDayPredictions, getPredictions, Prediction } from "../aimodel";

describe('aimodel', () => {
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(axios, 'get').mockImplementation((url) => {
      if (url === "https://ai.occupi.tech/predict_week") {
        return Promise.resolve({ data: [
          { value: 123, timestamp: new Date() },
          { value: 456, timestamp: new Date() },
        ]});
      } else if (url === "https://ai.occupi.tech/predict") {
        return Promise.resolve({ data: { value: 789, timestamp: new Date() } });
      } else {
        return Promise.reject(new Error('Network error'));
      }
    });
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
    (axios.get as jest.Mock).mockRestore();
  });

  describe('getPredictions', () => {
    it('should return an array of Prediction objects', async () => {
      const predictions = await getPredictions();
      expect(predictions).toEqual([
        { value: 123, timestamp: expect.any(Date) },
        { value: 456, timestamp: expect.any(Date) },
      ]);
    });

    it('should handle errors and return undefined', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      const predictions = await getPredictions();
      expect(predictions).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({ response: { data: 'Error message' } }));

      try {
        const predictions = await getPredictions();
        expect(predictions).toBeUndefined();
      } catch (error) {
        expect(console.error).toHaveBeenCalledWith(`Error in getPredictions:`, 'Error message');
      }
    });

    it('should handle errors where response data is not available', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({ message: 'Network error' }));

      try {
        const predictions = await getPredictions();
        expect(predictions).toBeUndefined();
      } catch (error) {
        expect(console.error).toHaveBeenCalledWith(`Error in getPredictions:`, { message: 'Network error' });
      }
    });
    
    it('should return error response data when axios error occurs with response data', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.reject({
          isAxiosError: true,
          response: { data: 'Error data' },
        })
      );
    
      const predictions = await getPredictions();
      expect(predictions).toEqual('Error data');
    });
    
    
  });

  describe('getDayPredictions', () => {
    it('should return a Prediction object', async () => {
      const prediction = await getDayPredictions();
      expect(prediction).toEqual({ value: 789, timestamp: expect.any(Date) });
    });

    it('should handle errors and return undefined', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      const prediction = await getDayPredictions();
      expect(prediction).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({ response: { data: 'Error message' } }));

      try {
        const prediction = await getDayPredictions();
        expect(prediction).toBeUndefined();
      } catch (error) {
        expect(console.error).toHaveBeenCalledWith(`Error in getDayPredictions:`, 'Error message');
      }
    });

    it('should handle errors where response data is not available', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({ message: 'Network error' }));

      try {
        const prediction = await getDayPredictions();
        expect(prediction).toBeUndefined();
      } catch (error) {
        expect(console.error).toHaveBeenCalledWith(`Error in getDayPredictions:`, { message: 'Network error' });
      }
    });

    it('should return error response data when axios error occurs with response data', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.reject({
          isAxiosError: true,
          response: { data: 'Error data' },
        })
      );
    
      const prediction = await getDayPredictions();
      expect(prediction).toEqual('Error data');
    });
    
    
    
  });
});