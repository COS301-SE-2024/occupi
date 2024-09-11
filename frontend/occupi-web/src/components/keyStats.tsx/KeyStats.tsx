import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Spinner, Input } from "@nextui-org/react";

interface Stats {
  inOfficeRate: string;
  peakHours: string;
  avgHours: string;
}

interface ApiResponse {
  response: string;
  data: { value: string }[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  status: number;
}

const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 300
): Promise<ApiResponse> => {
  try {
    const response = await fetch(url, options);
    if (response.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

const fetchData = async (email: string, endpoint: string, timeFrom: string, timeTo: string): Promise<ApiResponse> => {
  const params = new URLSearchParams({
    email,
    timeFrom,
    timeTo,
    limit: '50',
    page: '1'
  });

  return fetchWithRetry(`${endpoint}?${params}`);
};

export default function KeyStats({ email }: { email: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const [inOfficeRate, peakHours, avgHours] = await Promise.all([
          fetchData(email, '/analytics/user-in-office-rate', dateFrom, dateTo),
          fetchData(email, '/analytics/user-peak-office-hours', dateFrom, dateTo),
          fetchData(email, '/analytics/user-average-hours', dateFrom, dateTo)
        ]);

        setStats({
          inOfficeRate: inOfficeRate.data[0]?.value || 'N/A',
          peakHours: peakHours.data[0]?.value || 'N/A',
          avgHours: avgHours.data[0]?.value || 'N/A'
        });
      } catch (err) {
        setError('Failed to fetch stats. Please try again later.');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchStats();
    }
  }, [email, dateFrom, dateTo]);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Key Stats</h3>
      </CardHeader>
      <CardBody>
        <div className="flex gap-4 mb-4">
          <Input
            type="date"
            label="From"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            type="date"
            label="To"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-danger text-center">
            {error}
          </div>
        ) : (
          <div className="mt-4">
            <p>In Office Rate: {stats?.inOfficeRate}</p>
            <p>Peak Office Hours: {stats?.peakHours}</p>
            <p>Average Hours: {stats?.avgHours}</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}