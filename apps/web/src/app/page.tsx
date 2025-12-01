'use client'

import { Button, Card, Row, Col, Statistic, Typography } from 'antd'
import {
  RocketOutlined,
  ApiOutlined,
  MobileOutlined,
  DesktopOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import styles from './page.module.css'

const { Title, Paragraph } = Typography

export default function Index() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          marginBottom: 24,
        }}
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <RocketOutlined style={{ fontSize: 64, marginBottom: 16 }} />
          <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
            欢迎来到 Fullstarck Monorepo
          </Title>
          <Paragraph style={{ fontSize: 18, color: 'white', maxWidth: 600, margin: '0 auto 24px' }}>
            基于 Nx 的现代化全栈 Monorepo 项目，包含 NestJS 后端、Next.js Web 端和 React Native 移动端。
          </Paragraph>
          <Link href="/notes">
            <Button type="primary" size="large" ghost>
              开始使用 手帐应用
            </Button>
          </Link>
        </div>
      </Card>

      {/* Stats Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="React 版本"
              value="19.2"
              prefix={<ThunderboltOutlined />}
              suffix="最新"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Next.js 版本"
              value="16.0"
              prefix={<DesktopOutlined />}
              suffix="Turbopack"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="NestJS 版本"
              value="11.1"
              prefix={<ApiOutlined />}
              suffix="最新"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="RN 版本"
              value="0.82"
              prefix={<MobileOutlined />}
              suffix="New Arch"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Features Section */}
      <Title level={2} style={{ marginBottom: 16 }}>
        核心特性
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card hoverable>
            <ApiOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>强大的后端</Title>
            <Paragraph>
              使用 NestJS + TypeScript 构建的 RESTful API，支持数据验证、CORS、依赖注入等企业级特性。
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card hoverable>
            <DesktopOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>现代化 Web</Title>
            <Paragraph>
              Next.js 16 + Ant Design 5 + CSS Modules，支持 SSR、App Router、Turbopack 快速构建。
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card hoverable>
            <MobileOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 16 }} />
            <Title level={4}>原生移动端</Title>
            <Paragraph>
              React Native 0.82 + Gluestack UI，支持 iOS/Android，启用新架构提供更好的性能。
            </Paragraph>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card hoverable>
            <SafetyOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 16 }} />
            <Title level={4}>类型安全</Title>
            <Paragraph>
              全栈 TypeScript，共享 DTO 和类型定义，编译时捕获错误，提供最佳开发体验。
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card hoverable>
            <ThunderboltOutlined style={{ fontSize: 32, color: '#eb2f96', marginBottom: 16 }} />
            <Title level={4}>Monorepo 架构</Title>
            <Paragraph>
              Nx + pnpm 管理多应用和库，代码共享、增量构建、智能缓存，大幅提升开发效率。
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
