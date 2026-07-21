import { useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';

const defaultData = [
  {
    id: '1',
    name: 'Default',
    theme: { bg: '#FFF0F5', primary: '#C74B5B', columnBg: '#FFFFFF', isImage: false, font: 'monospace', radius: '16px' },
    routines: { morning: [], afternoon: [], evening: [] },
    todos: [],
    tracking: {} 
  }
];

export default function App() {
  const [alters, setAlters] = useState(defaultData);
  const [activeId, setActiveId] = useState('1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); 
  const [showMondayTrend, setShowMondayTrend] = useState(false);
  
  // New Time Travel State
  const [viewDateOffset, setViewDateOffset] = useState(0);

  // Calculate the active viewing date based on the offset
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() + viewDateOffset);
  
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  const activeDateStr = `${y}-${m}-${d}`;
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activeDayName = daysOfWeek[dateObj.getDay()];
  
  // Real today string for the trend pop-up
  const realTodayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/data');
        const cloudData = await res.json();
        if (cloudData && cloudData.length > 0) setAlters(cloudData);
        else {
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

  useEffect(() => {
    const checkMonday = () => {
      const now = new Date();
      if (now.getDay() === 1 && now.getHours() >= 7) {
        const viewed = localStorage.getItem('trendViewed');
        if (viewed !== realTodayStr) {
          setShowMondayTrend(true);
          localStorage.setItem('trendViewed', realTodayStr);
        }
      }
    };
    checkMonday();
  }, [realTodayStr]);

  const activeFronter = alters.find(a => a.id === activeId) || alters[0];
  const theme = activeFronter?.theme || defaultData[0].theme;
  
  // Tracking now looks at the activeDateStr you are viewing, not just real "today"
  const todayTracking = activeFronter.tracking?.[activeDateStr] || { water: 0, mood: '', notes: '' };

  const activeTodos = activeFronter.todos?.filter(t => !t.done) || [];
  const archivedTodos = activeFronter.todos?.filter(t => t.done) || [];

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

  const clearArchivedTodos = () => {
    if(!window.confirm("Permanently delete all completed tasks?")) return;
    setAlters(alters.map(a => a.id !== activeId ? a : {
      ...a, todos: a.todos.filter(t => !t.done)
    }));
  };

  const resetRoutines = () => {
    if(!window.confirm("Reset all daily routines?")) return;
    setAlters(alters.map(a => a.id !== activeId ? a : {
      ...a, routines: {
        morning: a.routines.morning.map(t => ({...t, done: false})),
        afternoon: a.routines.afternoon.map(t => ({...t, done: false})),
        evening: a.routines.evening.map(t => ({...t, done: false}))
      }
    }));
  };

  const updateTracking = (key, value) => {
    setAlters(alters.map(a => {
      if (a.id !== activeId) return a;
      const currentTracking = a.tracking || {};
      const currentDayStats = currentTracking[activeDateStr] || { water: 0, mood: '', notes: '' };
      return {
        ...a,
        tracking: { ...currentTracking, [activeDateStr]: { ...currentDayStats, [key]: value } }
      };
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
      minHeight: '100vh',
      paddingBottom: '80px' 
    }}>
      
      <header style={{ borderColor: theme.primary }}>
        <div className="header-left">
          <label>Fronter: </label>
          <select value={activeId} onChange={(e) => setActiveId(e.target.value)} style={{ borderColor: theme.primary, color: theme.primary }}>
            {alters.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        
        <div className="date-nav">
          <button className="arrow-btn" onClick={() => setViewDateOffset(prev => prev - 1)} style={{ color: theme.primary }}>◀</button>
          <div style={{ textAlign: 'center' }}>
            <h1 className="main-title" style={{ margin: 0 }}>DAILY CHART</h1>
            <span className="subtitle" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {viewDateOffset === 0 ? `TODAY (${activeDayName})` : `${activeDateStr} (${activeDayName})`}
            </span>
          </div>
          <button className="arrow-btn" onClick={() => setViewDateOffset(prev => prev + 1)} style={{ color: theme.primary }}>▶</button>
        </div>
      </header>

      {activeTab === 'home' && (
        <div className="tab-content">
          <div className="home-controls">
            <button className="settings-btn" onClick={() => setIsSettingsOpen(true)} style={{ backgroundColor: theme.primary }}>Settings</button>
            <div style={{ display: 'flex', gap: '10px' }}>
              {viewDateOffset !== 0 && (
                <button className="reset-btn" onClick={() => setViewDateOffset(0)} style={{ borderColor: theme.primary, color: theme.primary }}>Back to Today</button>
              )}
              <button className="reset-btn" onClick={resetRoutines} style={{ borderColor: theme.primary, color: theme.primary }}>Reset Checkboxes</button>
            </div>
          </div>
          <div className="grid-container">
            {['morning', 'afternoon', 'evening'].map(period => {
              // Now filters tasks based on the day you are currently viewing!
              const todaysTasks = activeFronter.routines[period]?.filter(task => !task.days || task.days.length === 0 || task.days.includes(activeDayName)) || [];
              
              return (
                <div key={period} className="routine-column" style={{ borderColor: theme.primary, backgroundColor: theme.columnBg }}>
                  <h2 style={{ backgroundColor: theme.primary }}>{period.toUpperCase()}</h2>
                  <div className="task-list">
                    {todaysTasks.length === 0 && (
                      <p className="empty-day-msg">No tasks scheduled for {activeDayName}.</p>
                    )}
                    {todaysTasks.map(task => (
                      <label key={task.id} className="task-item">
                        <input type="checkbox" checked={task.done} onChange={() => toggleTask(period, task.id)} />
                        <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'todo' && (
        <div className="tab-content">
          <div className="todo-section" style={{ borderColor: theme.primary, backgroundColor: theme.columnBg }}>
            <h2 style={{ backgroundColor: theme.primary }}>To Do:</h2>
            <div className="task-list">
              {activeTodos.map(task => (
                 <label key={task.id} className="task-item">
                   <input type="checkbox" checked={task.done} onChange={() => toggleTodo(task.id)} />
                   <span>{task.text}</span>
                 </label>
              ))}
              <div className="add-todo-row">
                <input type="text" placeholder="Add temporary task..." style={{ borderColor: theme.primary }} onKeyDown={(e) => {
                    if (e.key === 'Enter') { addAdHocTodo(e.target.value); e.target.value = ''; }
                  }} />
              </div>
            </div>

            {archivedTodos.length > 0 && (
              <div className="archive-box" style={{ borderColor: theme.primary }}>
                <div className="archive-header">
                  <h3 style={{ margin: 0, color: '#C74B5B' }}>Completed Archive</h3>
                  <button className="clear-archive-btn" onClick={clearArchivedTodos}>Clear All</button>
                </div>
                <div className="task-list" style={{ padding: '0', marginTop: '10px' }}>
                  {archivedTodos.map(task => (
                     <label key={task.id} className="task-item archive-item">
                       <input type="checkbox" checked={task.done} onChange={() => toggleTodo(task.id)} />
                       <span style={{ textDecoration: 'line-through' }}>{task.text}</span>
                     </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'track' && (
        <div className="tab-content">
          <div className="tracking-section" style={{ borderColor: theme.primary, backgroundColor: theme.columnBg }}>
            <h2 style={{ backgroundColor: theme.primary }}>HEALTH & NOTES {viewDateOffset !== 0 ? `(${activeDateStr})` : ''}</h2>
            
            <div className="tracking-block">
              <h3>Hydration Tracker (8oz)</h3>
              <div className="water-display">
                {'💧'.repeat(todayTracking.water) || <span className="empty-water">No water logged for this date.</span>}
              </div>
              <button className="water-btn" onClick={() => updateTracking('water', todayTracking.water + 1)} style={{ backgroundColor: theme.primary }}>
                + Add 8oz
              </button>
            </div>

            <div className="tracking-block">
              <h3>Current Mood</h3>
              <textarea 
                value={todayTracking.mood} 
                onChange={(e) => updateTracking('mood', e.target.value)}
                placeholder="How are you feeling?"
                style={{ borderColor: theme.primary }}
              />
            </div>

            <div className="tracking-block">
              <h3>Daily Notes</h3>
              <textarea 
                value={todayTracking.notes} 
                onChange={(e) => updateTracking('notes', e.target.value)}
                placeholder="Jot down notes throughout the day..."
                style={{ borderColor: theme.primary }}
              />
            </div>

          </div>
        </div>
      )}

      <nav className="bottom-nav" style={{ borderColor: theme.primary }}>
        <button className={activeTab === 'home' ? 'active-tab' : ''} onClick={() => setActiveTab('home')} style={{ color: theme.primary }}>Home</button>
        <button className={activeTab === 'todo' ? 'active-tab' : ''} onClick={() => setActiveTab('todo')} style={{ color: theme.primary }}>To-Do</button>
        <button className={activeTab === 'track' ? 'active-tab' : ''} onClick={() => setActiveTab('track')} style={{ color: theme.primary }}>Track</button>
      </nav>

      {showMondayTrend && (
        <div className="modal-overlay">
          <div className="trend-modal" style={{ borderColor: theme.primary }}>
            <button className="close-trend" onClick={() => setShowMondayTrend(false)} style={{ color: theme.primary }}>✕</button>
            <h2 style={{ color: theme.primary }}>Weekly Trend Ready!</h2>
            <p>Happy Monday! Here is a reminder to review how you tracked your hydration and moods over the past week.</p>
            <p className="trend-cute">Keep up the great work! 🌸</p>
          </div>
        </div>
      )}

      {isSettingsOpen && <SettingsModal alters={alters} setAlters={setAlters} activeId={activeId} setActiveId={setActiveId} close={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

