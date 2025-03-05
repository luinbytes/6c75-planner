import { Task, Habit, CommandResponse } from '../types';

class CommandHandler {
  private tasks: Task[] = [];
  private habits: Habit[] = [];

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  executeCommand(command: string): CommandResponse {
    const [cmd, ...args] = command.trim().toLowerCase().split(' ');

    switch (cmd) {
      case 'help':
        return this.showHelp();
      case 'task':
        return this.handleTaskCommand(args);
      case 'habit':
        return this.handleHabitCommand(args);
      case 'list':
        return this.handleListCommand(args);
      default:
        return { type: 'error', message: 'Unknown command. Type "help" for available commands.' };
    }
  }

  private showHelp(): CommandResponse {
    return {
      type: 'info',
      message: `Available Commands:

Task Management:
  task add <title> [due:YYYY-MM-DD]  - Add a new task
  task complete <id>                 - Mark a task as complete
  task delete <id>                   - Delete a task

Habit Tracking:
  habit add <title> <daily|weekly|monthly>  - Add a new habit
  habit complete <id>                       - Mark a habit as complete for today
  habit delete <id>                         - Delete a habit

List Commands:
  list tasks                         - Show all tasks
  list habits                        - Show all habits

General:
  help                              - Show this help message`
    };
  }

  private handleTaskCommand(args: string[]): CommandResponse {
    if (!args.length) return { type: 'error', message: 'Invalid task command. Type "help" for usage.' };

    const [subCmd, ...rest] = args;

    switch (subCmd) {
      case 'add': {
        if (!rest.length) return { type: 'error', message: 'Please provide a task title.' };
        
        const dueIndex = rest.indexOf('due:');
        let title = rest.join(' ');
        let dueDate: string | undefined;

        if (dueIndex !== -1) {
          title = rest.slice(0, dueIndex).join(' ');
          dueDate = rest[dueIndex + 1];
        }

        const task: Task = {
          id: this.generateId(),
          title,
          completed: false,
          dueDate,
          createdAt: this.formatDate(new Date())
        };

        this.tasks.push(task);
        return { type: 'success', message: `Task created with ID: ${task.id}` };
      }

      case 'complete': {
        const id = rest[0];
        const task = this.tasks.find(t => t.id === id);
        if (!task) return { type: 'error', message: `Task ${id} not found.` };
        
        task.completed = true;
        return { type: 'success', message: `Task ${id} marked as complete.` };
      }

      case 'delete': {
        const id = rest[0];
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) return { type: 'error', message: `Task ${id} not found.` };
        
        this.tasks.splice(index, 1);
        return { type: 'success', message: `Task ${id} deleted.` };
      }

      default:
        return { type: 'error', message: 'Invalid task command. Type "help" for usage.' };
    }
  }

  private handleHabitCommand(args: string[]): CommandResponse {
    if (!args.length) return { type: 'error', message: 'Invalid habit command. Type "help" for usage.' };

    const [subCmd, ...rest] = args;

    switch (subCmd) {
      case 'add': {
        if (rest.length < 2) return { type: 'error', message: 'Please provide a habit title and frequency.' };
        
        const frequency = rest[rest.length - 1] as Habit['frequency'];
        if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
          return { type: 'error', message: 'Frequency must be daily, weekly, or monthly.' };
        }

        const title = rest.slice(0, -1).join(' ');
        const habit: Habit = {
          id: this.generateId(),
          title,
          frequency,
          streak: 0,
          createdAt: this.formatDate(new Date())
        };

        this.habits.push(habit);
        return { type: 'success', message: `Habit created with ID: ${habit.id}` };
      }

      case 'complete': {
        const id = rest[0];
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return { type: 'error', message: `Habit ${id} not found.` };
        
        const today = this.formatDate(new Date());
        if (habit.lastCompleted === today) {
          return { type: 'error', message: `Habit ${id} already completed today.` };
        }

        habit.lastCompleted = today;
        habit.streak++;
        return { type: 'success', message: `Habit ${id} completed. Current streak: ${habit.streak}` };
      }

      case 'delete': {
        const id = rest[0];
        const index = this.habits.findIndex(h => h.id === id);
        if (index === -1) return { type: 'error', message: `Habit ${id} not found.` };
        
        this.habits.splice(index, 1);
        return { type: 'success', message: `Habit ${id} deleted.` };
      }

      default:
        return { type: 'error', message: 'Invalid habit command. Type "help" for usage.' };
    }
  }

  private handleListCommand(args: string[]): CommandResponse {
    if (!args.length) return { type: 'error', message: 'Please specify what to list (tasks or habits).' };

    const [target] = args;

    switch (target) {
      case 'tasks': {
        if (!this.tasks.length) return { type: 'info', message: 'No tasks found.' };
        
        const taskList = this.tasks
          .map(t => `${t.id}: [${t.completed ? 'x' : ' '}] ${t.title}${t.dueDate ? ` (due: ${t.dueDate})` : ''}`)
          .join('\n');
        
        return { type: 'info', message: 'Tasks:\n' + taskList };
      }

      case 'habits': {
        if (!this.habits.length) return { type: 'info', message: 'No habits found.' };
        
        const habitList = this.habits
          .map(h => `${h.id}: ${h.title} (${h.frequency}, streak: ${h.streak})`)
          .join('\n');
        
        return { type: 'info', message: 'Habits:\n' + habitList };
      }

      default:
        return { type: 'error', message: 'Invalid list command. Use "list tasks" or "list habits".' };
    }
  }
}

export const commandHandler = new CommandHandler(); 