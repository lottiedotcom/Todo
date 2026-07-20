import { useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';

const defaultData = [
  {
    id: '1',
    name: 'Default',
    theme: { bg: '#FFF0F5', primary: '#C74B5B', columnBg: '#FFFFFF', isImage: false, font: 'monospace', radius: '16px' },
    routines: { morning: [], afternoon: [], evening: [] },
    todos: [],
    tracking: {} // Format: { 'YYYY-MM-DD': { water: 0, mood: '', notes: '' } }
  }
];

export default function App() {
  const [alters, setAlters] = useState(defaultData);
  const [activeId, setActiveId] = useState('1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'todo', 'track'
  const [showMondayTrend, setShowMondayTrend] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Cloud Load
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

  // Cloud Save
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('system_routines', JSON.stringify(alters));
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alters)
    }).catch(console.error);
  }, [alters, isLoaded]);

  // Monday 7 AM Pop-up Logic
  useEffect(() => {
    const checkMonday = () => {
      const now = new Date();
      // If it's Monday (1) and it's 7 AM or later
      if (now.getDay() === 1 && now.getHours() >= 7) {
        const viewed = localStorage.getItem('trendViewed');
        if (viewed !== todayStr) {
          setShowMondayTrend(true);
          localStorage.setItem('trendViewed', todayStr);
        }
      }
    };
    checkMonday();
  }, [todayStr]);

  const activeFronter = alters.find(a => a.id === activeId) || alters[0];
  const theme = activeFronter?.theme || defaultData[0].theme;
  const todayTracking = activeFronter.tracking?.[todayStr] || { water: 0, mood: '', notes: '' };

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
      const currentDay = currentTracking[todayStr] || { water: 0, mood: '', notes: '' };
      return {
        ...a,
        tracking: { ...currentTracking, [todayStr]: { ...currentDay, [key]: value } }
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
      paddingBottom: '80px' // Space for bottom nav
    }}>
      
      <header style={{ borderColor: theme.primary }}>
        <div className="header-left">
          <label>Fronter: </label>
          <select value={activeId} onChange={(e) => setActiveId(e.target.value)} style={{ borderColor: theme.primary, color: theme.primary }}>
            {alters.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <h1 className="main-title">DAILY CHART</h1>
      </header>

      {/* TAB 1: HOME (ROUTINES) */}
      {activeTab === 'home' && (
        <div className="tab-content">
          <div className="home-controls">
            <button className="settings-btn" onClick={() => setIsSettingsOpen(true)} style={{ backgroundColor: theme.primary }}>Settings</button>
            <button className="reset-btn" onClick={resetRoutines} style={{ borderColor: theme.primary, color: theme.primary }}>Reset Today's Routine</button>
          </div>
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
        </div>
      )}

      {/* TAB 2: TO-DO */}
      {activeTab === 'todo' && (
        <div className="tab-content">
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
        </div>
      )}

      {/* TAB 3: TRACKING */}
      {activeTab === 'track' && (
        <div className="tab-content">
          <div className="tracking-section" style={{ borderColor: theme.primary, backgroundColor: theme.columnBg }}>
            <h2 style={{ backgroundColor: theme.primary }}>HEALTH & NOTES</h2>
            
            <div className="tracking-block">
              <h3>Hydration Tracker (8oz)</h3>
              <div className="water-display">
                {'💧'.repeat(todayTracking.water) || <span className="empty-water">No water logged yet!</span>}
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

      {/* BOTTOM NAVIGATION */}
      <nav className="bottom-nav" style={{ borderColor: theme.primary }}>
        <button className={activeTab === 'home' ? 'active-tab' : ''} onClick={() => setActiveTab('home')} style={{ color: theme.primary }}>Home</button>
        <button className={activeTab === 'todo' ? 'active-tab' : ''} onClick={() => setActiveTab('todo')} style={{ color: theme.primary }}>To-Do</button>
        <button className={activeTab === 'track' ? 'active-tab' : ''} onClick={() => setActiveTab('track')} style={{ color: theme.primary }}>Track</button>
      </nav>

      {/* MONDAY NOTIFICATION POP-UP */}
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
