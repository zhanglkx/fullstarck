import Link from "next/link";
import apple from "@/styles/apple-page.module.scss";
import styles from "./page.module.scss";

const destinations = [
  {
    href: "/api-test",
    tag: "连接",
    title: "API 连通性",
    subtitle: "并行探测健康检查与元数据，确认前后端在同一链路。",
  },
  {
    href: "/serverstate",
    tag: "观测",
    title: "服务器状态",
    subtitle: "CPU、内存、磁盘与系统信息，支持自动或手动刷新。",
  },
  {
    href: "/npmdata",
    tag: "数据",
    title: "NPM 下载趋势",
    subtitle: "按时间区间拉取下载量，并以图表呈现变化。",
  },
  {
    href: "/qrcode",
    tag: "流程",
    title: "二维码演示",
    subtitle: "生成码、轮询状态并衔接确认页，串联完整交互。",
  },
] as const;

export default function Home() {
  return (
    <div className={`${apple.shell} ${styles.homeShell}`}>
      <header className={styles.heroBand} aria-labelledby="home-heading">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>全栈实验室</p>
          <h1 id="home-heading" className={styles.headline}>
            少即是多。
            <span className={styles.headlineBreak}>工具与演示，一目了然。</span>
          </h1>
          <p className={styles.lede}>
            排版优先于装饰：足够的留白、稳定的字重层级，以及只在必要时出现的强调色。这里不是复刻任何品牌站点，而是借用那种
            &ldquo;内容先于炫技&rdquo; 的克制。
          </p>
        </div>
      </header>

      <section className={styles.explore} aria-labelledby="explore-heading">
        <div className={styles.exploreHead}>
          <h2 id="explore-heading" className={styles.exploreTitle}>
            入口
          </h2>
          <p className={styles.exploreHint}>以下模块均为本仓库内置示例，点击卡片前往。</p>
        </div>

        <ul className={styles.cardList}>
          {destinations.map((item, index) => (
            <li key={item.href} className={styles.cardCell}>
              <Link href={item.href} className={styles.card}>
                <span className={styles.cardIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.cardTag}>{item.tag}</span>
                <span className={styles.cardTitle}>{item.title}</span>
                <span className={styles.cardSubtitle}>{item.subtitle}</span>
                <span className={styles.cardAction}>
                  <span className={styles.cardActionText}>打开</span>
                  <span className={styles.cardChevron} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
