"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import * as echarts from "echarts";
import { apiGet } from "@/lib/api-client";

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

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const isInitialMount = useRef(true);
  const prevChartRefDOM = useRef<HTMLDivElement | null>(null);

  // 通用查询函数
  const fetchNpmData = useCallback(async (params: QueryParams) => {
    console.log("📡 开始查询:", params);
    try {
      setLoading(true);
      setError(null);

      console.log("🔗 使用 Axios 发送请求...");
      const result = await apiGet<NpmDataResponse>("/npmdata/downloads", {
        params: {
          start: params.start,
          end: params.end,
          package: params.package.trim(),
        },
      });

      if (!result.success) {
        throw new Error("API 返回失败");
      }

      console.log(
        `✅ 查询成功: 获取 ${result.data.downloads.length} 条记录`,
        result.data.downloads[0],
        result.data.downloads[result.data.downloads.length - 1],
      );

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
  }, [fetchNpmData, queryParams]);

  // 🔧 新增：组件卸载时清理 ECharts 实例
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // 更新图表 - 关键：监听 DOM 节点和数据的变化
  useEffect(() => {
    if (!chartRef.current || !data) return;

    // 🔧 关键检测：DOM 节点是否被替换了
    if (prevChartRefDOM.current !== chartRef.current) {
      console.log("🔄 检测到 DOM 节点被替换，销毁旧实例");
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
      prevChartRefDOM.current = chartRef.current;
    }

    // 初始化或重新初始化 ECharts
    if (!chartInstance.current) {
      console.log("✨ 创建新的 ECharts 实例");
      chartInstance.current = echarts.init(chartRef.current, null, {
        renderer: "canvas",
        useDirtyRect: true,
      });
    }

    const downloads = data.data.downloads;
    const days = downloads.map((d) => d.day);
    const downloadCounts = downloads.map((d) => d.downloads);

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
          sampling: "lttb",
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
    <div className="min-h-screen bg-gradient-purple p-8 sm:p-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center text-white mb-8">
          <h1 className="text-[2.5rem] font-bold m-0 mb-2">📊 NPM 包下载统计</h1>
          <p className="text-[1.1rem] opacity-90 m-0">查询任意npm包的下载数据并实时可视化</p>
        </div>

        {/* 搜索表单 */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-4 gap-4 items-end lg:grid-cols-2 sm:grid-cols-1"
          >
            <div className="flex flex-col">
              <label
                htmlFor="start"
                className="text-[0.875rem] font-semibold text-[#485563] mb-2 uppercase tracking-[0.5px]"
              >
                开始日期
              </label>
              <input
                id="start"
                type="date"
                value={queryParams.start}
                onChange={(e) => handleInputChange(e, "start")}
                disabled={loading}
                className="px-4 py-3 border-2 border-[#e2e8f0] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="end"
                className="text-[0.875rem] font-semibold text-[#485563] mb-2 uppercase tracking-[0.5px]"
              >
                结束日期
              </label>
              <input
                id="end"
                type="date"
                value={queryParams.end}
                onChange={(e) => handleInputChange(e, "end")}
                disabled={loading}
                className="px-4 py-3 border-2 border-[#e2e8f0] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="package"
                className="text-[0.875rem] font-semibold text-[#485563] mb-2 uppercase tracking-[0.5px]"
              >
                包名
              </label>
              <input
                id="package"
                type="text"
                placeholder="例如: react, vue, angular"
                value={queryParams.package}
                onChange={(e) => handleInputChange(e, "package")}
                disabled={loading}
                className="px-4 py-3 border-2 border-[#e2e8f0] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-purple text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 uppercase tracking-[0.5px] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(102,126,234,0.3)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "查询中..." : "🔍 查询"}
            </button>
          </form>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-[#fed7d7] border-2 border-[#fc8181] rounded-lg p-8 mb-8 text-[#c53030]">
            <h3 className="m-0 mb-2 text-xl">⚠️ 错误</h3>
            <p className="m-0">{error}</p>
          </div>
        )}

        {/* 加载中 */}
        {loading && (
          <div className="bg-white rounded-xl p-8 mb-8 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
            <div className="flex justify-center items-center min-h-[400px] flex-col gap-4">
              <div className="w-[50px] h-[50px] border-4 border-[#667eea]/30 border-t-[#667eea] rounded-full animate-spin-slow"></div>
              <p>正在加载数据...</p>
            </div>
          </div>
        )}

        {/* 数据展示 */}
        {searched && !loading && data && (
          <>
            {/* 图表 */}
            <div className="bg-white rounded-xl p-8 mb-8 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
              <h2 className="text-2xl text-[#1a202c] m-0 mb-6">📈 下载趋势图</h2>
              <div className="w-full h-[400px] rounded-lg bg-[#f7fafc]" ref={chartRef}></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
