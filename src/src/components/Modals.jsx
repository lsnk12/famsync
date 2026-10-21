import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';

export const EditEventModal = ({ isOpen, onClose, event, members, onSaveEvent, onDeleteEvent, formatTime, START_HOUR, END_HOUR }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [memberId, setMemberId] = useState('');
  const [start, setStart] = useState(9);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setLocation(event.location || '');
      setMemberId(event.memberId || (members[0] ? members[0].id : ''));
      setStart(event.start || 9);
      setDuration(event.duration || 1);
    }
  }, [event, members]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSaveEvent({
      ...event,
      title: title.trim(),
      location: location.trim(),
      memberId,
      start: parseFloat(start),
      duration: parseFloat(duration)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Edit Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <span className="text-slate-500 font-bold">✕</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Event Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Assign to Member</label>
            <select 
              value={memberId} 
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
            <input 
              type="text" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="e.g. Home, Office, Zoom"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
              <select 
                value={start} 
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => START_HOUR + i * 0.5).map(h => (
                  <option key={h} value={h}>{formatTime(h)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Duration (Hours)</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6].map(d => (
                  <option key={d} value={d}>{d} {d === 1 ? 'hour' : 'hours'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button"
              onClick={() => { onDeleteEvent(event.id); onClose(); }}
              className="px-4 py-3 bg-rose-50 text-rose-600 rounded-xl font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center"
            >
              <Trash2 size={18} />
            </button>
            <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ShareEventModal = ({ isOpen, onClose, event, members, onShareEvent }) => {
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  if (!isOpen || !event) return null;

  const toggleMember = (id) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    onShareEvent(event, selectedMemberIds);
    setSelectedMemberIds([]);
    onClose();
  };

  const availableMembers = members.filter(m => m.id !== event.memberId);

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Share Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <span className="text-slate-500 font-bold">✕</span>
          </button>
        </div>
        <p className="text-slate-600 mb-4 text-sm">
          Copy <strong className="text-slate-800">"{event.title}"</strong> to other family members:
        </p>

        <div className="space-y-2 mb-6">
          {availableMembers.map(member => {
            const isSelected = selectedMemberIds.includes(member.id);
            return (
              <div 
                key={member.id} 
                onClick={() => toggleMember(member.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${member.color}`}>
                    {member.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">{member.name}</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={isSelected} 
                  onChange={() => {}} 
                  className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500"
                />
              </div>
            );
          })}
        </div>

        <button 
          onClick={handleShare}
          disabled={selectedMemberIds.length === 0}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200"
        >
          Share with Selected Members
        </button>
      </div>
    </div>
  );
};

export const AddMemberModal = ({ isOpen, onClose, onAddMember }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Parent');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddMember(name.trim(), role);
    setName('');
    setRole('Parent');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Add Family Member</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <span className="text-slate-500 font-bold">✕</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Sam" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Parent">Parent</option>
              <option value="Child">Child</option>
              <option value="Pet">Pet / Other</option>
            </select>
          </div>
          <button type="submit" className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Add Member
          </button>
        </form>
      </div>
    </div>
  );
};

export const SyncModal = ({ isOpen, onClose }) => {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState({ google: true, apple: false, outlook: false });

  if (!isOpen) return null;

  const handleSync = (provider) => {
    setSyncing(provider);
    setTimeout(() => {
      setSynced(prev => ({ ...prev, [provider]: true }));
      setSyncing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Connect Calendars</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <span className="text-slate-500 font-bold">✕</span>
          </button>
        </div>
        <p className="text-slate-600 mb-6">Bring everyone's schedules into one unified view.</p>
        <div className="space-y-4">
          {['Google', 'Apple', 'Outlook'].map((provider) => {
            const isSynced = synced[provider.toLowerCase()];
            const isSyncing = syncing === provider.toLowerCase();
            return (
              <div key={provider} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSynced ? 'border-indigo-100 bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSynced ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{provider} Calendar</h4>
                    <p className="text-xs text-slate-500">{isSynced ? 'Connected and syncing' : 'Not connected'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => !isSynced && handleSync(provider.toLowerCase())}
                  disabled={isSynced || isSyncing}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isSynced ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 
                    isSyncing ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {isSynced ? (
                    <span className="flex items-center"><CheckCircle size={16} className="mr-1" /> Synced</span>
                  ) : isSyncing ? (
                    <span className="flex items-center"><RefreshCw size={16} className="mr-1 animate-spin" /> Syncing</span>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
          Done
        </button>
      </div>
    </div>
  );
};