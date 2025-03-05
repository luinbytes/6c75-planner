import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const App = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{ type: 'command' | 'output', content: string }>>([]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      setHistory(prev => [...prev, { type: 'command', content: input }]);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--terminal-background))] p-4 md:p-8">
      <div className="max-w-3xl mx-auto terminal-window p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-4"
        >
          <h1 className="text-2xl font-medium mb-1">6c75-planner</h1>
          <p className="text-[rgba(var(--terminal-green),0.6)] text-sm">Welcome to your CLI task manager</p>
        </motion.div>

        <div className="space-y-0.5 mb-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {history.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`command-line ${
                  item.type === 'command' 
                    ? 'text-[rgba(var(--terminal-green),0.9)]' 
                    : 'text-[rgba(var(--terminal-green),0.7)]'
                }`}
              >
                <span className="opacity-50 select-none">{item.type === 'command' ? '>' : '·'}</span>
                <span>{item.content}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="command-line">
          <span className="opacity-50 select-none">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleCommand}
            className="terminal-input"
            autoFocus
            spellCheck="false"
            placeholder="type help for available commands"
          />
        </div>
      </div>
    </div>
  );
};

export default App; 