'use client'

import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Progress, List, Tag, Typography } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import type { NoteDto } from '@fullstarck/api-contracts'

const { Title, Paragraph } = Typography

const API_URL = 'http://localhost:3333/api'

export default function DashboardPage() {
  const [notes, setNotes] = useState<NoteDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/notes`)
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const completedCount = notes.filter((note) => note.isCompleted).length
  const totalCount = notes.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const recentNotes = notes.slice(0, 5)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        仪表盘
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="总手帐数"
              value={totalCount}
              prefix={<BookOutlined />}
              styles={{ value: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="已完成"
              value={completedCount}
              prefix={<CheckCircleOutlined />}
              styles={{ value: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="进行中"
              value={totalCount - completedCount}
              prefix={<ClockCircleOutlined />}
              styles={{ value: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="完成率"
              value={completionRate}
              suffix="%"
              prefix={<TrophyOutlined />}
              styles={{ value: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Progress Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <TrophyOutlined style={{ marginRight: 8 }} />
                完成进度
              </span>
            }
            loading={loading}
          >
            <div style={{ padding: '20px 0' }}>
              <Progress
                type="circle"
                percent={completionRate}
                format={(percent) => `${percent}%`}
                size={180}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Paragraph>
                  你已经完成了 <strong>{completedCount}</strong> 个手帐，
                  还有 <strong>{totalCount - completedCount}</strong> 个待完成。
                </Paragraph>
                <Link href="/notes">
                  <a style={{ color: '#1890ff' }}>查看所有手帐 →</a>
                </Link>
              </div>
            </div>
          </Card>
        </Col>

        {/* Recent Notes */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <CalendarOutlined style={{ marginRight: 8 }} />
                最近的手帐
              </span>
            }
            loading={loading}
            extra={<Link href="/notes">查看全部</Link>}
          >
            <List
              dataSource={recentNotes}
              locale={{ emptyText: '暂无手帐记录' }}
              renderItem={(note) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <span>
                        {note.title}
                        {note.isCompleted && (
                          <Tag color="success" style={{ marginLeft: 8 }}>
                            已完成
                          </Tag>
                        )}
                      </span>
                    }
                    description={
                      <Paragraph
                        ellipsis={{ rows: 1 }}
                        style={{ marginBottom: 0, color: '#666' }}
                      >
                        {note.content}
                      </Paragraph>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card
        title="快速操作"
        style={{ marginTop: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Link href="/notes">
              <Card hoverable style={{ textAlign: 'center', cursor: 'pointer' }}>
                <BookOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                <div>管理手帐</div>
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={8}>
            <Link href="/profile">
              <Card hoverable style={{ textAlign: 'center', cursor: 'pointer' }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                <div>个人中心</div>
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={8}>
            <Link href="/about">
              <Card hoverable style={{ textAlign: 'center', cursor: 'pointer' }}>
                <TrophyOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
                <div>关于项目</div>
              </Card>
            </Link>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
