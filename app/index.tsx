// app/index.tsx
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type Priority = "high" | "medium" | "low";
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  notificationId: string | null;
}

export default function TaskManager() {
  const colorScheme = useColorScheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));

  // Theme colors
  const theme = {
    background: colorScheme === "dark" ? "#121212" : "#F7F9FC",
    card: colorScheme === "dark" ? "#1F1F1F" : "#FFFFFF",
    text: colorScheme === "dark" ? "#FFFFFF" : "#2D3748",
    secondaryText: colorScheme === "dark" ? "#A0AEC0" : "#718096",
    border: colorScheme === "dark" ? "#2D3748" : "#E2E8F0",
    primary: "#6366F1", // Indigo
    success: "#10B981", // Emerald
    danger: "#EF4444", // Red
    highPriority: "#F87171", // Red-400
    mediumPriority: "#FBBF24", // Amber-400
    lowPriority: "#34D399", // Green-400
    inputBg: colorScheme === "dark" ? "#2D2D2D" : "#EDF2F7",
  };

  // Load tasks from storage
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem("tasks");
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
          // Animate when tasks load
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }
      } catch (error) {
        console.error("Failed to load tasks", error);
      }
    };

    loadTasks();

    // Request notification permissions
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Enable notifications for task reminders"
        );
      }
    })();

    // Slide animation for header
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // Save tasks to storage
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks", error);
      }
    };

    saveTasks();
  }, [tasks]);

  // Schedule notification for new task
  const scheduleNotification = async (taskId: string, taskText: string) => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Task Reminder",
          body: `Time to complete: ${taskText}`,
          data: { taskId },
        },
        trigger: { seconds: 10 }, // 10 seconds for testing
      });

      return notificationId;
    } catch (error) {
      console.error("Failed to schedule notification", error);
      return null;
    }
  };

  // Cancel notification
  const cancelNotification = async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  // Add new task
  const addTask = async () => {
    if (!newTask.trim()) return;

    const newTaskObj: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      priority,
      notificationId: null,
    };

    // Schedule notification
    const notificationId = await scheduleNotification(
      newTaskObj.id,
      newTaskObj.text
    );
    if (notificationId) newTaskObj.notificationId = notificationId;

    setTasks((prev) => [...prev, newTaskObj]);
    setNewTask("");
    setPriority("medium");
    Keyboard.dismiss();
  };

  // Toggle task completion
  const toggleTask = async (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, completed: !task.completed };

          // Cancel notification when marked complete
          if (updatedTask.completed && task.notificationId) {
            cancelNotification(task.notificationId);
            updatedTask.notificationId = null;
          }

          return updatedTask;
        }
        return task;
      })
    );
  };

  // Delete task
  const deleteTask = (id: string) => {
    // Animation for deletion
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      const task = tasks.find((t) => t.id === id);

      // Cancel notification if exists
      if (task?.notificationId) {
        cancelNotification(task.notificationId);
      }

      setTasks((prev) => prev.filter((task) => task.id !== id));
      fadeAnim.setValue(1);
    });
  };

  // Start editing task
  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  // Save edited task
  const saveEdit = () => {
    if (!editingId || !editText.trim()) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingId ? { ...task, text: editText.trim() } : task
      )
    );

    setEditingId(null);
    setEditText("");
  };

  // Priority color mapping
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return theme.highPriority;
      case "medium":
        return theme.mediumPriority;
      case "low":
        return theme.lowPriority;
      default:
        return theme.primary;
    }
  };

  // Priority label mapping
  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Medium";
    }
  };

  // Render task item
  const renderItem = ({ item }: { item: Task }) => (
    <Animated.View
      style={[
        styles.taskItem,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
          shadowColor: colorScheme === "dark" ? "#000" : "#6366F1",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: colorScheme === "dark" ? 0.1 : 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
      ]}
    >
      <View style={styles.taskContent}>
        <TouchableOpacity
          onPress={() => toggleTask(item.id)}
          style={[
            styles.checkbox,
            item.completed && { backgroundColor: theme.success },
          ]}
        >
          {item.completed && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </TouchableOpacity>

        <View style={styles.taskTextContainer}>
          {editingId === item.id ? (
            <TextInput
              style={[
                styles.editInput,
                {
                  color: theme.text,
                  textDecorationLine: item.completed ? "line-through" : "none",
                  opacity: item.completed ? 0.7 : 1,
                },
              ]}
              value={editText}
              onChangeText={setEditText}
              autoFocus
              onSubmitEditing={saveEdit}
            />
          ) : (
            <Text
              style={[
                styles.taskText,
                {
                  color: theme.text,
                  textDecorationLine: item.completed ? "line-through" : "none",
                  opacity: item.completed ? 0.7 : 1,
                },
              ]}
              numberOfLines={2}
            >
              {item.text}
            </Text>
          )}

          <View style={styles.taskMeta}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) + "22" },
              ]}
            >
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              />
              <Text
                style={[
                  styles.priorityText,
                  { color: getPriorityColor(item.priority) },
                ]}
              >
                {getPriorityLabel(item.priority)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.taskActions}>
        {editingId === item.id ? (
          <TouchableOpacity onPress={saveEdit} style={styles.actionButton}>
            <Ionicons name="checkmark-circle" size={24} color={theme.success} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => startEditing(item)}
            style={styles.actionButton}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={theme.secondaryText}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => deleteTask(item.id)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.header, { color: theme.text }]}>My Tasks</Text>
        <Text style={[styles.subHeader, { color: theme.secondaryText }]}>
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </Text>
      </Animated.View>

      <View
        style={[
          styles.inputContainer,
          {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          },
        ]}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.inputBg,
              },
            ]}
            placeholder="Add a new task..."
            placeholderTextColor={theme.secondaryText}
            value={newTask}
            onChangeText={setNewTask}
            onSubmitEditing={addTask}
          />

          <TouchableOpacity
            style={[
              styles.priorityButton,
              styles.selectedPriority,
              { backgroundColor: getPriorityColor(priority) + "22" },
            ]}
            onPress={() =>
              setPriority(
                priority === "high"
                  ? "medium"
                  : priority === "medium"
                  ? "low"
                  : "high"
              )
            }
          >
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(priority) },
              ]}
            />
            <Text
              style={[
                styles.priorityLabel,
                { color: getPriorityColor(priority) },
              ]}
            >
              {priority.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, !newTask.trim() && { opacity: 0.5 }]}
          onPress={addTask}
          disabled={!newTask.trim()}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {tasks.length > 0 ? (
        <FlatList
          data={tasks.sort((a, b) => {
            const priorityOrder: Record<Priority, number> = {
              high: 1,
              medium: 2,
              low: 3,
            };

            return priorityOrder[a.priority] - priorityOrder[b.priority];
          })}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="checkmark-done"
            size={64}
            color={theme.secondaryText}
            style={{ opacity: 0.3 }}
          />
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            No tasks yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
            Add a task to get started
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  headerContainer: {
    marginBottom: 25,
  },
  header: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "SpaceMono",
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 25,
    backgroundColor: "transparent",
  },
  inputWrapper: {
    flexDirection: "row",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: "500",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  priorityButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  selectedPriority: {
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  addButton: {
    backgroundColor: "#6366F1",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 30,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  taskContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "700",
  },
  editInput: {
    fontSize: 16,
    fontWeight: "500",
    padding: 0,
    marginBottom: 6,
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginLeft: 10,
  },
  actionButton: {
    padding: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
});
