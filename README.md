# Planner Web Application

A modern, user-friendly planner application built with Next.js and shadcn/ui. Manage your tasks, routines, and habits with an elegant and responsive interface.

## Features

### Task Management
- Create, edit, and delete tasks
- Quick task completion with one click
- Priority levels (Low, Medium, High, Urgent)
- Task statuses (Todo, In Progress, Completed, Archived)
- Due dates with calendar selection
- Time estimation
- Task descriptions and notes
- Visual indicators for task status and priority

### User Interface
- Clean and modern design
- Dark mode support
- Responsive layout
- Loading states and animations
- Intuitive navigation
- Elegant form dialogs

## Tech Stack

- **Framework**: Next.js 14
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **Date Handling**: date-fns
- **State Management**: React Hooks
- **Data Persistence**: Local Storage

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Application**
   Navigate to `http://localhost:3000` in your browser

## Project Structure

```
src/
├── components/         # React components
│   ├── TaskList.tsx   # Task list display
│   ├── TaskForm.tsx   # Task creation/editing form
│   └── ui/            # shadcn/ui components
├── lib/
│   └── storage.ts     # Local storage utilities
├── types/
│   └── task.ts        # TypeScript interfaces
└── app/               # Next.js pages
```

## Usage

### Managing Tasks
- Click "Add Task" to create a new task
- Use the checkmark button to toggle task completion
- Edit tasks using the pencil icon
- Delete tasks using the trash icon
- View task details including priority, status, and due date

### Navigation
- Use the back arrow to return to the dashboard
- Access different sections from the main navigation

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.
