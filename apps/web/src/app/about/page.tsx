'use client'

import { Card, Row, Col, Typography, Timeline, Tag, Divider } from 'antd'
import {
  GithubOutlined,
  RocketOutlined,
  ApiOutlined,
  MobileOutlined,
  DesktopOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Link } = Typography

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <RocketOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
          <Title level={1}>关于 Fullstarck Monorepo</Title>
          <Paragraph style={{ fontSize: 18, color: '#666' }}>
            一个现代化的全栈 Monorepo 项目模板
          </Paragraph>
        </div>

        <Divider />

        <Title level={2}>项目简介</Title>
        <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
          Fullstarck 是一个基于 <Tag color="blue">Nx</Tag> 构建的 Monorepo 项目，
          整合了后端、Web 前端和移动端的完整解决方案。
          项目采用最新的技术栈，提供类型安全、代码共享、增量构建等企业级特性。
        </Paragraph>

        <Title level={2} style={{ marginTop: 40 }}>技术栈</Title>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Card hoverable>
              <ApiOutlined style={{ fontSize: 32, color: '#cf1322', marginBottom: 12 }} />
              <Title level={4}>后端</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li>NestJS 11.1.9</li>
                <li>TypeScript</li>
                <li>class-validator</li>
                <li>class-transformer</li>
                <li>RESTful API</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable>
              <DesktopOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 12 }} />
              <Title level={4}>Web 前端</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li>Next.js 16.0.6</li>
                <li>React 19.2.0</li>
                <li>Ant Design 5.29.1</li>
                <li>CSS Modules</li>
                <li>Turbopack</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable>
              <MobileOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 12 }} />
              <Title level={4}>移动端</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li>React Native 0.82.1</li>
                <li>React 19.2.0</li>
                <li>Gluestack UI</li>
                <li>New Architecture</li>
                <li>Metro Bundler</li>
              </ul>
            </Card>
          </Col>
        </Row>

        <Title level={2} style={{ marginTop: 40 }}>核心特性</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card>
              <SafetyOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 12 }} />
              <Title level={4}>类型安全</Title>
              <Paragraph>
                全栈 TypeScript，共享 DTO 定义，编译时类型检查，
                避免运行时错误，提供最佳开发体验。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card>
              <ThunderboltOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 12 }} />
              <Title level={4}>代码共享</Title>
              <Paragraph>
                通过 <code>@fullstarck/api-contracts</code> 和{' '}
                <code>@fullstarck/shared-utils</code> 实现跨项目代码复用。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card>
              <RocketOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 12 }} />
              <Title level={4}>增量构建</Title>
              <Paragraph>
                Nx 智能缓存和增量构建，只构建变更的部分，
                大幅提升构建速度和开发效率。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card>
              <GithubOutlined style={{ fontSize: 24, color: '#000', marginBottom: 12 }} />
              <Title level={4}>最佳实践</Title>
              <Paragraph>
                遵循各框架官方推荐的最佳实践，代码规范统一，
                易于维护和扩展。
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Title level={2} style={{ marginTop: 40 }}>开发路线</Title>
        <Timeline
          items={[
            {
              color: 'green',
              content: (
                <>
                  <p><strong>✅ Phase 1 - 基础架构</strong></p>
                  <p>搭建 Monorepo 架构，配置 Nx + pnpm</p>
                </>
              ),
            },
            {
              color: 'green',
              content: (
                <>
                  <p><strong>✅ Phase 2 - 后端开发</strong></p>
                  <p>NestJS API，数据验证，CORS 配置</p>
                </>
              ),
            },
            {
              color: 'green',
              content: (
                <>
                  <p><strong>✅ Phase 3 - Web 前端</strong></p>
                  <p>Next.js + Ant Design，页面和组件开发</p>
                </>
              ),
            },
            {
              color: 'green',
              content: (
                <>
                  <p><strong>✅ Phase 4 - 移动端</strong></p>
                  <p>React Native + Gluestack UI，iOS/Android 支持</p>
                </>
              ),
            },
            {
              color: 'blue',
              content: (
                <>
                  <p><strong>🔄 Phase 5 - 功能增强</strong></p>
                  <p>用户认证，数据持久化，更多功能模块</p>
                </>
              ),
            },
            {
              color: 'gray',
              content: (
                <>
                  <p><strong>⏳ Phase 6 - 部署上线</strong></p>
                  <p>Docker 容器化，CI/CD 配置，生产环境部署</p>
                </>
              ),
            },
          ]}
        />

        <Title level={2} style={{ marginTop: 40 }}>联系方式</Title>
        <Card>
          <Paragraph>
            <GithubOutlined style={{ marginRight: 8 }} />
            GitHub: <Link href="https://github.com" target="_blank">github.com/fullstarck</Link>
          </Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>
            如有问题或建议，欢迎提交 Issue 或 Pull Request！
          </Paragraph>
        </Card>
      </Card>
    </div>
  )
}
