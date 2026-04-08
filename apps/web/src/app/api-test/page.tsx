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

interface NpmDownloadsResponse {
  package: string;
  start: string;
  end: string;
  downloads: Array<{ day: string; downloads: number }>;
}

export default function ApiTestPage() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [apiInfo, setApiInfo] = useState<ApiInfoResponse | null>(null);
  const [npmDownloads, setNpmDownloads] = useState<NpmDownloadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        const [healthRes, apiInfoRes, npmRes] = await Promise.all([
          fetch(`${apiUrl}/health`),
          fetch(`${apiUrl}/api-info`),
          fetch(`${apiUrl}/npmdata/downloads?start=2024-01-01&end=2024-01-10&package=react`),
        ]);

        if (!healthRes.ok || !apiInfoRes.ok || !npmRes.ok) {
          throw new Error("Failed to fetch API data");
        }

        const health = await healthRes.json();
        const info = await apiInfoRes.json();
        const downloads = await npmRes.json();

        setHealthData(health);
        setApiInfo(info);
        setNpmDownloads(downloads);
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
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">API Connection Test</h1>

        <div className="grid gap-6 md:grid-cols-3">
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

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">npm Download Query</h2>
            {npmDownloads ? (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Package:</span> {npmDownloads.package}
                </p>
                <p>
                  <span className="font-medium">Range:</span> {npmDownloads.start} ～{" "}
                  {npmDownloads.end}
                </p>
                <p className="font-medium mt-3">Sample downloads:</p>
                <div className="max-h-40 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-3 text-sm">
                  {npmDownloads.downloads.slice(0, 8).map((item) => (
                    <div key={item.day} className="flex justify-between py-1">
                      <span>{item.day}</span>
                      <span className="font-semibold">{item.downloads}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No npm download data available.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-slate-700">Connection Status</h2>
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
