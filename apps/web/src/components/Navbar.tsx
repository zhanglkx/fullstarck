'use client'

import { Menu, Layout, Avatar, Dropdown } from 'antd'
import { HomeOutlined, BookOutlined, DashboardOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MenuProps } from 'antd'

const { Header } = Layout

export function Navbar() {
  const pathname = usePathname()

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">首页</Link>,
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">仪表盘</Link>,
    },
    {
      key: '/notes',
      icon: <BookOutlined />,
      label: <Link href="/notes">手帐</Link>,
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link href="/about">关于</Link>,
    },
  ]

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: <Link href="/profile">个人中心</Link>,
    },
    {
      key: 'settings',
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      danger: true,
    },
  ]

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
          Fullstarck
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0, border: 0 }}
        />
      </div>
      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
        <Avatar
          style={{ backgroundColor: '#87d068', cursor: 'pointer' }}
          icon={<UserOutlined />}
        />
      </Dropdown>
    </Header>
  )
}
