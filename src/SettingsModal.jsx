import { useState } from 'react';

export default function SettingsModal({ alters, setAlters, activeId, setActiveId, close }) {
  const [editingId, setEditingId] = useState(activeId);
  const [localAlters, setLocalAlters] = useState(alters);

  // Form states for temporary additions
  const [newAlterName, setNewAlterName] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [taskPeriod, setTaskPeriod] = useState('morning');

  const activeEdit = localAlters.find(a => a.id === editingId) || localAlters[0];

  const handleThemeChange = (field, value) => {
    setLocalAlters(localAlters.map(a => 
      a.id === editingId ? { ...a, theme: { ...a.theme, [field]: value } } : a
    ));
  };

  const handleAddNewAlter = () => {
    if (!newAlterName.trim()) return;
    const newId = 'alter_' + Date.now();
    const newAlter = {
      id: newId,
      name: newAlterName,
      theme: { bg: '#FFFFFF', primary: '#333333', columnBg: '#FFFFFF', isImage: false },
      routines: { morning: [], afternoon: [], evening: [] },
      todos: []
    };
    setLocalAlters([...localAlters, newAlter]);
    setEditingId(newId);
    setNewAlterName('');
  };

  const handleDeleteAlter = (idToDelete) => {
    if (localAlters.length <= 1) {
      alert("You must keep at least one profile configuration!");
      return;
    }
    const filtered = localAlters.filter(a => a.id !== idToDelete);
    setLocalAlters(filtered);
    setEditingId(filtered[0].id);
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setLocalAlters(localAlters.map(a => {
      if (a.id !== editingId) return a;
      const updatedPeriod = [...a.routines[taskPeriod], { id: 'r_' + Date.now(), text: newTaskText, done: false }];
      return { ...a, routines: { ...a.routines, [taskPeriod]: updatedPeriod } };
    }));
    setNewTaskText('');
  };

  const handleDeleteTask = (period, taskId) => {
    setLocalAlters(localAlters.map(a => {
      if (a.id !== editingId) return a;
      const filteredPeriod = a.routines[period].filter(t => t.id !== taskId);
      return { ...a, routines: { ...a.routines, [period]: filteredPeriod } };
    }));
  };

  const handleSave = () => {
    setAlters(localAlters);
    if (!localAlters.some(a => a.id === activeId)) {
      setActiveId(localAlters[0].id);
    }
    close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">System Customizer</h2>
        
        {/* Profile Selection & Deletion */}
        <div className="settings-group">
          <label>Manage Existing Profiles:</label>
          <div className="row-layout">
            <select value={editingId} onChange={(e) => setEditingId(e.target.value)}>
              {localAlters.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <button className="danger-btn" onClick={() => handleDeleteAlter(editingId)}>Delete</button>
          </div>
        </div>

        {/* Profile Creation */}
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
            <div className="settings-group checkbox-row">
              <label>
                <input type="checkbox" checked={activeEdit.theme.isImage} onChange={(e) => handleThemeChange('isImage', e.target.checked)} />
                Use Background Image URL instead of Hex Code
              </label>
            </div>

            <div className="settings-group">
              <label>{activeEdit.theme.isImage ? 'Background Image Web Link:' : 'Background Hex Color:'}</label>
              <input type="text" value={activeEdit.theme.bg} onChange={(e) => handleThemeChange('bg', e.target.value)} placeholder={activeEdit.theme.isImage ? 'https://...' : '#FFF0F5'} />
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
            <div className="settings-group inline-box">
              <div className="row-layout vertical-mobile">
                <select value={taskPeriod} onChange={(e) => setTaskPeriod(e.target.value)}>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
                <input type="text" placeholder="New core task item..." value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} />
                <button className="action-btn" onClick={handleAddTask}>Add Task</button>
              </div>
            </div>

            {['morning', 'afternoon', 'evening'].map(period => (
              <div key={period} className="mini-task-list">
                <h4>{period.toUpperCase()} Items:</h4>
                {activeEdit.routines[period]?.length === 0 && <p className="empty-text">No routine tasks recorded.</p>}
                {activeEdit.routines[period]?.map(t => (
                  <div key={t.id} className="mini-task-item">
                    <span>• {t.text}</span>
                    <span className="remove-cross" onClick={() => handleDeleteTask(period, t.id)}>✕</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="cancel-btn" onClick={close}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save Config</button>
        </div>
      </div>
    </div>
  );
}
