"use client";

import { useEffect, useState } from "react";

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  endpoints: {
    health: string;
    apiInfo: string;
  };
}

export default function ApiTestPage() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [apiInfo, setApiInfo] = useState<ApiInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        const [healthRes, apiInfoRes] = await Promise.all([
          fetch(`${apiUrl}/health`),
          fetch(`${apiUrl}/api-info`),
        ]);

        if (!healthRes.ok || !apiInfoRes.ok) {
          throw new Error("Failed to fetch API data");
        }

        const health = await healthRes.json();
        const info = await apiInfoRes.json();

        setHealthData(health);
        setApiInfo(info);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">API Connection Test</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">Health Check</h2>
            {healthData && (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Status:</span> {healthData.status}
                </p>
                <p>
                  <span className="font-medium">Timestamp:</span> {healthData.timestamp}
                </p>
                <p>
                  <span className="font-medium">Uptime:</span> {healthData.uptime.toFixed(2)}s
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">API Info</h2>
            {apiInfo && (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {apiInfo.name}
                </p>
                <p>
                  <span className="font-medium">Version:</span> {apiInfo.version}
                </p>
                <p>
                  <span className="font-medium">Description:</span> {apiInfo.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Connection Status</h2>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">Connected to Backend API</span>
          </div>
          <p className="mt-2 text-gray-600">
            Frontend (Next.js) successfully communicating with Backend (NestJS)
          </p>
        </div>
      </div>
    </div>
  );
}
