import { useState } from 'react';

export default function SettingsModal({ alters, setAlters, close }) {
  const [editingId, setEditingId] = useState(alters[0]?.id || '');
  const [localAlters, setLocalAlters] = useState(alters);

  const activeEdit = localAlters.find(a => a.id === editingId);

  const handleThemeChange = (field, value) => {
    setLocalAlters(localAlters.map(a => 
      a.id === editingId ? { ...a, theme: { ...a.theme, [field]: value } } : a
    ));
  };

  const handleSave = () => {
    setAlters(localAlters);
    close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>System Settings</h2>
        
        <div className="settings-group">
          <label>Select Profile to Edit:</label>
          <select value={editingId} onChange={(e) => setEditingId(e.target.value)}>
            {localAlters.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {activeEdit && (
          <>
            <div className="settings-group row">
              <div>
                <label>Background Color:</label>
                <input type="text" value={activeEdit.theme.bg} onChange={(e) => handleThemeChange('bg', e.target.value)} />
              </div>
              <div>
                <label>Primary Color:</label>
                <input type="text" value={activeEdit.theme.primary} onChange={(e) => handleThemeChange('primary', e.target.value)} />
              </div>
            </div>
            
            <p className="note">Routine and checklist editing logic will be connected here.</p>
          </>
        )}

        <div className="modal-actions">
          <button onClick={close}>Cancel</button>
          <button onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
