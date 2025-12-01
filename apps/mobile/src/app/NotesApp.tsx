import React, { useEffect, useState } from 'react'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import { config } from '../../gluestack-ui.config'
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from 'react-native'
import {
  Box,
  Text,
  Heading,
  Button,
  ButtonText,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  TextareaInput,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckIcon,
  Icon,
  CloseIcon,
} from '@gluestack-ui/themed'
import { CreateNoteDto, NoteDto } from '@fullstarck/api-contracts'

const API_URL = 'http://localhost:3333/api'

export const NotesApp = () => {
  const [notes, setNotes] = useState<NoteDto[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingNote, setEditingNote] = useState<NoteDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/notes`)
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error('获取手帐失败', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchNotes()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return

    try {
      const noteData: CreateNoteDto = { title, content }

      if (editingNote) {
        await fetch(`${API_URL}/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData),
        })
      } else {
        await fetch(`${API_URL}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData),
        })
      }

      setIsModalVisible(false)
      setTitle('')
      setContent('')
      setEditingNote(null)
      fetchNotes()
    } catch (error) {
      console.error('保存失败', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' })
      fetchNotes()
    } catch (error) {
      console.error('删除失败', error)
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
      console.error('更新失败', error)
    }
  }

  const openEditModal = (note: NoteDto) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setIsModalVisible(true)
  }

  const closeModal = () => {
    setIsModalVisible(false)
    setTitle('')
    setContent('')
    setEditingNote(null)
  }

  return (
    <GluestackUIProvider config={config}>
      <SafeAreaView style={styles.container}>
        <Box style={styles.flex}>
          <View style={styles.header}>
            <Heading style={styles.headerTitle}>我的手帐</Heading>
            <Button
              onPress={() => {
                setEditingNote(null)
                setTitle('')
                setContent('')
                setIsModalVisible(true)
              }}
            >
              <ButtonText>+ 新建</ButtonText>
            </Button>
          </View>

          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {loading && notes.length === 0 ? (
              <Box style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9333ea" />
              </Box>
            ) : (
              <View style={styles.notesList}>
                {notes.map((note) => (
                  <Box key={note.id} style={styles.noteCard}>
                    <View style={styles.noteCardContent}>
                      <View style={styles.noteRow}>
                        <TouchableOpacity
                          onPress={() => handleToggleComplete(note)}
                          style={styles.checkboxContainer}
                        >
                          <Checkbox
                            value={note.id}
                            isChecked={note.isCompleted}
                            onChange={() => handleToggleComplete(note)}
                          >
                            <CheckboxIndicator>
                              <CheckboxIcon as={CheckIcon} />
                            </CheckboxIndicator>
                          </Checkbox>
                        </TouchableOpacity>
                        <View style={styles.noteContent}>
                          <Text
                            style={[
                              styles.noteTitle,
                              note.isCompleted && styles.completedText,
                            ]}
                          >
                            {note.title}
                          </Text>
                          <Text
                            style={[
                              styles.noteDescription,
                              note.isCompleted && styles.completedText,
                            ]}
                          >
                            {note.content}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.buttonRow}>
                        <Button
                          onPress={() => openEditModal(note)}
                          style={styles.editButton}
                        >
                          <ButtonText>编辑</ButtonText>
                        </Button>
                        <Button
                          onPress={() => handleDelete(note.id)}
                          style={styles.deleteButton}
                        >
                          <ButtonText>删除</ButtonText>
                        </Button>
                      </View>
                    </View>
                  </Box>
                ))}
              </View>
            )}
          </ScrollView>

          <Modal isOpen={isModalVisible} onClose={closeModal}>
            <ModalBackdrop />
            <ModalContent>
              <ModalHeader>
                <Heading>{editingNote ? '编辑手帐' : '新建手帐'}</Heading>
                <ModalCloseButton>
                  <Icon as={CloseIcon} />
                </ModalCloseButton>
              </ModalHeader>
              <ModalBody>
                <View style={styles.modalBody}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>标题</Text>
                    <Input>
                      <InputField
                        placeholder="输入标题"
                        value={title}
                        onChangeText={setTitle}
                      />
                    </Input>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>内容</Text>
                    <Textarea>
                      <TextareaInput
                        placeholder="输入内容"
                        value={content}
                        onChangeText={setContent}
                      />
                    </Textarea>
                  </View>
                </View>
              </ModalBody>
              <ModalFooter>
                <View style={styles.modalFooter}>
                  <Button onPress={closeModal} style={styles.cancelButton}>
                    <ButtonText>取消</ButtonText>
                  </Button>
                  <Button onPress={handleSave} style={styles.saveButton}>
                    <ButtonText>保存</ButtonText>
                  </Button>
                </View>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </SafeAreaView>
    </GluestackUIProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: '#9333ea',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  notesList: {
    gap: 16,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noteCardContent: {
    gap: 12,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxContainer: {
    marginTop: 4,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  noteDescription: {
    fontSize: 14,
    color: '#666',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  modalBody: {
    gap: 16,
  },
  inputContainer: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
})

export default NotesApp
