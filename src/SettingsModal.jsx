import { useState } from 'react';

export default function SettingsModal({ alters, setAlters, activeId, setActiveId, close }) {
  const [editingId, setEditingId] = useState(activeId);
  const [localAlters, setLocalAlters] = useState(alters);
  
  const [showManageProfile, setShowManageProfile] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  
  const [newAlterName, setNewAlterName] = useState('');
  
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [newTaskText, setNewTaskText] = useState('');
  const [taskPeriod, setTaskPeriod] = useState('morning');
  const [taskDays, setTaskDays] = useState(allDays);
  
  // New state for editing pre-existing tasks
  const [editingTaskId, setEditingTaskId] = useState(null);

  const activeEdit = localAlters.find(a => a.id === editingId) || localAlters[0];

  const handleThemeChange = (field, value) => {
    setLocalAlters(localAlters.map(a => a.id === editingId ? { ...a, theme: { ...a.theme, [field]: value } } : a));
  };

  const handleAddNewAlter = () => {
    if (!newAlterName.trim()) return;
    const newAlter = {
      id: 'alter_' + Date.now(), name: newAlterName,
      theme: { bg: '#FFFFFF', primary: '#333333', columnBg: '#FFFFFF', isImage: false, font: 'monospace', radius: '16px' },
      routines: { morning: [], afternoon: [], evening: [] }, todos: [],
      tracking: {} 
    };
    setLocalAlters([...localAlters, newAlter]);
    setEditingId(newAlter.id);
    setNewAlterName('');
  };

  const openManageProfile = () => {
    setEditNameValue(activeEdit.name);
    setShowManageProfile(true);
  };

  const handleSaveProfileName = () => {
    if(!editNameValue.trim()) return;
    setLocalAlters(localAlters.map(a => a.id === editingId ? { ...a, name: editNameValue } : a));
    setShowManageProfile(false);
  };

  const handleDeleteAlter = () => {
    if (localAlters.length <= 1) return alert("You must keep at least one profile!");
    const filtered = localAlters.filter(a => a.id !== editingId);
    setLocalAlters(filtered);
    setEditingId(filtered[0].id);
    setShowManageProfile(false);
  };

  const toggleDay = (day) => {
    if (taskDays.includes(day)) {
      setTaskDays(taskDays.filter(d => d !== day));
    } else {
      setTaskDays([...taskDays, day]);
    }
  };

  const setAllDays = () => setTaskDays(allDays);

  const handleSaveTask = () => {
    if (!newTaskText.trim()) return;
    if (taskDays.length === 0) return alert("Please select at least one day for the task to repeat.");
    
    setLocalAlters(localAlters.map(a => {
      if (a.id !== editingId) return a;
      const updatedRoutines = { ...a.routines };

      if (editingTaskId) {
        // Edit existing task
        updatedRoutines[taskPeriod] = updatedRoutines[taskPeriod].map(t => 
          t.id === editingTaskId ? { ...t, text: newTaskText, days: taskDays } : t
        );
      } else {
        // Create new task
        updatedRoutines[taskPeriod] = [...updatedRoutines[taskPeriod], { id: 'r_' + Date.now(), text: newTaskText, done: false, days: taskDays }];
      }

      return { ...a, routines: updatedRoutines };
    }));
    
    setNewTaskText('');
    setTaskDays(allDays);
    setEditingTaskId(null);
  };

  const loadTaskForEditing = (period, task) => {
    setTaskPeriod(period);
    setNewTaskText(task.text);
    setTaskDays(task.days || allDays);
    setEditingTaskId(task.id);
  };

  const cancelTaskEdit = () => {
    setNewTaskText('');
    setTaskDays(allDays);
    setEditingTaskId(null);
  };

  const handleDeleteTask = (period, taskId) => {
    setLocalAlters(localAlters.map(a => a.id !== editingId ? a : {
      ...a, routines: { ...a.routines, [period]: a.routines[period].filter(t => t.id !== taskId) }
    }));
    if (editingTaskId === taskId) cancelTaskEdit();
  };

  const handleSave = () => {
    setAlters(localAlters);
    if (!localAlters.some(a => a.id === activeId)) setActiveId(localAlters[0].id);
    close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">System Customizer</h2>
        
        <div className="settings-group">
          <label>Manage Existing Profiles:</label>
          <div className="row-layout">
            <select value={editingId} onChange={(e) => setEditingId(e.target.value)}>
              {localAlters.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <button className="action-btn" onClick={openManageProfile} style={{ background: '#f0ad4e' }}>Edit / Delete</button>
          </div>
        </div>

        <div className="settings-group inline-box">
          <label>Create New Profile:</label>
          <div className="row-layout">
            <input type="text" placeholder="Alter name..." value={newAlterName} onChange={(e) => setNewAlterName(e.target.value)} />
            <button className="action-btn" onClick={handleAddNewAlter}>Add</button>
          </div>
        </div>

        {activeEdit && (
          <div className="scroll-container">
            <h3>Theme & Design Styling</h3>
            
            <div className="settings-group row-layout" style={{ marginTop: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Font Style:</label>
                <select value={activeEdit.theme.font || 'monospace'} onChange={(e) => handleThemeChange('font', e.target.value)} style={{ width: '100%' }}>
                  <option value="monospace">Retro (Monospace)</option>
                  <option value="sans-serif">Clean (Sans-Serif)</option>
                  <option value="serif">Classic (Serif)</option>
                  <option value="'Comic Sans MS', cursive, sans-serif">Bubbly (Cursive)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Box Shape:</label>
                <select value={activeEdit.theme.radius || '16px'} onChange={(e) => handleThemeChange('radius', e.target.value)} style={{ width: '100%' }}>
                  <option value="16px">Bubble (Rounded)</option>
                  <option value="0px">Square</option>
                </select>
              </div>
            </div>

            <div className="settings-group checkbox-row" style={{ marginTop: '10px' }}>
              <label>
                <input type="checkbox" checked={activeEdit.theme.isImage} onChange={(e) => handleThemeChange('isImage', e.target.checked)} />
                Use Background Image URL
              </label>
            </div>

            <div className="settings-group">
              <label>{activeEdit.theme.isImage ? 'Background Image Link:' : 'Background Hex Color:'}</label>
              <input type="text" value={activeEdit.theme.bg} onChange={(e) => handleThemeChange('bg', e.target.value)} />
            </div>
            
            <div className="settings-group">
              <label>Primary Theme Accent Color:</label>
              <input type="text" value={activeEdit.theme.primary} onChange={(e) => handleThemeChange('primary', e.target.value)} />
            </div>

            <div className="settings-group">
              <label>Inner Column Card Color:</label>
              <input type="text" value={activeEdit.theme.columnBg || '#FFFFFF'} onChange={(e) => handleThemeChange('columnBg', e.target.value)} />
            </div>

            <h3>Edit Routine Checklists</h3>
            <div className="settings-group inline-box" style={{ background: editingTaskId ? '#FFF0F5' : '#f9f9f9', border: editingTaskId ? '2px dashed #C74B5B' : '1px solid #e1e1e1' }}>
              <label style={{ color: editingTaskId ? '#C74B5B' : 'inherit' }}>
                {editingTaskId ? 'Editing Existing Task...' : 'Add New Task:'}
              </label>
              <div className="row-layout vertical-mobile" style={{ marginBottom: '10px' }}>
                <select value={taskPeriod} onChange={(e) => setTaskPeriod(e.target.value)}>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
                <input type="text" placeholder="Task text..." value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} />
                
                <button className="action-btn" onClick={handleSaveTask} style={{ background: editingTaskId ? '#C74B5B' : '#5cb85c' }}>
                  {editingTaskId ? 'Update' : 'Add'}
                </button>
                {editingTaskId && (
                  <button className="cancel-btn" onClick={cancelTaskEdit}>Cancel</button>
                )}
              </div>
              
              <div className="schedule-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Schedule (Repeat on):</label>
                  <button className="text-btn" onClick={setAllDays}>Select Everyday</button>
                </div>
                <div className="day-selector">
                  {allDays.map(day => (
                    <button 
                      key={day} 
                      className={`day-btn ${taskDays.includes(day) ? 'active' : ''}`} 
                      onClick={() => toggleDay(day)}
                    >
                      {day.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {['morning', 'afternoon', 'evening'].map(period => (
              <div key={period} className="mini-task-list">
                <h4>{period.toUpperCase()}:</h4>
                {activeEdit.routines[period]?.map(t => (
                  <div key={t.id} className="mini-task-item">
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontWeight: editingTaskId === t.id ? 'bold' : 'normal' }}>• {t.text}</span>
                      <span className="task-days-label">
                        {(!t.days || t.days.length === 7) ? 'Everyday' : t.days.join(', ')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <span className="edit-pencil" onClick={() => loadTaskForEditing(period, t)}>✏️</span>
                      <span className="remove-cross" onClick={() => handleDeleteTask(period, t.id)}>✕</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cancel-btn" onClick={close}>Cancel</button>
            <button className="save-btn" onClick={handleSave}>Save Config</button>
          </div>
        </div>
      </div>

      {showManageProfile && (
        <div className="sub-modal-overlay">
          <div className="sub-modal-content">
            <h3 style={{ marginBottom: '15px' }}>Edit or Delete Profile</h3>
            
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Edit Name:</label>
            <input 
              type="text" 
              value={editNameValue} 
              onChange={(e) => setEditNameValue(e.target.value)} 
              style={{ width: '100%', marginBottom: '20px', marginTop: '5px' }}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="action-btn" onClick={handleSaveProfileName}>Save New Name</button>
              <button className="danger-btn" onClick={handleDeleteAlter}>Permanently Delete Profile</button>
              <button className="cancel-btn" onClick={() => setShowManageProfile(false)}>Cancel / Go Back</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

