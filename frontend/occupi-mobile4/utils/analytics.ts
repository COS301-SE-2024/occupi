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
    console.log(req);
    const total = await getAnalytics(req, 'user-hours');
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
    const total = await getAnalytics(req, 'user-average-hours');
    // console.log('averages', total.data[0].overallAverage);
    if (total.data === null) {
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
    // console.log('peak', total.data[0].overallWeekdayCount)
    if (total.data === null) {
        console.log("returning -1");
        return -1;
    }
    return total.data.days;
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

function timeToFloat(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
}