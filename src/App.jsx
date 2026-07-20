import { useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';

const defaultData = [
  {
    id: '1',
    name: 'Default',
    theme: { bg: '#FFF0F5', primary: '#C74B5B', columnBg: '#FFFFFF', isImage: false, font: 'monospace', radius: '16px' },
    routines: { morning: [], afternoon: [], evening: [] },
    todos: []
  }
];

export default function App() {
  const [alters, setAlters] = useState(defaultData);
  const [activeId, setActiveId] = useState('1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/data');
        const cloudData = await res.json();
        if (cloudData && cloudData.length > 0) {
          setAlters(cloudData);
        } else {
          const local = localStorage.getItem('system_routines');
          if (local) setAlters(JSON.parse(local));
        }
      } catch (err) {
        const local = localStorage.getItem('system_routines');
        if (local) setAlters(JSON.parse(local));
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('system_routines', JSON.stringify(alters));
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alters)
    }).catch(console.error);
  }, [alters, isLoaded]);

  const activeFronter = alters.find(a => a.id === activeId) || alters[0];
  const theme = activeFronter?.theme || defaultData[0].theme;

  const toggleTask = (period, taskId) => {
    setAlters(alters.map(a => a.id !== activeId ? a : { 
      ...a, routines: { ...a.routines, [period]: a.routines[period].map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
    }));
  };

  const toggleTodo = (taskId) => {
    setAlters(alters.map(a => a.id !== activeId ? a : {
      ...a, todos: a.todos.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
    }));
  };

  const addAdHocTodo = (text) => {
    if (!text.trim()) return;
    setAlters(alters.map(a => a.id !== activeId ? a : {
      ...a, todos: [...a.todos, { id: 't_' + Date.now(), text, done: false }]
    }));
  };

  if (!isLoaded) return <div style={{ padding: '20px' }}>Loading system data...</div>;

  return (
    <div className="app-container" style={{ 
      backgroundColor: theme.isImage ? 'transparent' : theme.bg, 
      backgroundImage: theme.isImage ? `url(${theme.bg})` : 'none',
      color: theme.primary, 
      '--app-font': theme.font || 'monospace',
      '--app-radius': theme.radius || '16px',
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
        <h2 style={{ backgroundColor: theme.primary }}>To Do:</h2>
        <div className="task-list">
          {activeFronter.todos?.map(task => (
             <label key={task.id} className="task-item">
               <input type="checkbox" checked={task.done} onChange={() => toggleTodo(task.id)} />
               <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</span>
             </label>
          ))}
          <div className="add-todo-row">
            <input type="text" placeholder="Add temporary task..." style={{ borderColor: theme.primary }} onKeyDown={(e) => {
                if (e.key === 'Enter') { addAdHocTodo(e.target.value); e.target.value = ''; }
              }} />
          </div>
        </div>
      </div>

      {isSettingsOpen && <SettingsModal alters={alters} setAlters={setAlters} activeId={activeId} setActiveId={setActiveId} close={() => setIsSettingsOpen(false)} />}
    </div>
  );
}
