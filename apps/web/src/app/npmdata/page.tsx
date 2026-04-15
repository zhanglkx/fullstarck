"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import * as echarts from "echarts";
import type { ApiResponse, NpmDownloadsEnvelope } from "@fullstack/shared";
import { apiGet } from "@/lib/api-client";
import { NpmDataSkeleton } from "@/components/skeletons";
import apple from "@/styles/apple-page.module.scss";
import styles from "./page.module.scss";

interface QueryParams {
  start: string;
  end: string;
  package: string;
}

export default function NpmDataPage() {
  const [queryParams, setQueryParams] = useState<QueryParams>({
    start: "2024-01-01",
    end: "2024-01-10",
    package: "react",
  });

  const [data, setData] = useState<NpmDownloadsEnvelope | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const isInitialMount = useRef(true);
  const prevChartRefDOM = useRef<HTMLDivElement | null>(null);

  const fetchNpmData = useCallback(async (params: QueryParams) => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiGet<ApiResponse<NpmDownloadsEnvelope>>("/npmdata/downloads", {
        params: {
          start: params.start,
          end: params.end,
          package: params.package.trim(),
        },
      });

      if (!result.data.success) throw new Error("API 返回失败");

      setData(result.data);
      setSearched(true);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
      setError(err instanceof Error ? err.message : "查询失败，请重试");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;
    void fetchNpmData(queryParams);
  }, [fetchNpmData, queryParams]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    if (prevChartRefDOM.current !== chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
      prevChartRefDOM.current = chartRef.current;
    }

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, null, {
        renderer: "canvas",
        useDirtyRect: true,
      });
    }

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const accent = isDark ? "#2997ff" : "#0066cc";
    const titleColor = isDark ? "#f5f5f7" : "#1d1d1f";
    const axisMuted = isDark ? "#a1a1a6" : "#86868b";
    const splitLine = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

    const payload = data.data;
    const downloads = payload.downloads;
    const days = downloads.map((d) => d.day);
    const downloadCounts = downloads.map((d) => d.downloads);

    const chartOption: echarts.EChartsOption = {
      title: {
        text: `${payload.package} 下载量`,
        left: "center",
        textStyle: {
          color: titleColor,
          fontSize: 16,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "rgba(28,28,30,0.94)" : "rgba(255,255,255,0.96)",
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
        textStyle: {
          color: titleColor,
        },
        axisPointer: {
          type: "cross",
          lineStyle: {
            color: isDark ? "rgba(41,151,255,0.35)" : "rgba(0,102,204,0.35)",
          },
        },
      },
      grid: {
        left: "3%",
        right: "3%",
        bottom: "15%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: days,
        axisLabel: {
          color: axisMuted,
          rotate: 45,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: axisMuted,
          formatter: (value) => {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
            if (value >= 1000) return (value / 1000).toFixed(1) + "K";
            return String(value);
          },
        },
        splitLine: {
          lineStyle: {
            color: splitLine,
          },
        },
      },
      series: [
        {
          data: downloadCounts,
          type: "line",
          smooth: true,
          sampling: "lttb",
          lineStyle: {
            color: accent,
            width: 2.5,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: isDark ? "rgba(41,151,255,0.22)" : "rgba(0,102,204,0.18)" },
                { offset: 1, color: isDark ? "rgba(41,151,255,0.02)" : "rgba(0,102,204,0.02)" },
              ],
            },
          },
          itemStyle: {
            color: accent,
            borderColor: isDark ? "#1c1c1e" : "#fff",
            borderWidth: 2,
          },
          symbol: "circle",
          symbolSize: 6,
          emphasis: {
            itemStyle: {
              borderWidth: 2,
              shadowColor: isDark ? "rgba(41,151,255,0.45)" : "rgba(0,102,204,0.35)",
              shadowBlur: 10,
            },
          },
        },
      ],
    };

    chartInstance.current.setOption(chartOption);
    chartInstance.current.resize();

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof QueryParams) => {
    setQueryParams((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchNpmData(queryParams);
  };

  return (
    <div className={apple.shell}>
      <div className={styles.inner}>
        <header className={`${apple.pageHero} ${styles.pageHeader}`}>
          <p className={apple.eyebrow}>数据</p>
          <h1 className={apple.pageTitle}>NPM 下载统计</h1>
          <p className={apple.pageLede}>选择日期区间与包名，查看 npm registry 公开下载量并生成趋势图。</p>
        </header>

        <div className={styles.formPanel}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.formGroup}>
              <label htmlFor="start">开始日期</label>
              <input
                id="start"
                type="date"
                value={queryParams.start}
                onChange={(e) => handleInputChange(e, "start")}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="end">结束日期</label>
              <input
                id="end"
                type="date"
                value={queryParams.end}
                onChange={(e) => handleInputChange(e, "end")}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="package">包名</label>
              <input
                id="package"
                type="text"
                placeholder="例如: react, vue, angular"
                value={queryParams.package}
                onChange={(e) => handleInputChange(e, "package")}
                disabled={loading}
              />
            </div>

            <button type="submit" className={apple.primaryButton} disabled={loading}>
              {loading ? "查询中…" : "查询"}
            </button>
          </form>
        </div>

        {error ? <div className={apple.errorBanner}>{error}</div> : null}

        {loading ? <NpmDataSkeleton /> : null}

        {searched && !loading && data ? (
          <div className={styles.chartPanel}>
            <h2 className={styles.chartTitle}>趋势</h2>
            <div className={styles.chartContainer} ref={chartRef} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
