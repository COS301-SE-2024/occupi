import { getPredictions } from '../services/aimodel';
import { Prediction } from '@/models/data';

export interface ExtractedPrediction {
    Date: string;
    Day_of_week: number;
    Predicted_Attendance_Level: string;
    Predicted_Class: number;
}

export async function getExtractedPredictions(): Promise<ExtractedPrediction[] | undefined> {
    try {
        const predictions = await getPredictions();
        
        if (!predictions) {
            console.error('No predictions data received');
            return undefined;
        }

        // console.log(predictions.map((prediction: Prediction) => ({
        //     Date: prediction.Date,
        //     Day_of_week: prediction.Day_of_Week,
        //     Predicted_Attendance_Level: prediction.Predicted_Attendance_Level,
        //     Predicted_Class: prediction.Predicted_Class
        // })));

        return predictions.map((prediction: Prediction) => ({
            Date: prediction.Date,
            Day_of_week: prediction.Day_of_Week,
            Predicted_Attendance_Level: prediction.Predicted_Attendance_Level,
            Predicted_Class: prediction.Predicted_Class
        }));
    } catch (error) {
        console.error('Error in getExtractedPredictions:', error);
        return undefined;
    }
}

function convertNumToDay(num: number) {
    switch (num) {
        case 0:
            return 'Mon';
        case 1:
            return 'Tue';
        case 2:
            return 'Wed';
        case 3:
            return 'Thu';
        case 4:
            return 'Fri';
        case 5:
            return 'Sat';
        case 6:
            return 'Sun';
        default:
            return 'Invalid day';
    }
}

export async function getFormattedPredictionData() {
    const data = await getExtractedPredictions();

    if (!data) {
        return [];
    }

    console.log(data.map((prediction: ExtractedPrediction) => ({
        value: prediction.Predicted_Class,
        label: convertNumToDay(prediction.Day_of_week)
    })));

    return data.map((prediction: ExtractedPrediction) => ({
        value: prediction.Predicted_Class,
        label: convertNumToDay(prediction.Day_of_week)
    }))
}

getFormattedPredictionData();