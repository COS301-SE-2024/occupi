import { getExtractedPredictions, ExtractedPrediction } from '../occupancy';
import { getPredictions } from '@/services/aimodel';
import { Prediction } from '@/models/data';

// Mock dependencies
jest.mock('@/services/aimodel');

describe('occupancy.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExtractedPredictions', () => {
    it('should extract predictions successfully', async () => {
      const mockPredictions: Prediction[] = [
        {
          Date: '2023-08-07',
          Day_of_week: 1,
          Day_of_month: 7,
          Is_Weekend: false,
          Month: 8,
          Predicted_Attendance_Level: 'High',
          Predicted_Class: 3,
        },
        {
          Date: '2023-08-08',
          Day_of_week: 2,
          Day_of_month: 8,
          Is_Weekend: false,
          Month: 8,
          Predicted_Attendance_Level: 'Medium',
          Predicted_Class: 2,
        },
      ];

      (getPredictions as jest.Mock).mockResolvedValue(mockPredictions);

      const result = await getExtractedPredictions();

      expect(getPredictions).toHaveBeenCalled();
      expect(result).toEqual([
        {
          Date: '2023-08-07',
          Predicted_Attendance_Level: 'High',
          Predicted_Class: 3,
        },
        {
          Date: '2023-08-08',
          Predicted_Attendance_Level: 'Medium',
          Predicted_Class: 2,
        },
      ]);
    });

    it('should return undefined when no predictions are received', async () => {
      (getPredictions as jest.Mock).mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getExtractedPredictions();

      expect(getPredictions).toHaveBeenCalled();
      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('No predictions data received');

      consoleSpy.mockRestore();
    });

    it('should handle errors and return undefined', async () => {
      (getPredictions as jest.Mock).mockRejectedValue(new Error('API error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getExtractedPredictions();

      expect(getPredictions).toHaveBeenCalled();
      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Error in getExtractedPredictions:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});