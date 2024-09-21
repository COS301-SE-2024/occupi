import { getExtractedPredictions, getExtractedDailyPrediction, convertValues, valueToColor, getFormattedPredictionData, getFormattedDailyPredictionData } from '../occupancy';
import { getPredictions, getDayPredictions } from '@/services/aimodel';
import { Prediction } from '@/models/data';

// Mock dependencies
jest.mock('@/services/aimodel');

describe('occupancy.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  jest.mock('../occupancy', () => ({
    ...jest.requireActual('../occupancy'),
    getExtractedPredictions: jest.fn(),
    getExtractedDailyPrediction: jest.fn(),
  }));
  

  describe('getExtractedDailyPrediction', () => {
    it('should extract daily prediction successfully', async () => {
      const mockPrediction: Prediction = {
        Date: '2023-08-07',
        Day_of_Week: 1,
        Day_of_month: 7,
        Is_Weekend: false,
        Month: 8,
        Predicted_Attendance_Level: 'High',
        Predicted_Class: 3,
      };

      (getDayPredictions as jest.Mock).mockResolvedValue(mockPrediction);

      const result = await getExtractedDailyPrediction();

      expect(getDayPredictions).toHaveBeenCalled();
      expect(result).toEqual({
        Date: '2023-08-07',
        Predicted_Attendance_Level: 'High',
        Predicted_Class: 3,
        Day_of_week: 1,
      });
    });

    it('should return undefined when no predictions are received', async () => {
      (getDayPredictions as jest.Mock).mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getExtractedDailyPrediction();

      expect(getDayPredictions).toHaveBeenCalled();
      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('No predictions data received');

      consoleSpy.mockRestore();
    });

    it('should handle errors and return undefined', async () => {
      (getDayPredictions as jest.Mock).mockRejectedValue(new Error('API error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getExtractedDailyPrediction();

      expect(getDayPredictions).toHaveBeenCalled();
      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Error in getExtractedPredictions:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('convertValues', () => {
    it('should convert values correctly', () => {
      const data = [
        { label: 'Monday', value: 1 },
        { label: 'Tuesday', value: 2 },
        { label: 'Wednesday', value: 3 },
        { label: 'Thursday', value: 4 },
        { label: 'Friday', value: 5 },
        { label: 'Saturday', value: 6 },
        { label: 'Sunday', value: 7 },
      ];

      const result = convertValues(data);

      expect(result).toEqual([
        { label: 'Monday', value: 150 },
        { label: 'Tuesday', value: 450 },
        { label: 'Wednesday', value: 750 },
        { label: 'Thursday', value: 1050 },
        { label: 'Friday', value: 1350 },
        { label: 'Saturday', value: 6 },
        { label: 'Sunday', value: 7 },
      ]);
    });
  });

  describe('valueToColor', () => {
    it('should return the correct color for the given value', () => {
      expect(valueToColor(1)).toEqual('rgb(0, 255, 0)');
      expect(valueToColor(2)).toEqual('rgb(64, 191, 0)'); // Use toEqual for string comparison
      expect(valueToColor(3)).toEqual('rgb(128, 128, 0)');
      expect(valueToColor(4)).toEqual('rgb(191, 64, 0)');
      expect(valueToColor(5)).toEqual('rgb(255, 0, 0)');
    });
  
    it('should clamp the value to the valid range', () => {
      expect(valueToColor(0)).toEqual('rgb(0, 255, 0)');
      expect(valueToColor(6)).toEqual('rgb(255, 0, 0)');
    });
  });
  
  // describe('getFormattedPredictionData', () => {
  //   it('should format prediction data correctly', async () => {
  //     const mockPredictions: Prediction[] = [
  //       {
  //         Date: '2023-08-07',
  //         Day_of_Week: 1,
  //         Day_of_month: 7,
  //         Is_Weekend: false,
  //         Month: 8,
  //         Predicted_Attendance_Level: 'High',
  //         Predicted_Class: 3,
  //       },
  //       {
  //         Date: '2023-08-08',
  //         Day_of_Week: 2,
  //         Day_of_month: 8,
  //         Is_Weekend: false,
  //         Month: 8,
  //         Predicted_Attendance_Level: 'Medium',
  //         Predicted_Class: 2,
  //       },
  //     ];
  
  //     (getExtractedPredictions as jest.Mock).mockResolvedValue(
  //       mockPredictions.map((prediction) => ({
  //         Date: prediction.Date,
  //         Day_of_week: prediction.Day_of_Week,
  //         Predicted_Attendance_Level: prediction.Predicted_Attendance_Level,
  //         Predicted_Class: prediction.Predicted_Class,
  //       }))
  //     );
  
  //     const result = await getFormattedPredictionData();
  
  //     expect(getExtractedPredictions).toHaveBeenCalled();
  //     expect(result).toEqual([
  //       { value: 4, label: 'Mon' },
  //       { value: 3, label: 'Tue' },
  //     ]);
  //   });
  
  //   it('should return an empty array when no predictions are received', async () => {
  //     (getExtractedPredictions as jest.Mock).mockResolvedValue([]);
  
  //     const result = await getFormattedPredictionData();
  
  //     expect(getExtractedPredictions).toHaveBeenCalled();
  //     expect(result).toEqual([]);
  //   });
  // });
  
  // describe('getFormattedDailyPredictionData', () => {
  //   it('should format daily prediction data correctly', async () => {
  //     const mockPrediction: Prediction = {
  //       Date: '2023-08-07',
  //       Day_of_Week: 1,
  //       Day_of_month: 7,
  //       Is_Weekend: false,
  //       Month: 8,
  //       Predicted_Attendance_Level: 'High',
  //       Predicted_Class: 3,
  //     };
  
  //     (getExtractedDailyPrediction as jest.Mock).mockResolvedValue({
  //       Date: mockPrediction.Date,
  //       Day_of_week: mockPrediction.Day_of_Week,
  //       Predicted_Attendance_Level: mockPrediction.Predicted_Attendance_Level,
  //       Predicted_Class: mockPrediction.Predicted_Class,
  //     });
  
  //     const result = await getFormattedDailyPredictionData();
  
  //     expect(getExtractedDailyPrediction).toHaveBeenCalled();
  //     expect(result).toEqual({
  //       date: '8/7/2023',
  //       class: 4,
  //       day: 'Mon',
  //       attendance: 'High',
  //     });
  //   });
  
  //   it('should return null when no predictions are received', async () => {
  //     (getExtractedDailyPrediction as jest.Mock).mockResolvedValue(null);
  
  //     const result = await getFormattedDailyPredictionData();
  
  //     expect(getExtractedDailyPrediction).toHaveBeenCalled();
  //     expect(result).toBeNull();
  //   });
  // });
  

  
});