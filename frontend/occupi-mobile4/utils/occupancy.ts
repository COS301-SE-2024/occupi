import { getDayPredictions, getPredictions } from '../services/aimodel';
import { Prediction } from '@/models/data';

export interface ExtractedPrediction {
    Date: number;
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

export async function getExtractedDailyPrediction(): Promise<ExtractedPrediction | undefined> {
    try {
        const prediction = await getDayPredictions();
        
        if (!prediction) {
            console.error('No predictions data received');
            return undefined;
        }

        // console.log(predictions.map((prediction: Prediction) => ({
        //     Date: prediction.Date,
        //     Day_of_week: prediction.Day_of_Week,
        //     Predicted_Attendance_Level: prediction.Predicted_Attendance_Level,
        //     Predicted_Class: prediction.Predicted_Class
        // })));

        return {
            Date: prediction.Date,
            Day_of_week: prediction.Day_of_Week,
            Predicted_Attendance_Level: prediction.Predicted_Attendance_Level,
            Predicted_Class: prediction.Predicted_Class
        };
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

    // console.log(data.map((prediction: ExtractedPrediction) => ({
    //     value: prediction.Predicted_Class,
    //     label: convertNumToDay(prediction.Day_of_week)
    // })));

    return data.map((prediction: ExtractedPrediction) => ({
        value: prediction.Predicted_Class+1,
        label: convertNumToDay(prediction.Day_of_week)
    }))
}

function convertNumToDate(day: number): string {
    const date = new Date();
    date.setDate(day);
    return date.toLocaleDateString(); // You can customize the locale and options if needed
}

export async function getFormattedDailyPredictionData() {
    const data = await getExtractedDailyPrediction();

    if (!data) {
        return null;
    }

    // console.log(data.map((prediction: ExtractedPrediction) => ({
    //     value: prediction.Predicted_Class,
    //     label: convertNumToDay(prediction.Day_of_week)
    // })));

    return {
        date: convertNumToDate(data.Date),
        class: data.Predicted_Class+1,
        day: convertNumToDay(data.Day_of_week),
        attendance: data.Predicted_Attendance_Level
    }
}

// getFormattedPredictionData();