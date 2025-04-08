# 📝 6c75 Planner

A modern, minimalist task planner built with Next.js and shadcn/ui. Manage your tasks with an elegant and responsive interface.

## ✨ Features

### 🎯 Task Management
- ⚡ Quick task input with natural language processing
- ✅ One-click task completion
- 🔄 Task statuses (Todo, In Progress, Completed, Archived)
- 🚨 Priority levels with auto-urgency calculation
- 📅 Due dates with calendar selection
- ⏱️ Time estimation
- 📝 Rich task descriptions
- 🎨 Visual status indicators

### 🎨 User Interface
- 🌓 Dark/Light mode support
- 📱 Fully responsive design
- ✨ Smooth animations and transitions
- 🔔 Toast notifications
- 🔍 Advanced filtering and sorting
- 🎯 Simple/Advanced mode toggle
- 👀 Task preview before creation

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/)

## 🚀 Getting Started

1. **Clone and Install**
   ```bash
   git clone https://github.com/luinbytes/6c75-planner.git
   cd 6c75-planner
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Application**
   Visit `http://localhost:3000` in your browser

## 📁 Project Structure

```
src/
├── app/                # Next.js app router pages
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── TaskList.tsx   # Task list with filters
│   ├── TaskForm.tsx   # Task creation/editing
│   └── QuickTaskInput.tsx # Natural language input
├── lib/               # Utilities and helpers
└── types/             # TypeScript definitions
```

## 💡 Usage Guide

### 📋 Task Management
- Type naturally in the quick input bar (e.g., "Finish report by Friday 5pm")
- Use "New Task" button for detailed task creation
- Toggle between simple and advanced modes
- Enable auto-urgency for smart priority setting
- Filter and sort tasks by various criteria
- Use checkboxes for quick completion

### ⚙️ Settings
- Toggle dark/light mode
- Switch between simple and advanced views
- Configure auto-urgency preferences

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Start development: `npm run dev`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.
