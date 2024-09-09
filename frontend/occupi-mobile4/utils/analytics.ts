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
    return total.data[0].overallTotal;
}

export const fetchUserAverageHours = async (timeFrom : string, timeTo : string) => {
    const req: AnalyticsReq = {
        timeFrom: timeFrom,
        timeTo: timeTo
    }
    const total = await getAnalytics(req, 'user-average-hours');
    return total.data.overallAverage;
}

export const fetchWorkRatio = async (timeFrom : string, timeTo : string) => {
    const req: AnalyticsReq = {
        timeFrom: timeFrom,
        timeTo: timeTo
    }
    const total = await getAnalytics(req, 'user-work-ratio');
    return total.data.ratio;
}

export const fetchUserPeakHours = async (timeFrom : string, timeTo : string) => {
    const req: AnalyticsReq = {
        timeFrom: timeFrom,
        timeTo: timeTo
    }
    const total = await getAnalytics(req, 'user-peak-office-hours');
    return total.data.days;
}

export const fetchUserArrivalAndDeparture = async (timeFrom : string, timeTo : string) => {
    const req: AnalyticsReq = {
        timeFrom: timeFrom,
        timeTo: timeTo
    }
    const total = await getAnalytics(req, 'user-arrival-departure-average');
    return [ total.data.overallavgArrival, total.data.overallavgDeparture];
}

export const fetchUserInOfficeRate = async (timeFrom : string, timeTo : string) => {
    const req: AnalyticsReq = {
        timeFrom: timeFrom,
        timeTo: timeTo
    }
    const total = await getAnalytics(req, 'user-in-office-rate');
    return total.data.overallRate;
}