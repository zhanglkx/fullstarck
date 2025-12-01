'use client'

import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, List, Checkbox, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { CreateNoteDto, NoteDto } from '@fullstarck/api-contracts'
import styles from './notes.module.css'

const API_URL = 'http://localhost:3333/api'

export function NotesPage() {
  const [notes, setNotes] = useState<NoteDto[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteDto | null>(null)
  const [form] = Form.useForm()

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/notes`)
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      message.error('获取手帐失败')
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleCreate = async (values: CreateNoteDto) => {
    try {
      if (editingNote) {
        await fetch(`${API_URL}/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
        message.success('更新成功')
      } else {
        await fetch(`${API_URL}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
        message.success('创建成功')
      }
      setIsModalOpen(false)
      setEditingNote(null)
      form.resetFields()
      fetchNotes()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' })
      message.success('删除成功')
      fetchNotes()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleToggleComplete = async (note: NoteDto) => {
    try {
      await fetch(`${API_URL}/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !note.isCompleted }),
      })
      fetchNotes()
    } catch (error) {
      message.error('更新失败')
    }
  }

  const openEditModal = (note: NoteDto) => {
    setEditingNote(note)
    form.setFieldsValue(note)
    setIsModalOpen(true)
  }

  return (
    <div className={styles.container}>
      <Card 
        title="我的手帐" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingNote(null)
              form.resetFields()
              setIsModalOpen(true)
            }}
          >
            新建手帐
          </Button>
        }
        className={styles.card}
      >
        <List
          dataSource={notes}
          renderItem={(note) => (
            <List.Item
              actions={[
                <Button 
                  key="edit"
                  icon={<EditOutlined />} 
                  onClick={() => openEditModal(note)}
                />,
                <Button 
                  key="delete"
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(note.id)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Checkbox
                    checked={note.isCompleted}
                    onChange={() => handleToggleComplete(note)}
                  />
                }
                title={
                  <span style={{ textDecoration: note.isCompleted ? 'line-through' : 'none' }}>
                    {note.title}
                  </span>
                }
                description={note.content}
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={editingNote ? '编辑手帐' : '新建手帐'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingNote(null)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题!' }]}
          >
            <Input placeholder="输入标题" />
          </Form.Item>

          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入内容!' }]}
          >
            <Input.TextArea rows={4} placeholder="输入内容" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingNote ? '更新' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default NotesPage
