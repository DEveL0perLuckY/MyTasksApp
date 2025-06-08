# 📋 Task Manager App

A simple and beautiful task management app built with **React Native** and **Expo**, supporting task creation, editing, priority tagging, and local push notifications for reminders.

---

## ✨ Features

- Add, edit, and delete tasks with ease
- Set task priorities: High 🔴, Medium 🟡, Low 🟢
- Schedule local notifications for tasks
- Visual task completion tracking with checkboxes
- Offline support using AsyncStorage
- Beautiful, clean, and responsive UI
- Dark mode support

---

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Notifications**: `expo-notifications`
- **Storage**: `@react-native-async-storage/async-storage`
- **Icons**: `@expo/vector-icons` (Ionicons)

---

## 📸 Screenshots

<p align="center">
  <img src="https://github.com/DEveL0perLuckY/MyTasksApp/blob/main/img2.jpeg?raw=true" width="250" alt="Task App Screenshot" />
</p>

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/task-manager-app.git
cd task-manager-app
````

### 2. Install dependencies

```bash
npm install
# or
yarn
```

### 3. Start the development server

```bash
npx expo start
```

> ⚠️ This app uses **local notifications**. Make sure to test it on a **real device** using a **Development Build**, as **Expo Go does not support `expo-notifications` in SDK 53+**.

### 4. Create a development build (if needed)

```bash
npx expo run:android
# or
npx expo run:ios
```

---

## 📲 Download APK

👉 [Click here to download the APK](https://drive.google.com/file/d/1Y7HAs0BRSu5Z1Zveb0hQsxZYOlOyakfG/view?usp=sharing)

## 📦 Dependencies

* `expo`
* `react-native`
* `expo-notifications`
* `@react-native-async-storage/async-storage`
* `@expo/vector-icons`
* `react-navigation` (if used)

---

## 📝 Project Structure

```bash
.
├── app/
│   └── index.tsx         # Main App component
├── hooks/
│   └── useColorScheme.ts # Handles light/dark mode
├── assets/               # Images, icons (optional)
├── README.md
└── package.json
```

---

## 🙌 Author

**Lucky Mourya**
🌐 [developerlucky.in](https://developerlucky.in)
📧 [luckymourya52132@gmail.com](mailto:luckymourya52132@gmail.com)
💼 [LinkedIn](https://linkedin.com/in/lucky-mourya-968b6126b)

---

## 📄 License

This project is licensed under the MIT License.
