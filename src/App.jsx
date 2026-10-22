import ICAL from 'ical.js';
import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { Plus, Clock, Settings, Bell, Users, RefreshCw, ChevronLeft, ChevronRight, UserPlus, Calendar as CalendarIcon, CheckCircle, Trash2, Edit3, Share2, MapPin, Download } from 'lucide-react';
import { supabase } from './supabaseClient';

const INITIAL_MEMBERS = [
  { id: '1', name: 'Mom', role: 'Parent', color: 'bg-rose-500', lightColor: 'bg-rose-100', text: 'text-rose-700' },
  { id: '2', name: 'Dad', role: 'Parent', color: 'bg-blue-500', lightColor: 'bg-blue-100', text: 'text-blue-700' },
  { id: '3', name: 'Leo', role: 'Child', color: 'bg-emerald-500', lightColor: 'bg-emerald-100', text: 'text-emerald-700' },
  { id: '4', name: 'Mia', role: 'Child', color: 'bg-amber-500', lightColor: 'bg-amber-100', text: 'text-amber-700' },
];

const INITIAL_EVENTS = [
  { id: 'e1', memberId: '1', title: 'Marketing Sync', date: '2026-10-21', start: 9, duration: 1.5, location: 'Zoom' },
  { id: 'e2', memberId: '1', title: 'Dentist Appt', date: '2026-10-21', start: 14, duration: 1, location: 'Dr. Smith Clinic' },
  { id: 'e3', memberId: '2', title: 'Project Pitch', date: '2026-10-21', start: 10, duration: 2, location: 'Office' },
  { id: 'e4', memberId: '2', title: 'Groceries', date: '2026-10-21', start: 17, duration: 1, location: 'Whole Foods' },
  { id: 'e5', memberId: '3', title: 'School', date: '2026-10-21', start: 8, duration: 7, location: 'High School' },
  { id: 'e6', memberId: '3', title: 'Soccer Practice', date: '2026-10-21', start: 16, duration: 1.5, location: 'City Park' },
  { id: 'e7', memberId: '4', title: 'School', date: '2026-10-21', start: 8.5, duration: 6, location: 'Elementary' },
  { id: 'e8', memberId: '4', title: 'Piano Lesson', date: '2026-10-21', start: 15.5, duration: 1, location: 'Home' },
];

