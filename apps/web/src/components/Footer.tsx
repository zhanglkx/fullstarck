'use client'

import { Layout } from 'antd'
import { GithubOutlined, HeartFilled } from '@ant-design/icons'

const { Footer: AntFooter } = Layout

export function Footer() {
  return (
    <AntFooter
      style={{
        textAlign: 'center',
        background: '#fafafa',
        borderTop: '1px solid #f0f0f0',
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#666', marginRight: 16 }}
        >
          <GithubOutlined style={{ fontSize: 18 }} />
        </a>
      </div>
      <div style={{ color: '#666' }}>
        Fullstarck Monorepo ©{new Date().getFullYear()} Created with{' '}
        <HeartFilled style={{ color: '#ff4d4f' }} /> by Nx + Next.js + NestJS
      </div>
    </AntFooter>
  )
}
