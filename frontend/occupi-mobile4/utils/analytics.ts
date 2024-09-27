import { getAnalytics } from "../services/analyticsservices";
import { AnalyticsReq } from "@/models/requests";

// getAnalytics({},'user-hours');

export const fetchUserTotalHours = async (timeFrom?: string, timeTo?: string) => {
    const req: Partial<AnalyticsReq> = {};
    // console.log(timeFrom);

    if (timeFrom !== "") {
        req.timeFrom = timeFrom;
    }

    if (timeTo !== "") {
        req.timeTo = timeTo;
    }
    // console.log(req);
    const total = await getAnalytics(req, 'user-hours');
    console.log('total');
    // console.log('totals',total.data[0].overallTotal);
    if (total.data === null) {
        console.log("returning -1");
        return -1;
    }
    return total.data[0].overallTotal;
}

export const fetchUserTotalHoursArray = async (timeFrom?: string, timeTo?: string) => {
    const req: Partial<AnalyticsReq> = {};
    // console.log(timeFrom);

    if (timeFrom !== "") {
        req.timeFrom = timeFrom;
    }

    if (timeTo !== "") {
        req.timeTo = timeTo;
    }
    const total = await getAnalytics(req, 'user-hours');
    // console.log('totalsss',total.data);
    if (total.data === null) {
        console.log("returning -1");
        return -1;
    }
    return total.data;
}

export const fetchUserAverageHours = async (timeFrom?: string, timeTo?: string) => {
    const req: Partial<AnalyticsReq> = {};
    // console.log(timeFrom);

    if (timeFrom !== "") {
        req.timeFrom = timeFrom;
    }

    if (timeTo !== "") {
        req.timeTo = timeTo;
    }
    console.log('average');
    let total = await getAnalytics(req, 'user-average-hours');
    console.log('averages', total);
    while (total === null || total.data === null) {
        total = await getAnalytics(req, 'user-average-hours');
    }
    if (total.data === null || total.data === undefined) {
        console.log("returning -1");
        return -1;
    }
    return total.data[0].overallAverage;
}

export const fetchWorkRatio = async (timeFrom?: string, timeTo?: string) => {
    const req: Partial<AnalyticsReq> = {};
    // console.log(timeFrom);

    if (timeFrom !== "") {
        req.timeFrom = timeFrom;
    }

    if (timeTo !== "") {
        req.timeTo = timeTo;
    }
    const total = await getAnalytics(req, 'user-work-ratio');
    // console.log('work ratio', total.data[0].ratio);
    if (total.data === null) {
        console.log("returning -1");
        return -1;
    }
    return total.data[0].ratio;
}

export const fetchUserPeakHours = async (timeFrom?: string, timeTo?: string) => {
    const req: Partial<AnalyticsReq> = {};
    // console.log(timeFrom);

    if (timeFrom !== "") {
        req.timeFrom = timeFrom;
    }

    if (timeTo !== "") {
        req.timeTo = timeTo;
    }
    const total = await getAnalytics(req, 'user-peak-office-hours');
    // console.log('peak', total.data[0].days);
    let ordered = [];
    if (total && total.data && total.data.length > 0 && total.data[0].days) {
        ordered = sortDaysInOrder(total.data[0].days);
        // Proceed with 'ordered'
      } else {
        // Handle the case where 'days' data is missing
        ordered = [];
        // You can set a default value or handle it as needed
      }
    // console.log('yurp bruh',getTodayTopHour(ordered));
    if (total.data === null) {
        console.log("returning -1");
        return -1;
    }
    return getTodayTopHour(ordered);
}

function getTodayTopHour(days: { weekday: string; hours: number[] }[]): { weekday: string; hour: number | null } {
    // Get today's date and weekday index (0 = Sunday, 6 = Saturday)
    const today = new Date();
    const dayIndex = today.getDay();

    // Map index to weekday name
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayWeekday = weekDays[dayIndex];

    // Find the day object matching today's weekday
    const todayData = days.find((day) => day.weekday === todayWeekday);

    // Return the top hour if available
    if (todayData && todayData.hours.length > 0) {
        const topHour = todayData.hours[0];
        return { weekday: todayWeekday, hour: topHour };
    } else {
        // Return null if today's data is not found or hours are empty
        return { weekday: todayWeekday, hour: null };
    }
}

function getFormattedData(days: { weekday: string; hours: number[] }[]): string {
    // Define the correct order of weekdays
    const weekDaysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Sort the days array in order of weekdays
    const sortedDays = days.slice().sort((a, b) => {
        return weekDaysOrder.indexOf(a.weekday) - weekDaysOrder.indexOf(b.weekday);
    });

    // Suffixes for numbering
    const suffixes = ["1st", "2nd", "3rd"];

    // Build the formatted string
    let result = "";

    sortedDays.forEach((day) => {
        result += `${day.weekday}:\n`;
        day.hours.forEach((hour, index) => {
            const suffix = suffixes[index] || `${index + 1}th`;
            result += `  ${suffix}: ${hour}\n`;
        });
    });

    return result;
}

