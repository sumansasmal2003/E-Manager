import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  Square,
  Clock,
  Users,
  ArrowRight,
  X,
  ExternalLink,
  MoreHorizontal,
  BarChart3,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Enhanced custom hook for event grouping with better algorithms
const useGroupedEvents = (events, view) => {
  return useMemo(() => {
    if (view === Views.MONTH) {
      return events;
    }

    // For Week and Day views, implement advanced grouping
    const groupedEvents = [];
    const eventsByHour = {};

    // Group events by hour slots with 15-minute intervals
    events.forEach(event => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      const hour = event.start.getHours();
      const minute = event.start.getMinutes();
      const slotKey = `${dateKey}-${hour}-${Math.floor(minute / 15)}`;

      if (!eventsByHour[slotKey]) {
        eventsByHour[slotKey] = [];
      }
      eventsByHour[slotKey].push(event);
    });

    // Process each time slot
    Object.entries(eventsByHour).forEach(([slotKey, slotEvents]) => {
      if (slotEvents.length === 1) {
        groupedEvents.push(slotEvents[0]);
      } else {
        // Sort events by duration (shorter events first)
        const sortedEvents = slotEvents.sort((a, b) =>
          (a.end - a.start) - (b.end - b.start)
        );

        // Show the shortest event and create a "+ more" event
        const primaryEvent = sortedEvents[0];
        groupedEvents.push(primaryEvent);

        // Create enhanced "+ more" event
        const moreEvent = {
          id: `more-${slotKey}`,
          title: `+${sortedEvents.length - 1} more`,
          start: new Date(primaryEvent.start),
          end: new Date(primaryEvent.end),
          isMoreEvent: true,
          allEvents: sortedEvents,
          resource: {
            type: 'more',
            originalEvents: sortedEvents,
            slotTime: format(primaryEvent.start, 'HH:mm')
          }
        };

        // Position the more event intelligently
        moreEvent.start.setMinutes(moreEvent.start.getMinutes() + 5);
        moreEvent.end.setMinutes(moreEvent.end.getMinutes() + 15);

        groupedEvents.push(moreEvent);
      }
    });

    return groupedEvents;
  }, [events, view]);
};

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMoreEvents, setShowMoreEvents] = useState(false);
  const [moreEventsData, setMoreEventsData] = useState({ events: [], date: null, timeSlot: null });
  const [showTaskEvents, setShowTaskEvents] = useState(true);
  const [showMeetingEvents, setShowMeetingEvents] = useState(true);
  const navigate = useNavigate();

  // Enhanced event filtering
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const isTask = event.resource?.type === 'task';
      if (isTask && !showTaskEvents) return false;
      if (!isTask && !showMeetingEvents) return false;
      return true;
    });
  }, [events, showTaskEvents, showMeetingEvents]);

  // Use custom hook to get grouped events for Week and Day views
  const groupedEvents = useGroupedEvents(filteredEvents, view);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/calendar');

        const formattedEvents = res.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(formattedEvents);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load calendar events');
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // Enhanced calendar styles with responsive design
  const calendarStyles = {
    height: '70vh',
    minHeight: '600px',
    fontFamily: 'inherit',
  };

  // Professional event styling with better color coding
  const eventStyleGetter = (event) => {
    if (event.isMoreEvent) {
      return {
        style: {
          backgroundColor: '#4b5563',
          borderRadius: '8px',
          border: 'none',
          color: 'white',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: '600',
          cursor: 'pointer',
          opacity: 0.95,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      };
    }

    const isTask = event.resource?.type === 'task';
    const backgroundColor = isTask ? '#111827' : '#059669';
    const borderColor = isTask ? '#1f2937' : '#047857';

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '8px',
        border: 'none',
        color: 'white',
        padding: '6px 8px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        opacity: 0.95,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
      },
    };
  };

  // Enhanced Month View Event Component
  const CustomMonthEvent = ({ event }) => {
    const isTask = event.resource?.type === 'task';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-2 rounded-lg text-white text-xs font-medium cursor-pointer hover:shadow-md transition-all duration-200 truncate border-l-4 ${
          isTask
            ? 'bg-primary border-gray-700 hover:bg-gray-800'
            : 'bg-green-600 border-green-500 hover:bg-green-500'
        }`}
        title={`${event.title} (${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')})`}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isTask ? 'bg-gray-300' : 'bg-green-200'}`}></div>
          <span className="truncate text-[11px] font-semibold">{event.title}</span>
        </div>
        <div className="text-[10px] opacity-90 mt-1 truncate">
          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
        </div>
      </motion.div>
    );
  };

  // Enhanced Week View Event Component
  const CustomWeekEvent = ({ event }) => {
    if (event.isMoreEvent) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-2 rounded-lg bg-gray-600 text-white text-xs font-semibold cursor-pointer hover:bg-gray-700 transition-all duration-200 h-full flex items-center justify-center shadow-sm"
          title={`Click to see ${event.allEvents.length - 1} more events at ${event.resource.slotTime}`}
        >
          <div className="flex items-center space-x-1">
            <MoreHorizontal size={12} />
            <span className="text-[10px]">{event.title}</span>
          </div>
        </motion.div>
      );
    }

    const isTask = event.resource?.type === 'task';
    const duration = Math.round((event.end - event.start) / (1000 * 60)); // Duration in minutes

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-2 rounded-lg text-white text-xs font-medium cursor-pointer hover:shadow-lg transition-all duration-200 h-full overflow-hidden border-l-4 ${
          isTask
            ? 'bg-primary border-gray-700 hover:bg-gray-800'
            : 'bg-green-600 border-green-500 hover:bg-green-500'
        }`}
        title={`${event.title} (${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')})`}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center space-x-1 flex-1 min-w-0">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isTask ? 'bg-gray-300' : 'bg-green-200'}`}></div>
            <span className="text-[10px] font-semibold truncate">
              {isTask ? 'Task' : 'Meeting'}
            </span>
          </div>
          <div className="text-[9px] opacity-80 bg-black bg-opacity-20 px-1 rounded flex-shrink-0">
            {duration}m
          </div>
        </div>
        <div className="font-semibold truncate leading-tight text-[11px] mb-1">{event.title}</div>
        <div className="text-[10px] opacity-90 truncate">
          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
        </div>
        {event.resource?.teamName && (
          <div className="text-[9px] opacity-75 truncate mt-1">
            {event.resource.teamName}
          </div>
        )}
      </motion.div>
    );
  };

  // Enhanced Day View Event Component
  const CustomDayEvent = ({ event }) => {
    if (event.isMoreEvent) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-xl bg-gray-600 text-white text-sm font-semibold cursor-pointer hover:bg-gray-700 transition-all duration-200 h-full flex items-center justify-center shadow-md"
          title={`Click to see ${event.allEvents.length - 1} more events at ${event.resource.slotTime}`}
        >
          <div className="flex items-center space-x-2">
            <MoreHorizontal size={14} />
            <span className="text-sm">{event.title}</span>
          </div>
        </motion.div>
      );
    }

    const isTask = event.resource?.type === 'task';
    const duration = Math.round((event.end - event.start) / (1000 * 60));

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-3 rounded-xl text-white text-sm font-medium cursor-pointer hover:shadow-lg transition-all duration-200 h-full overflow-hidden border-l-4 ${
          isTask
            ? 'bg-primary border-gray-700 hover:bg-gray-800'
            : 'bg-green-600 border-green-500 hover:bg-green-500'
        }`}
        title={`${event.title} (${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')})`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isTask ? 'bg-gray-300' : 'bg-green-200'}`}></div>
            <span className="text-xs font-semibold">
              {isTask ? 'Task' : 'Meeting'}
            </span>
          </div>
          <div className="text-xs opacity-80 bg-black bg-opacity-20 px-2 py-1 rounded">
            {duration}m
          </div>
        </div>
        <div className="font-semibold truncate text-sm mb-2">{event.title}</div>
        <div className="text-xs opacity-90 mb-2">
          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
        </div>
        {event.resource?.teamName && (
          <div className="text-xs opacity-75 truncate">
            Team: {event.resource.teamName}
          </div>
        )}
        {event.resource?.description && (
          <div className="text-xs opacity-75 truncate mt-1">
            {event.resource.description}
          </div>
        )}
      </motion.div>
    );
  };

  // Custom Event Component that switches based on view
  const CustomEvent = ({ event }) => {
    if (view === Views.MONTH) {
      return <CustomMonthEvent event={event} />;
    } else if (view === Views.WEEK) {
      return <CustomWeekEvent event={event} />;
    } else {
      return <CustomDayEvent event={event} />;
    }
  };

  // Enhanced Toolbar with Filter Controls
  const CustomToolbar = ({ label, onNavigate, onView }) => {
    return (
      <div className="flex flex-col space-y-4 mb-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <CalendarIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Calendar</h1>
              <p className="text-gray-600">Manage your schedule and team events</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Navigation Buttons */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => onNavigate('TODAY')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-white rounded-md transition-all duration-200"
              >
                Today
              </button>
              <div className="flex space-x-1">
                <button
                  onClick={() => onNavigate('PREV')}
                  className="p-2 text-gray-600 hover:text-primary hover:bg-white rounded-md transition-all duration-200"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => onNavigate('NEXT')}
                  className="p-2 text-gray-600 hover:text-primary hover:bg-white rounded-md transition-all duration-200"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* View Buttons */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => onView(Views.MONTH)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                  view === Views.MONTH
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-700 hover:text-primary hover:bg-white'
                }`}
              >
                <Grid size={16} />
                <span>Month</span>
              </button>
              <button
                onClick={() => onView(Views.WEEK)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                  view === Views.WEEK
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-700 hover:text-primary hover:bg-white'
                }`}
              >
                <List size={16} />
                <span>Week</span>
              </button>
              <button
                onClick={() => onView(Views.DAY)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                  view === Views.DAY
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-700 hover:text-primary hover:bg-white'
                }`}
              >
                <Square size={16} />
                <span>Day</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Info Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTaskEvents(!showTaskEvents)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  showTaskEvents
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {showTaskEvents ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>Tasks ({events.filter(e => e.resource?.type === 'task').length})</span>
              </button>
              <button
                onClick={() => setShowMeetingEvents(!showMeetingEvents)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  showMeetingEvents
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {showMeetingEvents ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>Meetings ({events.filter(e => e.resource?.type !== 'task').length})</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>{filteredEvents.length} events</span>
            </div>
            <div className="text-lg font-semibold text-primary">{label}</div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced event selection handler
  const handleSelectEvent = (event) => {
    if (event.isMoreEvent) {
      const otherEvents = event.allEvents.slice(1);
      setMoreEventsData({
        events: otherEvents,
        date: event.start,
        timeSlot: event.resource.slotTime
      });
      setShowMoreEvents(true);
    } else {
      setSelectedEvent(event);
      setShowEventModal(true);
    }
  };

  // Enhanced slot selection
  const handleSelectSlot = ({ start, end }) => {
    console.log('Selected slot for new event:', start, end);
    // You can implement event creation modal here
  };

  // Handle "more" button click (for Month view built-in functionality)
  const handleShowMore = (events, date) => {
    setMoreEventsData({ events, date, timeSlot: 'Multiple' });
    setShowMoreEvents(true);
  };

  // Navigate to team page
  const handleNavigateToTeam = (teamId) => {
    if (teamId) {
      navigate(`/team/${teamId}`);
      setShowEventModal(false);
    }
  };

  // Format time for display
  const formatTime = (date) => {
    return format(date, 'HH:mm');
  };

  // Format date for display
  const formatDate = (date) => {
    return format(date, 'MMMM dd, yyyy');
  };

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar events...</p>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="max-w-md w-full p-6 bg-white border border-red-200 rounded-xl shadow-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">Failed to Load Calendar</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Calendar Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Calendar
            localizer={localizer}
            events={view === Views.MONTH ? filteredEvents : groupedEvents}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            view={view}
            onNavigate={setCurrentDate}
            onView={setView}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onShowMore={handleShowMore}
            selectable
            popup
            components={{
              toolbar: CustomToolbar,
              event: CustomEvent,
            }}
            eventPropGetter={eventStyleGetter}
            style={calendarStyles}
            min={new Date(0, 0, 0, 6, 0, 0)} // Start at 6 AM
            max={new Date(0, 0, 0, 22, 0, 0)} // End at 10 PM
            step={30} // 30 minute steps
            timeslots={view === Views.DAY ? 1 : 2} // More granular for day view
            messages={{
              next: "Next",
              previous: "Prev",
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
              agenda: "Agenda",
              date: "Date",
              time: "Time",
              event: "Event",
              noEventsInRange: "No events in this range",
              showMore: (total) => `+${total} more`,
            }}
          />
        </div>

        {/* Enhanced Event Details Modal */}
        <AnimatePresence>
          {showEventModal && selectedEvent && (
            <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-primary mb-2">{selectedEvent.title}</h3>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                        selectedEvent.resource?.type === 'task'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedEvent.resource?.type === 'task' ? 'Task' : 'Meeting'}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEventModal(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-6">
                    {/* Time */}
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                      <Clock size={20} className="text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-primary text-lg">
                          {formatDate(selectedEvent.start)}
                        </div>
                        <div className="text-gray-600">
                          {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Duration: {Math.round((selectedEvent.end - selectedEvent.start) / (1000 * 60))} minutes
                        </div>
                      </div>
                    </div>

                    {/* Team */}
                    {selectedEvent.resource?.teamName && (
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                        <Users size={20} className="text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Team</div>
                          <div className="font-semibold text-primary text-lg">{selectedEvent.resource.teamName}</div>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {selectedEvent.resource?.description && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-sm font-medium text-gray-700 mb-3">Description</div>
                        <p className="text-gray-600 leading-relaxed">{selectedEvent.resource.description}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200">
                      {selectedEvent.resource?.teamId && (
                        <button
                          onClick={() => handleNavigateToTeam(selectedEvent.resource.teamId)}
                          className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-3 font-semibold shadow-sm"
                        >
                          <span>View Team Details</span>
                          <ArrowRight size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Enhanced More Events Modal */}
        <AnimatePresence>
          {showMoreEvents && moreEventsData.date && (
            <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-primary">
                        {format(moreEventsData.date, 'MMMM dd, yyyy')}
                      </h3>
                      <p className="text-gray-600">
                        {moreEventsData.timeSlot && `${moreEventsData.timeSlot} • `}
                        {moreEventsData.events.length} event{moreEventsData.events.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMoreEvents(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Enhanced Events List */}
                  <div className="space-y-4">
                    {moreEventsData.events.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${
                          event.resource?.type === 'task'
                            ? 'border-primary bg-gray-50 hover:bg-gray-100'
                            : 'border-green-500 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-primary text-lg mb-1">{event.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
                              <span>•</span>
                              <span>{Math.round((event.end - event.start) / (1000 * 60))}m</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            event.resource?.type === 'task'
                              ? 'bg-gray-200 text-gray-800'
                              : 'bg-green-200 text-green-800'
                          }`}>
                            {event.resource?.type === 'task' ? 'Task' : 'Meeting'}
                          </span>
                        </div>

                        {event.resource?.teamName && (
                          <div className="text-sm text-gray-700 mb-2">
                            <span className="font-medium">Team:</span> {event.resource.teamName}
                          </div>
                        )}

                        {event.resource?.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {event.resource.description}
                          </p>
                        )}

                        {event.resource?.teamId && (
                          <button
                            onClick={() => handleNavigateToTeam(event.resource.teamId)}
                            className="text-sm text-gray-600 hover:text-primary flex items-center space-x-2 transition-colors font-medium"
                          >
                            <span>View Team Details</span>
                            <ExternalLink size={14} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Custom CSS for calendar */}
      <style jsx global>{`
        /* Enhanced calendar styling */
        .rbc-calendar {
          font-family: inherit !important;
          background: white !important;
        }

        /* Time gutter enhancements */
        .rbc-time-gutter {
          background-color: #f8fafc !important;
          border-right: 1px solid #e2e8f0 !important;
          min-width: 80px !important;
          padding: 0 12px !important;
        }

        .rbc-time-header-gutter {
          background-color: #f8fafc !important;
          border-right: 1px solid #e2e8f0 !important;
          min-width: 80px !important;
        }

        .rbc-time-header-cell {
          background-color: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 16px 12px !important;
          font-weight: 600 !important;
          color: #374151 !important;
          font-size: 14px !important;
        }

        .rbc-time-content {
          border-top: 1px solid #e2e8f0 !important;
          overflow-y: auto !important;
          display: flex !important;
          background: white !important;
        }

        /* Enhanced day slots */
        .rbc-day-slot {
          min-height: 120px !important;
          position: relative !important;
          background: white !important;
        }

        .rbc-time-view {
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }

        /* Enhanced time slots */
        .rbc-time-slot {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 8px 12px !important;
          font-size: 13px !important;
          color: #6b7280 !important;
          font-weight: 500 !important;
        }

        .rbc-timeslot-group {
          min-height: 80px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }

        /* Event container improvements */
        .rbc-events-container {
          margin-right: 0px !important;
        }

        .rbc-event {
          border: none !important;
          padding: 0 !important;
          margin: 2px 4px !important;
          overflow: hidden !important;
          background: transparent !important;
        }

        /* Enhanced scrollbar */
        .rbc-time-content::-webkit-scrollbar {
          width: 8px !important;
        }

        .rbc-time-content::-webkit-scrollbar-track {
          background: #f1f5f9 !important;
          border-radius: 4px !important;
        }

        .rbc-time-content::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 4px !important;
        }

        .rbc-time-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
        }

        /* Month view enhancements */
        .rbc-month-view {
          border-radius: 12px !important;
          overflow: hidden !important;
        }

        .rbc-month-view .rbc-event {
          margin: 2px !important;
          min-height: 24px !important;
        }

        /* Enhanced time labels */
        .rbc-time-gutter .rbc-timeslot-group {
          display: flex !important;
          align-items: flex-start !important;
          justify-content: center !important;
          padding: 0 12px !important;
        }

        .rbc-label {
          font-size: 13px !important;
          color: #6b7280 !important;
          font-weight: 500 !important;
        }

        /* Header improvements */
        .rbc-time-header-content {
          border-left: 1px solid #e2e8f0 !important;
        }

        .rbc-header {
          padding: 16px 12px !important;
          font-weight: 600 !important;
          color: #374151 !important;
          border-bottom: 1px solid #e2e8f0 !important;
          border-right: 1px solid #e2e8f0 !important;
          background: #f8fafc !important;
          font-size: 14px !important;
        }

        .rbc-header:last-child {
          border-right: none !important;
        }

        /* Today highlight */
        .rbc-today {
          background-color: #eff6ff !important;
        }

        /* Current time indicator */
        .rbc-current-time-indicator {
          background-color: #ef4444 !important;
          height: 2px !important;
        }

        /* Month view date cells */
        .rbc-date-cell {
          padding: 8px !important;
          text-align: center !important;
          font-weight: 500 !important;
        }

        .rbc-date-cell.rbc-now {
          font-weight: 700 !important;
          color: #ef4444 !important;
        }

        /* Add some spacing between events in month view */
        .rbc-row-bg {
          gap: 2px !important;
        }

        /* Improve event hover states */
        .rbc-event:focus {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }

        /* Week view day columns */
        .rbc-day-bg {
          border-right: 1px solid #e2e8f0 !important;
        }

        .rbc-day-bg:last-child {
          border-right: none !important;
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
