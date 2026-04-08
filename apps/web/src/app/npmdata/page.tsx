"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import * as echarts from "echarts";
import styles from "./page.module.scss";

interface DownloadData {
  day: string;
  downloads: number;
}

interface NpmDataResponse {
  success: boolean;
  data: {
    start: string;
    end: string;
    package: string;
    downloads: DownloadData[];
  };
}

interface QueryParams {
  start: string;
  end: string;
  package: string;
}

const ITEMS_PER_PAGE = 100; // 表格分页数

export default function NpmDataPage() {
  const [queryParams, setQueryParams] = useState<QueryParams>({
    start: "2024-01-01",
    end: "2024-01-10",
    package: "react",
  });

  const [data, setData] = useState<NpmDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [tablePageIndex, setTablePageIndex] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const isInitialMount = useRef(true);

  // 通用查询函数
  const fetchNpmData = useCallback(async (params: QueryParams) => {
    console.log("📡 开始查询:", params);
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const url = new URL(`${apiUrl}/npmdata/downloads`);

      url.searchParams.append("start", params.start);
      url.searchParams.append("end", params.end);
      url.searchParams.append("package", params.package.trim());

      console.log("🔗 API URL:", url.toString());
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result: NpmDataResponse = await response.json();

      if (!result.success) {
        throw new Error("API 返回失败");
      }

      console.log(
        `✅ 查询成功: 获取 ${result.data.downloads.length} 条记录`,
        result.data.downloads[0],
        result.data.downloads[result.data.downloads.length - 1],
      );

      // 提前计算总下载数（避免表格中重复计算）
      const total = result.data.downloads.reduce((a, b) => a + b.downloads, 0);
      setTotalDownloads(total);
      setTablePageIndex(0); // 重置表格分页

      setData(result);
      setSearched(true);
    } catch (err) {
      console.error("❌ 查询失败:", err);
      setError(err instanceof Error ? err.message : "查询失败，请重试");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化查询（仅首次加载）
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    console.log("🚀 页面初始化，执行首次查询");
    fetchNpmData(queryParams);
  }, []);

  // 自动查询（参数改变时）
  useEffect(() => {
    if (isInitialMount.current) return; // 首次加载时跳过

    let debounceTimer: NodeJS.Timeout;
    console.log("⏳ 检测到参数变化，准备防抖查询...", queryParams);

    const autoFetch = async () => {
      if (!queryParams.package.trim() || !queryParams.start || !queryParams.end) {
        console.warn("⚠️ 参数不完整，跳过查询");
        return;
      }
      await fetchNpmData(queryParams);
    };

    debounceTimer = setTimeout(autoFetch, 800);
    return () => clearTimeout(debounceTimer);
  }, [queryParams, fetchNpmData]);

  // 更新图表
  useEffect(() => {
    if (!chartRef.current || !data) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, null, {
        renderer: "canvas",
      });
    }

    const downloads = data.data.downloads;
    const days = downloads.map((d) => d.day);
    const downloadCounts = downloads.map((d) => d.downloads);

    // 计算统计数据
    const totalDownloads = downloadCounts.reduce((a, b) => a + b, 0);
    const avgDownloads = Math.round(totalDownloads / downloadCounts.length);
    const maxDownloads = Math.max(...downloadCounts);
    const minDownloads = Math.min(...downloadCounts);

    const chartOption: echarts.EChartsOption = {
      title: {
        text: `${data.data.package} 下载数据统计`,
        left: "center",
        textStyle: {
          color: "#1a202c",
          fontSize: 18,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "transparent",
        textStyle: {
          color: "#fff",
        },
        axisPointer: {
          type: "cross",
          lineStyle: {
            color: "rgba(102, 126, 234, 0.3)",
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
          color: "#718096",
          rotate: 45,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#718096",
          formatter: (value) => {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "M";
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + "K";
            }
            return value.toString();
          },
        },
        splitLine: {
          lineStyle: {
            color: "#e2e8f0",
          },
        },
      },
      series: [
        {
          data: downloadCounts,
          type: "line",
          smooth: true,
          lineStyle: {
            color: "#667eea",
            width: 3,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(102, 126, 234, 0.3)" },
                { offset: 1, color: "rgba(102, 126, 234, 0.05)" },
              ],
            },
          },
          itemStyle: {
            color: "#667eea",
            borderColor: "#fff",
            borderWidth: 2,
          },
          symbol: "circle",
          symbolSize: 6,
          emphasis: {
            itemStyle: {
              borderWidth: 2,
              shadowColor: "rgba(102, 126, 234, 0.5)",
              shadowBlur: 10,
            },
          },
        },
      ],
    };

    chartInstance.current.setOption(chartOption);

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
    console.log("🔘 用户手动点击查询按钮");
    await fetchNpmData(queryParams);
  };
  const getStats = () => {
    if (!data) return null;

    const downloads = data.data.downloads.map((d) => d.downloads);
    const total = downloads.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / downloads.length);
    const max = Math.max(...downloads);
    const maxDay = data.data.downloads.find((d) => d.downloads === max)?.day;

    return { total, avg, max, maxDay };
  };

  const stats = getStats();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>📊 NPM 包下载统计</h1>
          <p>查询任意npm包的下载数据并实时可视化</p>
        </div>

        {/* 搜索表单 */}
        <div className={styles.searchCard}>
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

            <button type="submit" className={styles.searchButton} disabled={loading}>
              {loading ? "查询中..." : "🔍 查询"}
            </button>
          </form>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className={styles.errorContainer}>
            <h3>⚠️ 错误</h3>
            <p>{error}</p>
          </div>
        )}

        {/* 加载中 */}
        {loading && (
          <div className={styles.chartCard}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>正在加载数据...</p>
            </div>
          </div>
        )}

        {/* 数据展示 */}
        {searched && !loading && data && (
          <>
            {/* 统计卡片 */}
            {stats && (
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>总下载数</div>
                  <div className={styles.statValue}>{(stats.total / 1000000).toFixed(2)}M</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>平均日下载</div>
                  <div className={styles.statValue}>{(stats.avg / 1000).toFixed(1)}K</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>最高下载日</div>
                  <div className={styles.statValue}>{stats.maxDay}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>最高下载数</div>
                  <div className={styles.statValue}>{(stats.max / 1000000).toFixed(2)}M</div>
                </div>
              </div>
            )}

            {/* 图表 */}
            <div className={styles.chartCard}>
              <h2>📈 下载趋势图</h2>
              <div className={styles.chartContainer} ref={chartRef}></div>
            </div>

            {/* 数据表格 - 分页显示 */}
            <div className={styles.tableCard}>
              <h2>📋 详细数据</h2>
              <div className={styles.tableStats}>
                共 {data.data.downloads.length} 条记录 | 显示第{" "}
                {Math.min(tablePageIndex * ITEMS_PER_PAGE + 1, data.data.downloads.length)} -{" "}
                {Math.min((tablePageIndex + 1) * ITEMS_PER_PAGE, data.data.downloads.length)} 条
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>下载数</th>
                      <th>百分比</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.downloads
                      .slice(tablePageIndex * ITEMS_PER_PAGE, (tablePageIndex + 1) * ITEMS_PER_PAGE)
                      .map((item) => {
                        const percentage = ((item.downloads / totalDownloads) * 100).toFixed(2);
                        return (
                          <tr key={item.day}>
                            <td>{item.day}</td>
                            <td>{item.downloads.toLocaleString()}</td>
                            <td>{percentage}%</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* 分页按钮 */}
              {data.data.downloads.length > ITEMS_PER_PAGE && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => setTablePageIndex(Math.max(0, tablePageIndex - 1))}
                    disabled={tablePageIndex === 0}
                  >
                    ← 上一页
                  </button>
                  <span>
                    页 {tablePageIndex + 1} /{" "}
                    {Math.ceil(data.data.downloads.length / ITEMS_PER_PAGE)}
                  </span>
                  <button
                    onClick={() =>
                      setTablePageIndex(
                        Math.min(
                          Math.ceil(data.data.downloads.length / ITEMS_PER_PAGE) - 1,
                          tablePageIndex + 1,
                        ),
                      )
                    }
                    disabled={(tablePageIndex + 1) * ITEMS_PER_PAGE >= data.data.downloads.length}
                  >
                    下一页 →
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* 空状态 */}
        {!data && !loading && !error && (
          <div className={styles.chartCard}>
            <div className={styles.emptyState}>
              <p>输入包名并点击查询按钮开始</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
