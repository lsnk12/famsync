import React, { useEffect, useRef } from 'react';
import { Trash2, Edit3, Share2, MapPin } from 'lucide-react';

export const Timeline = ({ events, members, onDeleteMember, onMoveEvent, onOpenShare, onOpenEdit, formatTime, START_HOUR, END_HOUR, HOUR_WIDTH }) => {
  const containerRef = useRef(null);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = (8 - START_HOUR) * HOUR_WIDTH - 50;
    }
  }, [START_HOUR, HOUR_WIDTH]);

  const handleDragStart = (e, eventId) => {
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetMemberId) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    if (!eventId) return;

    const rowRect = e.currentTarget.getBoundingClientRect();
    const dropX = e.clientX - rowRect.left;
    const hourOffset = dropX / HOUR_WIDTH;
    let newStart = Math.round((START_HOUR + hourOffset) * 2) / 2;
    newStart = Math.max(START_HOUR, Math.min(END_HOUR - 1, newStart));

    onMoveEvent(eventId, targetMemberId, newStart);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="flex border-b border-slate-100 bg-slate-50 sticky top-0 z-10 pl-28 lg:pl-56">
        <div ref={containerRef} className="flex overflow-x-auto no-scrollbar pb-2 pt-4 w-full scroll-smooth" style={{ scrollbarWidth: 'none' }}>
          {hours.map(hour => (
            <div key={hour} className="flex-none flex flex-col items-start px-2" style={{ width: `${HOUR_WIDTH}px` }}>
              <span className="text-xs font-semibold text-slate-400 mb-1">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </span>
              <div className="h-2 border-l border-slate-200"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-slate-50">
        {members.map(member => (
          <div 
            key={member.id} 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, member.id)}
            className="group relative flex border-b border-slate-100 hover:bg-slate-100 transition-colors min-h-[100px]"
          >
            <div className="w-28 lg:w-56 flex-none bg-white border-r border-slate-100 p-4 sticky left-0 z-20 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${member.color}`}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <h3 className="font-bold text-slate-800 text-sm">{member.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block ${member.lightColor} ${member.text}`}>
                    {member.role}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => onDeleteMember(member.id)}
                title={`Remove ${member.name}`}
                className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden">
               <div className="absolute inset-0 flex pointer-events-none opacity-20">
                 {hours.map(h => (
                   <div key={`grid-${h}`} className="h-full border-l border-slate-300 border-dashed" style={{ width: `${HOUR_WIDTH}px` }} />
                 ))}
               </div>

              {events.filter(e => e.memberId === member.id).map(event => {
                const leftPos = (event.start - START_HOUR) * HOUR_WIDTH;
                const width = event.duration * HOUR_WIDTH;
                return (
                  <div 
                    key={event.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, event.id)}
                    className={`absolute top-3 bottom-3 rounded-xl p-3 shadow-sm hover:shadow-md transition-all overflow-hidden border border-white cursor-grab active:cursor-grabbing ${member.color} text-white group/card`} 
                    style={{ left: `${leftPos}px`, width: `${width - 4}px` }}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-sm truncate">{event.title}</h4>
                          <p className="text-xs opacity-90 truncate mt-0.5">{formatTime(event.start)} - {formatTime(event.start + event.duration)}</p>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover/card:opacity-100 transition-opacity ml-1">
                          <button 
                            onClick={() => onOpenEdit(event)}
                            title="Edit Event"
                            className="p-1 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-colors"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button 
                            onClick={() => onOpenShare(event)}
                            title="Share / Copy event"
                            className="p-1 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-colors"
                          >
                            <Share2 size={12} />
                          </button>
                        </div>
                      </div>

                      {event.location && (
                        <div className="flex items-center text-[10px] opacity-80 mt-1">
                          <MapPin size={10} className="mr-1 flex-none" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MonthView = ({ events, members, onSelectDay }) => {
  const daysInMonth = 31;
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6">
      <div className="grid grid-cols-7 gap-2 text-center mb-4 border-b pb-3">
        {daysOfWeek.map(day => (
          <span key={day} className="font-bold text-slate-400 text-sm uppercase tracking-wider">{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const isToday = day === 19;
          const dayEvents = events.slice(0, (day % 4) + 1);

          return (
            <div 
              key={day}
              onClick={() => onSelectDay(day)}
              className={`min-h-[110px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isToday ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-100 hover:border-slate-300 hover:shadow-sm bg-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-sm font-bold ${isToday ? 'bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {dayEvents.length} events
                  </span>
                )}
              </div>

              <div className="space-y-1 mt-2">
                {dayEvents.slice(0, 2).map((evt, idx) => {
                  const member = members.find(m => m.id === evt.memberId) || members[0];
                  return (
                    <div key={idx} className={`text-[11px] font-bold px-2 py-1 rounded-lg truncate text-white ${member ? member.color : 'bg-indigo-500'}`}>
                      {evt.title}
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <p className="text-[10px] text-slate-400 font-semibold text-right">+{dayEvents.length - 2} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const YearView = ({ MONTH_NAMES, onSelectMonth }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {MONTH_NAMES.map((month, idx) => {
        const isCurrentMonth = idx === 9;
        return (
          <div 
            key={month}
            onClick={() => onSelectMonth(month)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
              isCurrentMonth ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800 text-base">{month}</h3>
              {isCurrentMonth && <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">Current</span>}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
              {Array.from({ length: 28 }, (_, i) => (
                <div key={i} className={`h-4 rounded flex items-center justify-center font-medium ${i + 1 === 19 && isCurrentMonth ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};