const COLOR_PALETTE = [
  { color: 'bg-rose-500', lightColor: 'bg-rose-100', text: 'text-rose-700' },
  { color: 'bg-blue-500', lightColor: 'bg-blue-100', text: 'text-blue-700' },
  { color: 'bg-emerald-500', lightColor: 'bg-emerald-100', text: 'text-emerald-700' },
  { color: 'bg-amber-500', lightColor: 'bg-amber-100', text: 'text-amber-700' },
  { color: 'bg-purple-500', lightColor: 'bg-purple-100', text: 'text-purple-700' },
  { color: 'bg-indigo-500', lightColor: 'bg-indigo-100', text: 'text-indigo-700' },
  { color: 'bg-teal-500', lightColor: 'bg-teal-100', text: 'text-teal-700' },
  { color: 'bg-orange-500', lightColor: 'bg-orange-100', text: 'text-orange-700' },
];

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_WIDTH = 140;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatTime = (decimalTime) => {
  const hours = Math.floor(decimalTime);
  const mins = Math.round((decimalTime - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMins = mins < 10 ? `0${mins}` : mins;
  return `${displayHours}:${displayMins} ${ampm}`;
};

const findFamilyFreeTime = (events) => {
  if (!events || events.length === 0) return null;
  let timeline = [];
  events.forEach(e => {
    if (e) {
      timeline.push({ time: e.start, type: 'start' });
      timeline.push({ time: e.start + e.duration, type: 'end' });
    }
  });
  timeline.sort((a, b) => a.time - b.time);
  let activeEvents = 0;
  let lastFreeStart = Math.max(START_HOUR, 8);
  let longestFree = { start: 0, end: 0, duration: 0 };
  for (let i = 0; i < timeline.length; i++) {
    const pt = timeline[i];
    if (activeEvents === 0 && pt.time > lastFreeStart) {
      const duration = pt.time - lastFreeStart;
      if (duration > longestFree.duration) { longestFree = { start: lastFreeStart, end: pt.time, duration }; }
    }
    if (pt.type === 'start') activeEvents++; else activeEvents--;
    if (activeEvents === 0) lastFreeStart = pt.time;
  }
  if (activeEvents === 0 && 20 > lastFreeStart) {
      const duration = 20 - lastFreeStart;
      if (duration > longestFree.duration) { longestFree = { start: lastFreeStart, end: 20, duration }; }
  }
  return longestFree.duration > 0 ? longestFree : null;
};
const AddEventModal = ({ isOpen, onClose, members, currentDate, onCreateEvent }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(currentDate);
  const [location, setLocation] = useState('');
  const [memberId, setMemberId] = useState('');
  const [start, setStart] = useState(9);
  const [duration, setDuration] = useState(1);


  useEffect(() => {
    if (isOpen) { setTitle(''); setDate(currentDate); setLocation(''); setMemberId(members[0] ? members[0].id : ''); setStart(9); setDuration(1); }
  }, [isOpen, members, currentDate]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !memberId || !date) return;
    onCreateEvent({ title: title.trim(), date, location: location.trim(), memberId, start: parseFloat(start), duration: parseFloat(duration) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6"><h2 className="text-xl sm:text-2xl font-bold text-slate-800">Add New Event</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><span className="text-slate-500 font-bold">✕</span></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Event Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Assign to</label><select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Location</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Home, Office, Zoom" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label><select value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">{Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => START_HOUR + i * 0.5).map(h => <option key={h} value={h}>{formatTime(h)}</option>)}</select></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label><select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">{[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6].map(d => <option key={d} value={d}>{d} {d === 1 ? 'hour' : 'hours'}</option>)}</select></div>
          </div>
          <button type="submit" className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Create Event</button>
        </form>
      </div>
    </div>
  );
};

const EditEventModal = ({ isOpen, onClose, event, members, onSaveEvent, onDeleteEvent }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [memberId, setMemberId] = useState('');
  const [start, setStart] = useState(9);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    if (event) { setTitle(event.title || ''); setDate(event.date || ''); setLocation(event.location || ''); setMemberId(event.memberId || (members[0] ? members[0].id : '')); setStart(event.start || 9); setDuration(event.duration || 1); }
  }, [event, members]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSaveEvent({ ...event, title: title.trim(), date, location: location.trim(), memberId, start: parseFloat(start), duration: parseFloat(duration) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6"><h2 className="text-xl sm:text-2xl font-bold text-slate-800">Edit Event</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><span className="text-slate-500 font-bold">✕</span></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Event Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Assign to</label><select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Location</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label><select value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">{Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => START_HOUR + i * 0.5).map(h => <option key={h} value={h}>{formatTime(h)}</option>)}</select></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label><select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">{[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6].map(d => <option key={d} value={d}>{d} {d === 1 ? 'hour' : 'hours'}</option>)}</select></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={() => { onDeleteEvent(event.id); onClose(); }} className="px-4 py-3 bg-rose-50 text-rose-600 rounded-xl font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center"><Trash2 size={18} /></button>
            <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ShareEventModal = ({ isOpen, onClose, event, members, onShareEvent }) => {
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  if (!isOpen || !event) return null;
  const toggleMember = (id) => setSelectedMemberIds(prev => prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]);
  const handleShare = () => { onShareEvent(event, selectedMemberIds); setSelectedMemberIds([]); onClose(); };
  const availableMembers = members.filter(m => m.id !== event.memberId);
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl sm:text-2xl font-bold text-slate-800">Share Event</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><span className="text-slate-500 font-bold">✕</span></button></div>
        <p className="text-slate-600 mb-4 text-sm">Copy <strong className="text-slate-800">"{event.title}"</strong> to other family members:</p>
        <div className="space-y-2 mb-6">
          {availableMembers.map(member => (
            <div key={member.id} onClick={() => toggleMember(member.id)} className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer transition-all ${selectedMemberIds.includes(member.id) ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
              <div className="flex items-center space-x-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${member.color}`}>{member.name.charAt(0)}</div><span className="font-semibold text-slate-800 text-sm">{member.name}</span></div>
              <input type="checkbox" checked={selectedMemberIds.includes(member.id)} readOnly className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500" />
            </div>
          ))}
        </div>
        <button onClick={handleShare} disabled={selectedMemberIds.length === 0} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200">Share with Selected Members</button>
      </div>
    </div>
  );
};

const AddMemberModal = ({ isOpen, onClose, onAddMember }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Parent');
  const [colorIdx, setColorIdx] = useState(0);
  if (!isOpen) return null;
  const handleSubmit = (e) => { e.preventDefault(); if (!name.trim()) return; onAddMember(name.trim(), role, COLOR_PALETTE[colorIdx]); setName(''); setRole('Parent'); setColorIdx(0); onClose(); };
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6"><h2 className="text-xl sm:text-2xl font-bold text-slate-800">Add Family Member</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><span className="text-slate-500 font-bold">✕</span></button></div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Role</label><select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"><option value="Parent">Parent</option><option value="Child">Child</option><option value="Pet">Pet / Other</option></select></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-2">Color</label><div className="flex flex-wrap gap-3">{COLOR_PALETTE.map((c, i) => (<button key={i} type="button" onClick={() => setColorIdx(i)} className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center transition-transform ${colorIdx === i ? 'ring-4 ring-offset-2 ring-indigo-200 scale-110' : ''}`}>{colorIdx === i && <CheckCircle size={16} className="text-white opacity-80" />}</button>))}</div></div>
          <button type="submit" className="w-full mt-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Add Member</button>
        </form>
      </div>
    </div>
  );
};

const SyncModal = ({ isOpen, onClose, members, calendars, onAddCalendar, onDeleteCalendar, onRefreshCalendar }) => {
  const [newUrl, setNewUrl] = useState('');
  const [memberId, setMemberId] = useState('');
  const [importing, setImporting] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);

  useEffect(() => {
    if (isOpen) setMemberId(members[0] ? members[0].id : '');
  }, [isOpen, members]);

  if (!isOpen) return null;

 const handleImport = async (e) => {
  e.preventDefault();
  if (!newUrl.trim() || !memberId) return;
  setImporting(true);
  
  // Wait for the real download to finish
  const success = await onAddCalendar(newUrl.trim(), memberId);
  
  if (success) setNewUrl('');
  setImporting(false);
};

  const handleRefresh = (id) => {
    setRefreshingId(id);
    setTimeout(() => { onRefreshCalendar(id); setRefreshingId(null); }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6"><h2 className="text-xl sm:text-2xl font-bold text-slate-800">Sync Calendar</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><span className="text-slate-500 font-bold">✕</span></button></div>
        
        <form onSubmit={handleImport} className="mb-6 space-y-3">
          <input type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Enter Calendar URL or Name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required />
          <div className="flex gap-2">
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm" required>
              {members.map(m => <option key={m.id} value={m.id}>Assign to: {m.name}</option>)}
            </select>
            <button type="submit" disabled={importing} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center">{importing ? <RefreshCw size={18} className="animate-spin" /> : 'Import'}</button>
          </div>
        </form>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Imported Calendars</h3>
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
          {calendars.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No calendars imported yet.</p>
          ) : calendars.map(cal => {
            const member = members.find(m => m.id === cal.memberId);
            return (
              <div key={cal.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-none ${member ? member.lightColor + ' ' + member.text : 'bg-slate-200'}`}><CalendarIcon size={20} /></div>
                  <div className="overflow-hidden"><h4 className="font-semibold text-slate-800 text-sm truncate">{cal.name}</h4><p className="text-[10px] text-slate-500">Synced to {member ? member.name : 'Unknown'} • {cal.lastSynced}</p></div>
                </div>
                <div className="flex items-center space-x-1 pl-2">
                  <button onClick={() => handleRefresh(cal.id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">{refreshingId === cal.id ? <RefreshCw size={16} className="animate-spin text-indigo-600" /> : <RefreshCw size={16} />}</button>
                  <button onClick={() => onDeleteCalendar(cal.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
const Timeline = ({ events, members, onDeleteMember, onMoveEvent, onOpenShare, onOpenEdit }) => {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

  const handleDragStart = (e, event) => {
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
    const cardRect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - cardRect.left;
    e.dataTransfer.setData('offsetX', offsetX.toString());
  };

  const handleDrop = (e, targetMemberId) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    const offsetX = parseFloat(e.dataTransfer.getData('offsetX')) || 0;
    if (!eventId) return;

    const trackRect = e.currentTarget.getBoundingClientRect();
    const dropX = (e.clientX - trackRect.left) - offsetX;
    
    let newStart = START_HOUR + (dropX / HOUR_WIDTH);
    newStart = Math.round(newStart * 4) / 4;
    newStart = Math.max(START_HOUR, Math.min(END_HOUR - 0.25, newStart));
    
    onMoveEvent(eventId, targetMemberId, newStart);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[450px]">
      <div className="flex-1 overflow-auto bg-slate-50 relative">
        <div className="min-w-max">
          <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-30 shadow-sm">
            <div className="w-28 sm:w-56 flex-none sticky left-0 z-40 bg-slate-50 border-r border-slate-200 p-2 sm:p-4"></div>
            <div className="flex relative py-2" style={{ width: `${(END_HOUR - START_HOUR + 1) * HOUR_WIDTH}px` }}>
              {hours.map(hour => (
                <div key={hour} className="flex-none flex flex-col items-start px-2" style={{ width: `${HOUR_WIDTH}px` }}>
                  <span className="text-xs font-bold text-slate-500 mb-1">{hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</span>
                  <div className="h-4 border-l-2 border-slate-300"></div>
                </div>
              ))}
            </div>
          </div>
          git add .
          <div className="relative">
            {members.map(member => (
              <div key={member.id} className="flex border-b border-slate-200 hover:bg-slate-100 transition-colors min-h-[90px] sm:min-h-[120px] group">
                <div className="w-28 sm:w-56 flex-none sticky left-0 z-20 bg-white/95 backdrop-blur-md border-r border-slate-200 p-2 sm:p-4 flex items-center justify-between shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm flex-none ${member.color}`}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate">{member.name}</h3>
                      <span className={`hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${member.lightColor} ${member.text}`}>{member.role}</span>
                    </div>
                  </div>
                  <button onClick={() => onDeleteMember(member.id)} title={`Remove ${member.name}`} className="hidden sm:block p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                </div>
                <div className="flex-1 relative py-2" style={{ width: `${(END_HOUR - START_HOUR + 1) * HOUR_WIDTH}px` }} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }} onDrop={(e) => handleDrop(e, member.id)}>
                  <div className="absolute inset-0 flex pointer-events-none opacity-20">
                    {hours.map(h => <div key={`grid-${h}`} className="h-full border-l border-slate-400 border-dashed" style={{ width: `${HOUR_WIDTH}px` }} />)}
                  </div>

                  {events.filter(e => e && e.memberId === member.id).map(event => {
                    const leftPos = (event.start - START_HOUR) * HOUR_WIDTH;
                    const width = event.duration * HOUR_WIDTH;
                    return (
                      <div key={event.id} draggable onDragStart={(e) => handleDragStart(e, event)} onClick={() => onOpenEdit(event)} className={`absolute top-2 bottom-2 rounded-xl p-2 sm:p-3 shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-white/40 cursor-grab active:cursor-grabbing ${member.color} text-white group/card z-10`} style={{ left: `${leftPos}px`, width: `${width - 4}px` }}>
                        <div className="flex flex-col h-full justify-between">
                          <div className="flex justify-between items-start">
                            <div className="overflow-hidden">
                             <h4 className="font-bold text-xs sm:text-sm whitespace-normal break-words leading-tight drop-shadow-sm">{event.title}</h4>
<p className="text-[10px] sm:text-xs opacity-90 mt-0.5 font-medium">{formatTime(event.start)} - {formatTime(event.start + event.duration)}</p>
                            </div>
                            <div className="hidden sm:flex items-center space-x-1 opacity-0 group-hover/card:opacity-100 transition-opacity ml-1 bg-black/10 rounded-lg p-0.5 backdrop-blur-sm">
                              <button onClick={(e) => { e.stopPropagation(); onOpenEdit(event); }} title="Edit Event" className="p-1.5 hover:bg-white/20 rounded-md transition-colors"><Edit3 size={12} /></button>
                              <button onClick={(e) => { e.stopPropagation(); onOpenShare(event); }} title="Share / Copy event" className="p-1.5 hover:bg-white/20 rounded-md transition-colors"><Share2 size={12} /></button>
                            </div>
                          </div>
                          {event.location && <div className="flex items-center text-[9px] sm:text-[10px] opacity-90 mt-1 font-medium"><MapPin size={10} className="mr-1 flex-none" /><span className="truncate">{event.location}</span></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MonthView = ({ currentDate, events, members, onSelectDay }) => {
  const dateObj = new Date(currentDate + 'T12:00:00');
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon, etc.

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysOfWeekShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-3 sm:p-6">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-3 border-b pb-2 sm:pb-3">
        {daysOfWeek.map((day, idx) => (
          <span key={day} className="font-bold text-slate-400 text-xs sm:text-sm uppercase tracking-wider">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{daysOfWeekShort[idx]}</span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
        {/* Render empty offset slots for days prior to the 1st of the month */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[55px] sm:min-h-[110px] bg-slate-50/50 rounded-xl sm:rounded-2xl" />
        ))}

        {/* Render actual month days */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const paddedMonth = String(month + 1).padStart(2, '0');
          const paddedDay = String(day).padStart(2, '0');
          const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === currentDate;
          
          const safeEvents = Array.isArray(events) ? events : [];
          const dayEvents = safeEvents.filter(e => e && e.date === dateStr);
          
          return (
            <div 
              key={day} 
              onClick={() => onSelectDay(dateStr)} 
              className={`min-h-[55px] sm:min-h-[110px] p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isToday 
                  ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                  : isSelected 
                  ? 'border-indigo-300 bg-slate-50' 
                  : 'border-slate-100 hover:border-slate-300 hover:shadow-sm bg-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs sm:text-sm font-bold ${isToday ? 'bg-indigo-600 text-white w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {dayEvents.length} events
                  </span>
                )}
              </div>

              <div className="hidden sm:block space-y-1 mt-2">
                {dayEvents.slice(0, 2).map((evt, idx) => {
                  if (!evt) return null;
                  const safeMembers = Array.isArray(members) ? members : [];
                  const member = safeMembers.find(m => m && m.id === evt.memberId);
                  const colorClass = member && member.color ? member.color : 'bg-indigo-500';
                  return (
                    <div key={idx} className={`text-[11px] font-bold px-2 py-1 rounded-lg truncate text-white ${colorClass}`}>
                      {evt.title || 'Event'}
                    </div>
                  );
                })}
                {dayEvents.length > 2 && <p className="text-[10px] text-slate-400 font-semibold text-right">+{dayEvents.length - 2} more</p>}
              </div>

              <div className="flex sm:hidden flex-wrap gap-1 justify-center mt-1">
                {dayEvents.slice(0, 4).map((evt, idx) => {
                  if (!evt) return null;
                  const safeMembers = Array.isArray(members) ? members : [];
                  const member = safeMembers.find(m => m && m.id === evt.memberId);
                  const colorClass = member && member.color ? member.color : 'bg-indigo-500';
                  return <div key={idx} className={`w-2 h-2 rounded-full ${colorClass}`} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const YearView = ({ onSelectMonth }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {MONTH_NAMES.map((month, idx) => {
        const isCurrentMonth = idx === 9;
        return (
          <div key={month} onClick={() => onSelectMonth(month)} className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${isCurrentMonth ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-300 bg-white'}`}>
            <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-slate-800 text-sm sm:text-base">{month}</h3>{isCurrentMonth && <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">Current</span>}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}{Array.from({ length: 28 }, (_, i) => <div key={i} className={`h-4 rounded flex items-center justify-center font-medium ${i + 1 === 21 && isCurrentMonth ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'}`}>{i + 1}</div>)}</div>
          </div>
        );
      })}
    </div>
  );
};

export default function App() {
const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);  const [viewMode, setViewMode] = useState('day');
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('famsync-members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [events, setEvents] = useState(INITIAL_EVENTS);

  const [calendars, setCalendars] = useState(() => {
    const saved = localStorage.getItem('famsync-calendars');
    return saved ? JSON.parse(saved) : [];
  });

  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [shareModalEvent, setShareModalEvent] = useState(null);
  const [editModalEvent, setEditModalEvent] = useState(null);

 // REAL-TIME SUPABASE CLOUD SYNC LOGIC
  useEffect(() => {
    // 1. Fetch Events
    const fetchEvents = async () => {
      const { data, error } = await supabase.from('events').select('*');
      if (data && data.length > 0) setEvents(data);
    };

    // 2. Fetch Members
    const fetchMembers = async () => {
      const { data, error } = await supabase.from('members').select('*');
      if (data && data.length > 0) setMembers(data);
    };

    fetchEvents();
    fetchMembers();

    // 3. Listen for live changes on BOTH tables
    const channel = supabase
      .channel('realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const safeEvents = Array.isArray(events) ? events : [];
  const dayEvents = safeEvents.filter(e => e && e.date === currentDate);
  const freeTime = findFamilyFreeTime(dayEvents);

  useEffect(() => { localStorage.setItem('famsync-members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('famsync-calendars', JSON.stringify(calendars)); }, [calendars]);

  const adjustDate = (daysToAdd) => {
    const dateObj = new Date(currentDate + 'T12:00:00'); 
    dateObj.setDate(dateObj.getDate() + daysToAdd);
    setCurrentDate(dateObj.toISOString().split('T')[0]);
  };

const handleAddCalendar = async (url, memberId) => {
    try {
      // 1. Fetch .ics data via your serverless backend proxy
      const response = await fetch(`/api/ical-proxy?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const icsData = await response.text();

      // 2. Parse iCal data using ical.js
      const jcalData = ICAL.parse(icsData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');
      
      const newCalId = Date.now().toString();

      // 3. Map events to schema
      const newEvents = vevents.map(vevent => {
        const event = new ICAL.Event(vevent);
        const startDate = event.startDate ? event.startDate.toJSDate() : new Date();
        const startDecimal = startDate.getHours() + (startDate.getMinutes() / 60);
        
        return {
          id: `webcal-${newCalId}-${event.uid || Date.now() + Math.random()}`,
          title: event.summary || 'Imported Event',
          date: startDate.toISOString().split('T')[0],
          location: event.location || '',
          memberId: memberId,
          start: startDecimal,
          duration: 1
        };
      });

      // 4. Save to Supabase database
      await supabase.from('events').insert(newEvents);
      
      // 5. Update UI state
      const calName = comp.getFirstPropertyValue('x-wr-calname') || url;
      setCalendars(prev => [...prev, { id: newCalId, name: calName, memberId, lastSynced: 'Just now' }]);
      
      alert(`Success! Imported ${newEvents.length} events.`);
      return true; 
      
    } catch (error) {
      console.error("Calendar import failed:", error);
      alert("Could not import calendar. Ensure the iCloud link is public.");
      return false;
    }
  };
  const handleDeleteCalendar = (id) => {
    setCalendars(prev => prev.filter(c => c.id !== id));
    events.filter(e => e.id.includes(id)).forEach(e => handleDeleteEvent(e.id));
  };
  
  const handleRefreshCalendar = (id) => {
    setCalendars(prev => prev.map(c => c.id === id ? { ...c, lastSynced: 'Just now' } : c));
  };

  const handleAddMember = async (name, role, selectedColor) => {
  // 1. Package the exact new member data
  const newMember = { id: Date.now().toString(), name, role, ...selectedColor };
  
  // 2. Update the local screen instantly
  setMembers(prev => [...prev, newMember]);
  
  // 3. Save it straight to the Supabase cloud
  await supabase.from('members').insert([newMember]);
};

const handleDeleteMember = async (memberId) => {
  // 1. Remove from local screen (including linked events)
  setMembers(prev => prev.filter(m => m && m.id !== memberId));
  events.filter(e => e && e.memberId === memberId).forEach(e => handleDeleteEvent(e.id));
  
  // 2. Delete from the Supabase cloud
  await supabase.from('members').delete().eq('id', memberId);
};
const handleImportWebcal = async (webcalUrl, memberId) => {
  try {
    // 1. Convert link and route through a proxy to bypass CORS
    const httpsUrl = webcalUrl.replace('webcal://', 'https://').replace('webcals://', 'https://');
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(httpsUrl)}`;
    
    // 2. Fetch and parse the calendar data
    const response = await fetch(proxyUrl);
    const icsData = await response.text();
    const jcalData = ICAL.parse(icsData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
    
    // 3. Transform data to match your Supabase columns
    const newEvents = vevents.map(vevent => {
      const event = new ICAL.Event(vevent);
      const startDate = event.startDate ? event.startDate.toJSDate() : new Date();
      
      return {
        id: `webcal-${event.uid || Date.now() + Math.random()}`,
        title: event.summary || 'Imported Event',
        date: startDate.toISOString().split('T')[0],
        location: event.location || '',
        memberId: memberId,
        start: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: '1'
      };
    });

    // 4. Save to Supabase
    await supabase.from('events').insert(newEvents);
    alert(`Success! Imported ${newEvents.length} events.`);
    
  } catch (error) {
    console.error("Calendar import failed:", error);
    alert("Could not import calendar. Make sure the link is public and valid.");
  }
};
  const handleCreateEvent = async (newEvent) => {
    const eventToSave = { ...newEvent, id: newEvent.id || `e-${Date.now()}` };
    setEvents(prev => [...prev, eventToSave]); // Show instantly
    
    const { error } = await supabase.from('events').insert([eventToSave]);
    if (error) {
      console.error("Database save failed:", error);
      alert("Error saving event! It will disappear. Please check Supabase policies.");
      setEvents(prev => prev.filter(e => e.id !== eventToSave.id)); // Revert UI
    }
  };

  const handleMoveEvent = async (eventId, targetMemberId, newStart) => {
    const updated = { ...events.find(e => e.id === eventId), memberId: targetMemberId, start: newStart };
    setEvents(prev => prev.map(e => e && e.id === eventId ? updated : e));
    await supabase.from('events').update({ memberId: targetMemberId, start: newStart }).eq('id', eventId);
  };

  const handleSaveEvent = async (updatedEvent) => {
    setEvents(prev => prev.map(e => e && e.id === updatedEvent.id ? updatedEvent : e));
    await supabase.from('events').update(updatedEvent).eq('id', updatedEvent.id);
  };

  const handleDeleteEvent = async (eventId) => {
    setEvents(prev => prev.filter(e => e && e.id !== eventId));
    await supabase.from('events').delete().eq('id', eventId);
  };

  const handleShareEvent = async (event, targetMemberIds) => {
    const newEvents = targetMemberIds.map(mId => ({ ...event, id: `e-${Date.now()}-${mId}`, memberId: mId }));
    setEvents(prev => [...prev, ...newEvents]);
    await supabase.from('events').insert(newEvents);
  };

  const handleDaySelect = (dateStr) => {
    setCurrentDate(dateStr);
    setViewMode('day');
  };

  const displayDate = new Date(currentDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-wrap gap-3 items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-inner"><Users className="text-white w-5 h-5" /></div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">FamSync</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'day' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Day</button>
            <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Month</button>
            <button onClick={() => setViewMode('year')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Year</button>
          </div>
          
          <button 
            onClick={() => {
              setCurrentDate(new Date().toISOString().split('T')[0]);
              setViewMode('day');
            }} 
            className="px-4 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Today
          </button>

          <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-100 rounded-2xl px-2 sm:px-3 py-1.5">
            <button onClick={() => adjustDate(-1)} className="p-1 hover:bg-white rounded-lg transition-colors"><ChevronLeft size={16} /></button>
            <span className="font-bold text-slate-700 text-xs sm:text-sm min-w-[110px] sm:min-w-[130px] text-center">{viewMode === 'day' ? displayDate : viewMode === 'month' ? 'October 2026' : '2026'}</span>
            <button onClick={() => adjustDate(1)} className="p-1 hover:bg-white rounded-lg transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-3">
          <button onClick={() => setSyncModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-semibold transition-colors border border-indigo-100">
            <RefreshCw size={16} />
            <span>Manage Cal</span>
          </button>
          <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </nav>

      <div className="sm:hidden flex bg-white border-b border-slate-200 p-2 justify-around sticky top-[65px] z-30 shadow-sm">
         <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'day' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}>Day</button>
         <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}>Month</button>
         <button onClick={() => setSyncModalOpen(true)} className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 flex items-center"><RefreshCw size={12} className="mr-1" /> Sync</button>
      </div>

      <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-500 text-xs sm:text-sm mb-1">Day Overview</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-800">{dayEvents.length}</span>
              <span className="text-slate-500 font-medium text-xs sm:text-sm">Total Events on {displayDate}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col mt-2 sm:mt-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">{viewMode === 'day' && 'Daily Schedule'}{viewMode === 'month' && 'Monthly Overview'}{viewMode === 'year' && 'Year View'}</h2>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button onClick={() => setAddMemberOpen(true)} className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center"><UserPlus size={16} className="sm:mr-1.5" /> <span className="hidden sm:inline">Add Member</span></button>
              <button onClick={() => setAddEventOpen(true)} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center"><Plus size={16} className="sm:mr-1" /> <span className="hidden sm:inline">Add Event</span></button>
            </div>
          </div>
          {viewMode === 'day' && <Timeline events={dayEvents} members={members} onDeleteMember={handleDeleteMember} onMoveEvent={handleMoveEvent} onOpenShare={(evt) => setShareModalEvent(evt)} onOpenEdit={(evt) => setEditModalEvent(evt)} />}
          {viewMode === 'month' && <MonthView currentDate={currentDate} events={events} members={members} onSelectDay={handleDaySelect} />}
          {viewMode === 'year' && <YearView onSelectMonth={() => setViewMode('month')} />}
        </div>
      </main>
      <SyncModal isOpen={syncModalOpen} onClose={() => setSyncModalOpen(false)} members={members} calendars={calendars} onAddCalendar={handleAddCalendar} onDeleteCalendar={handleDeleteCalendar} onRefreshCalendar={handleRefreshCalendar} />
      <AddMemberModal isOpen={addMemberOpen} onClose={() => setAddMemberOpen(false)} onAddMember={handleAddMember} />
      <AddEventModal isOpen={addEventOpen} onClose={() => setAddEventOpen(false)} members={members} currentDate={currentDate} onCreateEvent={handleCreateEvent} />
      <ShareEventModal isOpen={Boolean(shareModalEvent)} onClose={() => setShareModalEvent(null)} event={shareModalEvent} members={members} onShareEvent={handleShareEvent} />
      <EditEventModal isOpen={Boolean(editModalEvent)} onClose={() => setEditModalEvent(null)} event={editModalEvent} members={members} onSaveEvent={handleSaveEvent} onDeleteEvent={handleDeleteEvent} />
    </div>
  );
}