export const getAllPeakHours = async (timeFrom?: string, timeTo?: string) => {
    const req: Partial<AnalyticsReq> = {};
    // console.log(timeFrom);

    if (timeFrom !== "") {
        req.timeFrom = timeFrom;
    }

    if (timeTo !== "") {
        req.timeTo = timeTo;
    }
    const total = await getAnalytics(req, 'user-peak-office-hours');
    // console.log('peak', total.data[0].days)
    const ordered = sortDaysInOrder(total.data[0].days);
    console.log('yurp bruh',getTodayTopHour(ordered));
    if (total.data === null) {
        // console.log("returning -1");
        return {};
    }
    return ordered;
}

export const fetchUserArrivalAndDeparture = async (timeFrom?: string, timeTo?: string) => {
    const req: Partial<AnalyticsReq> = {};
    // console.log(timeFrom);

    if (timeFrom !== "") {
        req.timeFrom = timeFrom;
    }

    if (timeTo !== "") {
        req.timeTo = timeTo;
    }

    const total = await getAnalytics(req, 'user-arrival-departure-average');
    // console.log('arrival', total.data[0].overallavgArrival);
    // console.log('departure', total.data[0].overallavgDeparture);
    if (total.data === null) {
        console.log("returning -1");
        return -1;
    }
    return [total.data[0].overallavgArrival, total.data[0].overallavgDeparture];
}

export const fetchUserArrivalAndDepartureArray = async (timeFrom?: string, timeTo?: string) => {
    const req: Partial<AnalyticsReq> = {};
    // console.log(timeFrom);

    if (timeFrom !== "") {
        req.timeFrom = timeFrom;
    }

    if (timeTo !== "") {
        req.timeTo = timeTo;
    }

    req.limit = 50;
    const total = await getAnalytics(req, 'user-arrival-departure-average');
    // console.log('arrival', total.data[0].days);
    // console.log('departure', total.data[0].days);
    return total.data[0].days;
}

export const fetchUserInOfficeRate = async (timeFrom?: string, timeTo?: string) => {
    const req: Partial<AnalyticsReq> = {};
    // console.log(timeFrom);

    if (timeFrom !== "") {
        req.timeFrom = timeFrom;
    }

    if (timeTo !== "") {
        req.timeTo = timeTo;
    }
    const total = await getAnalytics(req, 'user-in-office');
    // console.log('totals2', total.data[0].overallRate);
    if (total.data === null) {
        console.log("returning -1");
        return -1;
    }
    return total.data[0].overallRate;
}

export const getHistoricalBookings = async (timeFrom?: string, timeTo?: string) => {
    const req: Partial<AnalyticsReq> = {};
    // console.log(timeFrom);

    if (timeFrom !== "") {
        req.timeFrom = timeFrom;
    }

    if (timeTo !== "") {
        req.timeTo = timeTo;
    }
    const total = await getAnalytics(req, 'bookings-historical');
    // console.log('totals2', total.data);
    return total.data;
};

export const getCurrentBookings = async (timeFrom?: string, timeTo?: string) => {
    const req: Partial<AnalyticsReq> = {};
    // console.log(timeFrom);

    if (timeFrom !== "") {
        req.timeFrom = timeFrom;
    }

    if (timeTo !== "") {
        req.timeTo = timeTo;
    }
    const total = await getAnalytics(req, 'bookings-current');
    // console.log('totals2', total.data);
    return total.data;
}

interface InputObject {
    _id: any;
    date: string;
    overallTotal: number;
    totalHours: number;
}

interface InputObjectArrival {
    avgArrival: string;
    avgDeparture: string;
    weekday: string;
}

interface OutputObject {
    label?: string;
    value: number;
    dataPointText: string;
}

function formatDate(inputDate: string): string {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
}

const convertToHoursAndMinutes = (totalHours: number): string => {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours} hours and ${minutes} minutes`;
};

export const convertData = (data: InputObject[]): OutputObject[] => {
    return data.map((item, index) => {
        return {
            value: item.totalHours,
            label: (index + 1) % 2 === 0 ? formatDate(item.date) : "",
            dataPointText: convertToHoursAndMinutes(item.totalHours)
        };
        // return output;
    });
};

export const convertTimeData = (data: InputObject[]): OutputObject[] => {
    return data.map((item, index) => {
        return {
            value: item.totalHours,
            label: (index + 1) % 2 === 0 ? formatDate(item.date) : "",
            dataPointText: convertToHoursAndMinutes(item.totalHours)
        };
        // return output;
    });
};

export const convertAvgArrival = (data: InputObjectArrival[]): OutputObject[] => {
    return data.map(item => {
        const value = timeToFloat(item.avgArrival);
        return {
            label: item.weekday,
            dataPointText: item.avgArrival,
            value: value
        };
    });
}

export const convertAvgDeparture = (data: InputObjectArrival[]): OutputObject[] => {
    return data.map(item => {
        const value = timeToFloat(item.avgDeparture);
        return {
            label: item.weekday,
            dataPointText: item.avgDeparture,
            value: value
        };
    });
}

function sortDaysInOrder(days: {weekday: string, hours: number[]}[]): {weekday: string, hours: number[]}[] {
    const weekDaysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days.sort((a, b) => {
        return weekDaysOrder.indexOf(a.weekday) - weekDaysOrder.indexOf(b.weekday);
    });
}

function timeToFloat(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
}