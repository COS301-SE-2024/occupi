import { getAnalytics } from "../services/analyticsservices";
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { AnalyticsReq } from "@/models/requests";

getAnalytics({},'user-hours');

const