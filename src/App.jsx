import { useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';

// Starting colors set to pink, blue, and clean white accents
const defaultData = [
  {
    id: '1',
    name: 'Default',
    theme: { bg: '#FFF0F5', primary: '#C74B5B', columnBg: '#FFFFFF', isImage: false },
    routines: {
      morning: [{ id: 'm1', text: 'Wake up safely & stretch', done: false }, { id: 'm2', text: 'Skincare routine', done: false }],
      afternoon: [{ id: 'a1', text: 'Check water propagations', done: false }, { id: 'a2', text: 'Lunch', done: false }],
      evening: [{ id: 'e1', text: 'Wind down', done: false }]
    },
    todos: [{ id: 't1', text: 'Update repository', done: false }]
  },
  {
    id: '2',
    name: 'Tomboy Config',
    theme: { bg: '#E6F2FF', primary: '#4A90E2', columnBg: '#FFFFFF', isImage: false },
    routines: {
      morning: [{ id: 'm1', text: 'Get dressed', done: false }],
      afternoon: [{ id: 'a1', text: 'Feed Sammie', done: false }],
      evening: [{ id: 'e1', text: 'Check GitHub', done: false }]
    },
    todos: []
  }
];

export default function App() {
  const [alters, setAlters] = useState(() => {
    const saved = localStorage.getItem('system_routines');
    return saved ? JSON.parse(saved) : defaultData;
  });
  const [activeId, setActiveId] = useState('1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to local state instantly, preparing placeholder hooks for Vercel KV endpoints
  useEffect(() => {
    localStorage.setItem('system_routines', JSON.stringify(alters));
    // When Vercel KV is activated, a simple fetch('/api/save', {method: 'POST', body: ...}) goes here
  }, [alters]);

  const activeFronter = alters.find(a => a.id === activeId) || alters[0] || defaultData[0];
  const theme = activeFronter.theme;

  const toggleTask = (period, taskId) => {
    setAlters(alters.map(alter => {
      if (alter.id !== activeId) return alter;
      const updated = alter.routines[period].map(t => t.id === taskId ? { ...t, done: !t.done } : t);
      return { ...alter, routines: { ...alter.routines, [period]: updated } };
    }));
  };

  const toggleTodo = (taskId) => {
    setAlters(alters.map(alter => {
      if (alter.id !== activeId) return alter;
      const updated = alter.todos.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
      return { ...alter, todos: updated };
    }));
  };

  const addAdHocTodo = (text) => {
    if (!text.trim()) return;
    setAlters(alters.map(alter => {
      if (alter.id !== activeId) return alter;
      return { ...alter, todos: [...alter.todos, { id: 't_' + Date.now(), text, done: false }] };
    }));
  };

  return (
    <div className="app-container" style={{ 
      backgroundColor: theme.isImage ? 'transparent' : theme.bg, 
      backgroundImage: theme.isImage ? `url(${theme.bg})` : 'none',
      color: theme.primary, 
      minHeight: '100vh' 
    }}>
      
      <header style={{ borderColor: theme.primary }}>
        <div className="header-left">
          <label>Fronter: </label>
          <select value={activeId} onChange={(e) => setActiveId(e.target.value)} style={{ borderColor: theme.primary, color: theme.primary }}>
            {alters.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <h1 className="main-title">DAILY ROUTINE CHART</h1>
        <button className="settings-btn" onClick={() => setIsSettingsOpen(true)} style={{ backgroundColor: theme.primary }}>Settings</button>
      </header>

      <div className="grid-container">
        {['morning', 'afternoon', 'evening'].map(period => (
          <div key={period} className="routine-column" style={{ borderColor: theme.primary, backgroundColor: theme.columnBg }}>
            <h2 style={{ backgroundColor: theme.primary }}>{period.toUpperCase()}</h2>
            <div className="task-list">
              {activeFronter.routines[period]?.map(task => (
                <label key={task.id} className="task-item">
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(period, task.id)} />
                  <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="todo-section" style={{ borderColor: theme.primary, backgroundColor: theme.columnBg }}>
        <h2 style={{ backgroundColor: theme.primary }}>AD-HOC CHECKLIST</h2>
        <div className="task-list">
          {activeFronter.todos?.map(task => (
             <label key={task.id} className="task-item">
               <input type="checkbox" checked={task.done} onChange={() => toggleTodo(task.id)} />
               <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</span>
             </label>
          ))}
          <div className="add-todo-row">
            <input 
              type="text" 
              placeholder="Add temporary task..." 
              style={{ borderColor: theme.primary }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addAdHocTodo(e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsModal 
          alters={alters} 
          setAlters={setAlters} 
          activeId={activeId}
          setActiveId={setActiveId}
          close={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
}

