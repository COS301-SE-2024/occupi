import { getAnalytics } from "../services/analyticsservices";
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { AnalyticsReq } from "@/models/requests";

// getAnalytics({},'user-hours');

export const fetchUserTotalHours = async (timeFrom : string, timeTo : string) => {
    const req: AnalyticsReq = {
        timeFrom: timeFrom,
        timeTo: timeTo
    }
    const total = await getAnalytics(req, 'user-hours');
    console.log('totals',total.data[0].overallTotal);
    return total.data[0].overallTotal;
}

export const fetchUserAverageHours = async (timeFrom : string, timeTo : string) => {
    const req: AnalyticsReq = {
        timeFrom: timeFrom,
        timeTo: timeTo
    }
    const total = await getAnalytics(req, 'user-average-hours');
    console.log('averages', total.data[0].overallAverage);
    return total.data[0].overallAverage;
}

export const fetchWorkRatio = async (timeFrom : string, timeTo : string) => {
    const req: AnalyticsReq = {
        timeFrom: timeFrom,
        timeTo: timeTo
    }
    const total = await getAnalytics(req, 'user-work-ratio');
    console.log('work ratio', total.data[0].ratio)
    return total.data[0].ratio;
}

export const fetchUserPeakHours = async (timeFrom : string, timeTo : string) => {
    const req: AnalyticsReq = {
        timeFrom: timeFrom,
        timeTo: timeTo
    }
    const total = await getAnalytics(req, 'user-peak-office-hours');
    console.log('peak', total.data[0].overallWeekdayCount)
    return total.data.days;
}

export const fetchUserArrivalAndDeparture = async (timeFrom : string, timeTo : string) => {
    const req: AnalyticsReq = {
        timeFrom: timeFrom,
        timeTo: timeTo
    }
    const total = await getAnalytics(req, 'user-arrival-departure-average');
    console.log('arrival', total.data[0].overallavgArrival);
    console.log('departure', total.data[0].overallavgDeparture);
    return [ total.data[0].overallavgArrival, total.data[0].overallavgDeparture];
}

export const fetchUserInOfficeRate = async (timeFrom : string, timeTo : string) => {
    const req: AnalyticsReq = {
        timeFrom: timeFrom,
        timeTo: timeTo
    }
    const total = await getAnalytics(req, 'user-in-office');
    console.log('totals2',total.data[0].overallRate);
    return total.data[0].overallRate;
}