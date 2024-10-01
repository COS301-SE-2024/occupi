import { fetchHourlyPredictions, fetchHourlyPredictionsByDate, getDayPredictions, getPredictions, getWeekPredictions } from '../services/aimodel';
import { Prediction } from '@/models/data';
import { getRecommendations, recommendOfficeTimes, predictDay, predictHourly } from '../services/apiservices';

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

export async function getExtractedPredictionsFromDate(date: string): Promise<ExtractedPrediction[] | undefined> {
    try {
        const predictions = await getWeekPredictions(date);

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
type DayValue = {
    label: string;
    value: number;
};

export function convertValues(data: DayValue[]): DayValue[] {
    const valueMap: { [key: number]: number } = {
        1: 150,
        2: 450,
        3: 750,
        4: 1050,
        5: 1350,
    };

    return data?.map((item) => ({
        ...item,
        value: valueMap[item.value] || item.value, // Use the mapped value or keep the original value if not in the map
    }));
}

export function convertValuesHour(data: DayValue[]): DayValue[] {
    const valueMap: { [key: number]: number } = {
        1: 450,
        2: 750,
        3: 1050,
        4: 1350,
    };

    return data?.map((item) => ({
        ...item,
        value: valueMap[item.value] || item.value, // Use the mapped value or keep the original value if not in the map
    }));
}

export function valueToColor(value: number): string {
    // Ensure the value is within the expected range
    const clampedValue = Math.max(1, Math.min(value, 5));

    // Map 1 to 5 to a percentage between 0 and 1
    const ratio = (clampedValue - 1) / (5 - 1);

    // Green to Red gradient
    const green = [0, 255, 0];
    const red = [255, 0, 0];

    // Calculate the color based on the ratio
    const color = green.map((g, i) => Math.round(g + (red[i] - g) * ratio));

    // Return the color as a hex string
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function convertNumToDay(num: number) {
    switch (num) {
        case 0:
            return 'M';
        case 1:
            return 'T';
        case 2:
            return 'W';
        case 3:
            return 'T';
        case 4:
            return 'F';
        case 5:
            return 'S';
        case 6:
            return 'S';
        default:
            return 'Invalid day';
    }
}

export async function getFormattedPredictionData() {
    const data = await getExtractedPredictions();

    if (!data) {
        return [];
    }

    return data.map((prediction: ExtractedPrediction) => ({
        value: prediction.Predicted_Class + 1,
        label: convertNumToDay(prediction.Day_of_week)
    }));
}

export async function getFormattedPredictionWeekData(date: string) {
    const data = await getExtractedPredictionsFromDate(date);

    if (!data) {
        return [];
    }

    // console.log(data.map((prediction: ExtractedPrediction) => ({
    //     value: prediction.Predicted_Class + 1,
    //     label: convertNumToDay(prediction.Day_of_week)
    // })));

    return data.map((prediction: ExtractedPrediction) => ({
        value: prediction.Predicted_Class + 1,
        label: convertNumToDay(prediction.Day_of_week)
    }));
}

getFormattedPredictionWeekData("2025-09-23");
// getFormattedPredictionData();

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
        class: data.Predicted_Class + 1,
        day: convertNumToDay(data.Day_of_week),
        attendance: data.Predicted_Attendance_Level
    }
}



export async function getHourlyPredictions() {
    try {
        const prediction = await fetchHourlyPredictions();

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

        return prediction.Hourly_Predictions;
    } catch (error) {
        console.error('Error in getExtractedPredictions:', error);
        return undefined;
    }
}

export async function mapToAttendanceMidpointForSpecificHours() {
    const specificHours = [7, 9, 11, 12, 13, 15, 17];
    const prediction = await fetchHourlyPredictions();
    console.log(prediction);
    if (prediction) {
        return prediction.Hourly_Predictions
            .filter(item => specificHours.includes(item.Hour))  // Filter specific hours
            .map(item => {
                const [min, max] = item.Predicted_Attendance_Level.split('-').map(Number);
                const midpoint = (min + max) / 2;

                return {
                    label: item.Hour+':00',
                    value: midpoint
                };
            });
    }
    else {
        return {};
    }
}

export async function mapToClassForSpecificHours(date? : string) {
    console.log('here');
    const specificHours = [7, 9, 11, 12, 13, 15, 17];
    if (date) {
        const prediction = await fetchHourlyPredictionsByDate(date);
        console.log(prediction);
        if (prediction) {
        return prediction.Hourly_Predictions
            .filter(item => specificHours.includes(item.Hour))  // Filter specific hours
            .map(item => ({
                label: item.Hour+':00',
                value: item.Predicted_Class
            }));
        }
    }
    const prediction = await fetchHourlyPredictions();
    console.log(prediction);
    if (prediction) {
    return prediction.Hourly_Predictions
        .filter(item => specificHours.includes(item.Hour))  // Filter specific hours
        .map(item => ({
            label: item.Hour+':00',
            value: item.Predicted_Class
        }));
    }
    else {
        return {};
    }
}



export async function getAIRecommendations() {
    try {
        const recommendations = await getRecommendations();
        if (recommendations.status === 200) {
            return recommendations.data;
        } else {
            console.error('Failed to get AI recommendations:', recommendations.error);
            return null;
        }
    } catch (error) {
        console.error('Error in getAIRecommendations:', error);
        return null;
    }
}

export async function getAIOfficeTimeRecommendations() {
    try {
        const officeTimeRecommendations = await recommendOfficeTimes();
        if (officeTimeRecommendations.status === 200) {
            return officeTimeRecommendations.data;
        } else {
            console.error('Failed to get AI office time recommendations:', officeTimeRecommendations.error);
            return null;
        }
    } catch (error) {
        console.error('Error in getAIOfficeTimeRecommendations:', error);
        return null;
    }
}

export async function getDayOccupancyPrediction(date: string, startHour: number, endHour: number) {
    try {
        const dayPrediction = await predictDay(date, startHour, endHour);
        if (dayPrediction.status === 200) {
            return dayPrediction.data;
        } else {
            console.error('Failed to get day occupancy prediction:', dayPrediction.error);
            return null;
        }
    } catch (error) {
        console.error('Error in getDayOccupancyPrediction:', error);
        return null;
    }
}

export async function getHourlyOccupancyPrediction(date: string, hour: number) {
    try {
        const hourlyPrediction = await predictHourly(date, hour);
        if (hourlyPrediction.status === 200) {
            return hourlyPrediction.data;
        } else {
            console.error('Failed to get hourly occupancy prediction:', hourlyPrediction.error);
            return null;
        }
    } catch (error) {
        console.error('Error in getHourlyOccupancyPrediction:', error);
        return null;
    }
}

export async function getFormattedAIRecommendations() {
    const recommendations = await getAIRecommendations();
    if (!recommendations) {
        return [];
    }
    // Format the recommendations as needed for the frontend
    // This is a placeholder - adjust according to your actual data structure
    return recommendations.map((rec: any) => ({
        title: rec.title,
        description: rec.description,
        // Add any other relevant fields
    }));
}

export async function getFormattedOfficeTimeRecommendations() {
    const officeTimeRecommendations = await getAIOfficeTimeRecommendations();
    if (!officeTimeRecommendations) {
        return [];
    }
    // Format the office time recommendations as needed for the frontend
    // This is a placeholder - adjust according to your actual data structure
    return officeTimeRecommendations.map((rec: any) => ({
        day: rec.day,
        startTime: rec.startTime,
        endTime: rec.endTime,
        // Add any other relevant fields
    }));
}
