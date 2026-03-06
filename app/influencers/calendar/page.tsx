'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users, Video, Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'campaign' | 'meeting' | 'deadline' | 'post';
  description?: string;
  location?: string;
  attendees?: number;
  color: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Mock events data
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Summer Fashion Campaign - Content Due',
      date: new Date(2026, 0, 30),
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      type: 'deadline',
      description: 'Submit final content for review',
      color: 'bg-red-100 border-red-500 text-red-700'
    },
    {
      id: '2',
      title: 'Brand Meeting - Nike',
      date: new Date(2026, 0, 28),
      startTime: '02:00 PM',
      endTime: '03:00 PM',
      type: 'meeting',
      description: 'Discuss Q2 partnership opportunities',
      location: 'Zoom',
      attendees: 4,
      color: 'bg-blue-100 border-blue-500 text-blue-700'
    },
    {
      id: '3',
      title: 'Instagram Post - Product Launch',
      date: new Date(2026, 0, 28),
      startTime: '05:00 PM',
      endTime: '05:30 PM',
      type: 'post',
      description: 'Post product launch content',
      color: 'bg-brand-navy-50 border-brand-navy text-brand-navy'
    },
    {
      id: '4',
      title: 'Eco-Friendly Beauty Campaign',
      date: new Date(2026, 1, 2),
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      type: 'campaign',
      description: 'Campaign kickoff meeting',
      location: 'Virtual',
      attendees: 6,
      color: 'bg-green-100 border-green-500 text-green-700'
    },
    {
      id: '5',
      title: 'Content Review Call',
      date: new Date(2026, 1, 5),
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      type: 'meeting',
      description: 'Review draft content with brand team',
      location: 'Google Meet',
      attendees: 3,
      color: 'bg-blue-100 border-blue-500 text-blue-700'
    },
  ];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarGrid = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-gray-50 border border-gray-200 min-h-[100px] p-2" />
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isTodayDate = isToday(date);

      days.push(
        <div
          key={day}
          className={`border border-gray-200 min-h-[100px] p-2 hover:bg-gray-50 transition-colors ${
            isTodayDate ? 'bg-blue-50 border-blue-300' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-blue-600' : 'text-gray-700'}`}>
            {isTodayDate && (
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-600 rounded-full">
                {day}
              </span>
            )}
            {!isTodayDate && day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded border-l-2 ${event.color} cursor-pointer hover:opacity-80 transition-opacity`}
                title={event.title}
              >
                <div className="font-medium truncate">{event.title}</div>
                <div className="text-xs opacity-75">{event.startTime}</div>
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 font-medium pl-1">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderUpcomingEvents = () => {
    const today = new Date();
    const upcomingEvents = events
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);

    return (
      <div className="space-y-3">
        {upcomingEvents.map(event => (
          <div
            key={event.id}
            className={`p-4 rounded-lg border-l-4 ${event.color} bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                  {event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.attendees && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  )}
                </div>
                {event.description && (
                  <p className="text-xs text-gray-500 mt-2">{event.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your campaigns, meetings, and deadlines</p>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy/90 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="font-medium">New Event</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Day
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {dayNames.map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200">
              {renderCalendarGrid()}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Event Types</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-100 border-2 border-red-500" />
                  <span className="text-xs text-gray-600">Deadline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-100 border-2 border-blue-500" />
                  <span className="text-xs text-gray-600">Meeting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-brand-navy-50 border-2 border-brand-navy" />
                  <span className="text-xs text-gray-600">Post</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-100 border-2 border-green-500" />
                  <span className="text-xs text-gray-600">Campaign</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h2>
              {renderUpcomingEvents()}
              {events.filter(e => e.date >= new Date()).length === 0 && (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No upcoming events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
