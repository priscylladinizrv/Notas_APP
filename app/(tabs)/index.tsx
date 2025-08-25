import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

import { ThemedText } from '@/components/ThemedText';
import * as DB from '@/services/database';
import { Task } from '@/services/database';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const loadTasks = async () => {
    try {
      const fetchedTasks = await DB.fetchTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks', error);
      Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
    }
  };

  useEffect(() => {
    DB.init()
      .then(() => {
        loadTasks();
      })
      .catch(err => {
        console.log('Database initialization failed', err);
        Alert.alert('Erro', 'Falha ao inicializar o banco de dados.');
      });
  }, []);

  const addTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        await DB.addTask(newTaskTitle.trim(), newTaskDescription.trim());
        setNewTaskTitle('');
        setNewTaskDescription('');
        setIsAddModalVisible(false);
        loadTasks();
      } catch (error) {
        console.error('Failed to add task', error);
        Alert.alert('Erro', 'Não foi possível adicionar a tarefa.');
      }
    }
  };

  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      try {
        await DB.updateTaskStatus(id, !task.done);
        loadTasks();
      } catch (error) {
        console.error('Failed to update task', error);
        Alert.alert('Erro', 'Não foi possível atualizar a tarefa.');
      }
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await DB.deleteTask(id);
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
      Alert.alert('Erro', 'Não foi possível deletar a tarefa.');
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsModalVisible(true);
  };

  const saveEdit = async () => {
    if (editingTask && editTitle.trim()) {
      try {
        await DB.updateTask(editingTask.id, editTitle.trim(), editDescription.trim());
        setIsModalVisible(false);
        setEditingTask(null);
        setEditTitle('');
        setEditDescription('');
        loadTasks();
      } catch (error) {
        console.error('Failed to update task', error);
        Alert.alert('Erro', 'Não foi possível atualizar a tarefa.');
      }
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingTask(null);
    setEditTitle('');
    setEditDescription('');
  };

  const getRandomColor = (id: number) => {
    const colors = [
      '#845ec2',
      '#f3c5ff',
      '#00c9a7',
      '#fefedf',
    ];
    return colors[id % colors.length];
  };

  const renderTask = ({ item, index }: { item: Task; index: number }) => (
    <TouchableOpacity
      style={[
        styles.taskCard,
        { backgroundColor: getRandomColor(item.id) },
        item.done && styles.completedTaskCard
      ]}
      onPress={() => openEditModal(item)}
      activeOpacity={0.8}
    >
      <View style={styles.taskCardContent}>
        <ThemedText style={styles.taskCardTitle}>
          {item.title}
        </ThemedText>
        {item.description && (
          <ThemedText style={styles.taskCardDescription}>
            {item.description}
          </ThemedText>
        )}
      </View>
      
      <View style={styles.taskCardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleTask(item.id)}
        >
          <Ionicons
            name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color="black"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteTask(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="black" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Minhas Notas</ThemedText>
        <View style={styles.headerActions}>
         
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id.toString()}
          style={styles.taskList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.taskListContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#666" />
              <ThemedText style={styles.emptyText}>
                Nenhuma nota ainda
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Toque no botão + para adicionar sua primeira nota!
              </ThemedText>
            </View>
          }
        />
      </View>
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
      
      <Modal
        isVisible={isAddModalVisible}
        onBackdropPress={() => setIsAddModalVisible(false)}
        onBackButtonPress={() => setIsAddModalVisible(false)}
        style={styles.modal}
        avoidKeyboard={true}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Adicionar Nova Nota</ThemedText>
            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.editInput}
            placeholder="Título da nota..."
            placeholderTextColor="#999"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />
          
          <TextInput
            style={styles.editDescriptionInput}
            placeholder="Descrição da nota (opcional)..."
            placeholderTextColor="#999"
            value={newTaskDescription}
            onChangeText={setNewTaskDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            scrollEnabled={true}
          />
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={addTask}
          >
            <ThemedText style={styles.saveButtonText}>Adicionar Nota</ThemedText>
          </TouchableOpacity>
        </View>
      </Modal>
      
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        style={styles.modal}
        avoidKeyboard={true}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Editar Nota</ThemedText>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.editInput}
            placeholder="Título da nota..."
            placeholderTextColor="#999"
            value={editTitle}
            onChangeText={setEditTitle}
          />
          
          <TextInput
            style={styles.editDescriptionInput}
            placeholder="Descrição da nota (opcional)..."
            value={editDescription}
            onChangeText={setEditDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            scrollEnabled={true}
          />
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveEdit}
          >
            <ThemedText style={styles.saveButtonText}>Salvar</ThemedText>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
    backgroundColor: '#2D2D2D', 
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 20, 
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  taskCardContent: {
    flex: 1,
  },
  taskCardTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskCardDescription: {
    color: 'black',
    fontSize: 14,
  },
  taskCardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
  },
  completedTaskCard: {
    opacity: 0.7,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
  },
  modalContent: {
    backgroundColor: '#2D2D2D', 
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    paddingTop: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  editInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#333333',
    color: 'white',
    marginBottom: 15,
  },
  editDescriptionInput: {
    minHeight: 80,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 14,
    backgroundColor: '#333333',
    color: 'white',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    opacity: 0.7,
    color: 'white',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.5,
    textAlign: 'center',
    color: '#B0B0B0',
  },
});
