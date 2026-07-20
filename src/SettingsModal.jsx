import { useState } from 'react';

export default function SettingsModal({ alters, setAlters, activeId, setActiveId, close }) {
  const [editingId, setEditingId] = useState(activeId);
  const [localAlters, setLocalAlters] = useState(alters);
  const [newAlterName, setNewAlterName] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [taskPeriod, setTaskPeriod] = useState('morning');

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

  const handleDeleteAlter = (idToDelete) => {
    if (localAlters.length <= 1) return alert("You must keep at least one profile!");
    const filtered = localAlters.filter(a => a.id !== idToDelete);
    setLocalAlters(filtered);
    setEditingId(filtered[0].id);
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setLocalAlters(localAlters.map(a => a.id !== editingId ? a : {
      ...a, routines: { ...a.routines, [taskPeriod]: [...a.routines[taskPeriod], { id: 'r_' + Date.now(), text: newTaskText, done: false }] }
    }));
    setNewTaskText('');
  };

  const handleDeleteTask = (period, taskId) => {
    setLocalAlters(localAlters.map(a => a.id !== editingId ? a : {
      ...a, routines: { ...a.routines, [period]: a.routines[period].filter(t => t.id !== taskId) }
    }));
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
            <button className="danger-btn" onClick={() => handleDeleteAlter(editingId)}>Delete</button>
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
            <div className="settings-group inline-box">
              <div className="row-layout vertical-mobile">
                <select value={taskPeriod} onChange={(e) => setTaskPeriod(e.target.value)}>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
                <input type="text" placeholder="New task..." value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} />
                <button className="action-btn" onClick={handleAddTask}>Add</button>
              </div>
            </div>

            {['morning', 'afternoon', 'evening'].map(period => (
              <div key={period} className="mini-task-list">
                <h4>{period.toUpperCase()}:</h4>
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

        <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cancel-btn" onClick={close}>Cancel</button>
            <button className="save-btn" onClick={handleSave}>Save Config</button>
          </div>
        </div>
      </div>
    </div>
  );
}
