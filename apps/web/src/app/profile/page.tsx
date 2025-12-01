'use client'

import { Card, Row, Col, Avatar, Descriptions, Tag, Button, Statistic, List, Typography } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EditOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

export default function ProfilePage() {
  // Mock user data
  const user = {
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '+86 138 1234 5678',
    location: '北京市朝阳区',
    joinDate: '2024-01-15',
    avatar: '',
    bio: '全栈开发工程师，热爱技术，喜欢尝试新事物。',
  }

  const stats = {
    totalNotes: 24,
    completedNotes: 18,
    activeDays: 45,
  }

  const recentActivities = [
    { action: '创建了新手帐', title: '学习 React 19', time: '2 小时前' },
    { action: '完成了手帐', title: '购物清单', time: '5 小时前' },
    { action: '更新了手帐', title: '项目计划', time: '1 天前' },
    { action: '创建了新手帐', title: '读书笔记', time: '2 天前' },
  ]

  const achievements = [
    { title: '早起鸟', description: '连续7天早上8点前完成第一个任务', icon: '🌅' },
    { title: '高产作家', description: '创建了超过20个手帐', icon: '✍️' },
    { title: '完美主义', description: '完成率达到75%以上', icon: '🎯' },
    { title: '坚持者', description: '连续使用45天', icon: '💪' },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Row gutter={[16, 16]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={user.avatar}
                style={{ backgroundColor: '#87d068' }}
              />
              <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
                {user.name}
              </Title>
              <Tag color="blue">Pro 用户</Tag>
            </div>

            <Paragraph
              style={{
                textAlign: 'center',
                color: '#666',
                marginBottom: 24,
                padding: '0 16px',
              }}
            >
              {user.bio}
            </Paragraph>

            <Descriptions column={1} size="small">
              <Descriptions.Item
                label={
                  <span>
                    <MailOutlined style={{ marginRight: 8 }} />
                    邮箱
                  </span>
                }
              >
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    电话
                  </span>
                }
              >
                {user.phone}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    位置
                  </span>
                }
              >
                {user.location}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    加入日期
                  </span>
                }
              >
                {user.joinDate}
              </Descriptions.Item>
            </Descriptions>

            <Button
              type="primary"
              icon={<EditOutlined />}
              block
              style={{ marginTop: 16 }}
            >
              编辑个人资料
            </Button>
          </Card>
        </Col>

        {/* Statistics and Activities */}
        <Col xs={24} lg={16}>
          {/* Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="总手帐数"
                  value={stats.totalNotes}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="已完成"
                  value={stats.completedNotes}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="活跃天数"
                  value={stats.activeDays}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Recent Activities */}
          <Card title="最近活动" style={{ marginBottom: 16 }}>
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <span>
                        {item.action} <strong>{item.title}</strong>
                      </span>
                    }
                    description={<span style={{ color: '#999' }}>{item.time}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Achievements */}
          <Card title={<span><TrophyOutlined style={{ marginRight: 8 }} />成就徽章</span>}>
            <Row gutter={[16, 16]}>
              {achievements.map((achievement, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card hoverable style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{achievement.icon}</div>
                    <Title level={5} style={{ marginBottom: 8 }}>
                      {achievement.title}
                    </Title>
                    <Paragraph
                      style={{ marginBottom: 0, color: '#666', fontSize: 12 }}
                    >
                      {achievement.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
