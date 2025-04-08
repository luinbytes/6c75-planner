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
- **AI Integration**: [OpenRouter](https://openrouter.ai/) for natural language processing

## 🚀 Getting Started

1. **Clone and Install**
   ```bash
   git clone https://github.com/luinbytes/6c75-planner.git
   cd 6c75-planner
   npm install
   ```

2. **Environment Setup**
   1. Sign up for an OpenRouter account at [openrouter.ai](https://openrouter.ai/)
   2. Create a new API key in your OpenRouter dashboard
   3. Create a `.env.local` file in the root directory:
      ```bash
      # Required: OpenRouter API key for natural language task parsing
      # Get your key at: https://openrouter.ai/keys
      OPENROUTER_API_KEY=your_api_key_here
      
      # Optional: Your app's URL (defaults to localhost in development)
      # Only change this if deploying to production
      NEXT_PUBLIC_APP_URL=http://localhost:3000
      ```
   4. The app uses the Mistral-7B model by default. You can check your OpenRouter 
      dashboard to ensure you have access to this model.

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
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

### 🤖 Natural Language Processing
The app uses OpenRouter's AI capabilities to parse natural language into structured task data. This allows you to:
- Create tasks using everyday language
- Automatically detect due dates and times
- Infer task priorities
- Extract task descriptions
- Estimate task duration

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenRouter API key

### Setup Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development: `npm run dev`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.
