import { useState } from 'react';
import SettingsModal from './SettingsModal';

const defaultData = [
  {
    id: '1',
    name: 'Default',
    theme: { bg: '#FFF0F5', primary: '#C74B5B' },
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
    theme: { bg: '#1a1a1a', primary: '#4a90e2' },
    routines: {
      morning: [{ id: 'm1', text: 'Get dressed', done: false }],
      afternoon: [{ id: 'a1', text: 'Feed Sammie', done: false }],
      evening: [{ id: 'e1', text: 'Check GitHub', done: false }]
    },
    todos: []
  }
];

export default function App() {
  const [alters, setAlters] = useState(defaultData);
  const [activeId, setActiveId] = useState('1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeFronter = alters.find(a => a.id === activeId) || alters[0];
  const theme = activeFronter.theme;

  const toggleTask = (period, taskId) => {
    const updatedAlters = alters.map(alter => {
      if (alter.id !== activeId) return alter;
      const updatedPeriod = alter.routines[period].map(task => 
        task.id === taskId ? { ...task, done: !task.done } : task
      );
      return { ...alter, routines: { ...alter.routines, [period]: updatedPeriod } };
    });
    setAlters(updatedAlters);
  };

  const toggleTodo = (taskId) => {
    const updatedAlters = alters.map(alter => {
      if (alter.id !== activeId) return alter;
      const updatedTodos = alter.todos.map(task => 
        task.id === taskId ? { ...task, done: !task.done } : task
      );
      return { ...alter, todos: updatedTodos };
    });
    setAlters(updatedAlters);
  };

  return (
    <div className="app-container" style={{ backgroundColor: theme.bg, color: theme.primary, minHeight: '100vh', transition: 'background-color 0.1s' }}>
      
      <header style={{ borderColor: theme.primary }}>
        <div className="header-left">
          <span>Patient Name: </span>
          <select value={activeId} onChange={(e) => setActiveId(e.target.value)} style={{ borderColor: theme.primary, color: theme.primary }}>
            {alters.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <h1>DAILY ROUTINE CHART</h1>
        <button className="settings-btn" onClick={() => setIsSettingsOpen(true)} style={{ backgroundColor: theme.primary }}>Settings</button>
      </header>

      <div className="grid-container">
        {['morning', 'afternoon', 'evening'].map(period => (
          <div key={period} className="routine-column" style={{ borderColor: theme.primary }}>
            <h2 style={{ backgroundColor: theme.primary }}>{period.toUpperCase()}</h2>
            <div className="task-list">
              {activeFronter.routines[period].map(task => (
                <label key={task.id} className="task-item">
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(period, task.id)} />
                  <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="todo-section" style={{ borderColor: theme.primary }}>
        <h2 style={{ backgroundColor: theme.primary }}>AD-HOC CHECKLIST</h2>
        <div className="task-list">
          {activeFronter.todos.map(task => (
             <label key={task.id} className="task-item">
               <input type="checkbox" checked={task.done} onChange={() => toggleTodo(task.id)} />
               <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</span>
             </label>
          ))}
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsModal 
          alters={alters} 
          setAlters={setAlters} 
          close={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
}
