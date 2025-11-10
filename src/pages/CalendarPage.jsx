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
  ExternalLink
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

// Custom hook to create grouped events for Week and Day views
const useGroupedEvents = (events, view) => {
  return useMemo(() => {
    if (view === Views.MONTH) {
      return events; // Use built-in month view behavior
    }

    // For Week and Day views, we need to manually group events
    const groupedEvents = [];
    const eventsBySlot = {};

    // Group events by time slot (date + hour)
    events.forEach(event => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      const hourKey = format(event.start, 'HH');
      const slotKey = `${dateKey}-${hourKey}`;

      if (!eventsBySlot[slotKey]) {
        eventsBySlot[slotKey] = [];
      }
      eventsBySlot[slotKey].push(event);
    });

    // Create grouped events - show only first event and a "+ more" event
    Object.entries(eventsBySlot).forEach(([slotKey, slotEvents]) => {
      if (slotEvents.length === 1) {
        // Single event in this slot
        groupedEvents.push(slotEvents[0]);
      } else {
        // Multiple events - show first event and a "+ more" event
        const firstEvent = slotEvents[0];
        groupedEvents.push(firstEvent);

        // Create a "+ more" event
        const moreEvent = {
          id: `more-${slotKey}`,
          title: `+${slotEvents.length - 1} more`,
          start: new Date(firstEvent.start),
          end: new Date(firstEvent.end),
          isMoreEvent: true,
          allEvents: slotEvents,
          resource: {
            type: 'more',
            originalEvents: slotEvents
          }
        };

        // Adjust the time slightly to appear after the first event
        moreEvent.start.setMinutes(moreEvent.start.getMinutes() + 10);
        moreEvent.end.setMinutes(moreEvent.end.getMinutes() + 20);

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
  const [moreEventsData, setMoreEventsData] = useState({ events: [], date: null });
  const navigate = useNavigate();

  // Use custom hook to get grouped events for Week and Day views
  const groupedEvents = useGroupedEvents(events, view);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/calendar');

        // Convert date strings from API to Date objects
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

  // Custom styles for the calendar
  const calendarStyles = {
    height: '70vh',
    minHeight: '600px',
  };

  // Custom event styles
  const eventStyleGetter = (event) => {
    if (event.isMoreEvent) {
      return {
        style: {
          backgroundColor: '#6b7280',
          borderRadius: '4px',
          border: 'none',
          color: 'white',
          padding: '2px 6px',
          fontSize: '11px',
          fontWeight: '600',
          cursor: 'pointer',
          opacity: 0.9,
        },
      };
    }

    const isTask = event.resource?.type === 'task';
    const backgroundColor = isTask ? '#111827' : '#10b981';

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        border: 'none',
        color: 'white',
        padding: '2px 6px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        opacity: 0.9,
      },
    };
  };

  // Custom Month View Event Component
  const CustomMonthEvent = ({ event }) => {
    const isTask = event.resource?.type === 'task';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-1 rounded text-white text-xs font-medium cursor-pointer hover:shadow-md transition-shadow truncate ${
          isTask ? 'bg-gray-900' : 'bg-green-500'
        }`}
        title={event.title}
      >
        <div className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-white bg-opacity-50 rounded-full"></div>
          <span className="truncate text-[11px]">{event.title}</span>
        </div>
      </motion.div>
    );
  };

  // Custom Week View Event Component
  const CustomWeekEvent = ({ event }) => {
    if (event.isMoreEvent) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-1 rounded bg-gray-500 text-white text-xs font-medium cursor-pointer hover:bg-gray-600 transition-colors h-full flex items-center justify-center"
          title={`Click to see ${event.allEvents.length - 1} more events`}
        >
          <span className="font-semibold text-[10px]">{event.title}</span>
        </motion.div>
      );
    }

    const isTask = event.resource?.type === 'task';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-1 rounded text-white text-xs font-medium cursor-pointer hover:shadow-md transition-shadow h-full overflow-hidden ${
          isTask ? 'bg-gray-900' : 'bg-green-500'
        }`}
        title={`${event.title} (${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')})`}
      >
        <div className="flex items-center space-x-1 mb-0.5">
          <div className="w-1 h-1 bg-white bg-opacity-50 rounded-full flex-shrink-0"></div>
          <span className="text-[10px] font-semibold truncate flex-shrink-0">
            {isTask ? 'Task' : 'Meeting'}
          </span>
        </div>
        <div className="font-semibold truncate leading-tight text-[11px]">{event.title}</div>
        <div className="text-[10px] opacity-90 truncate mt-0.5">
          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
        </div>
      </motion.div>
    );
  };

  // Custom Day View Event Component
  const CustomDayEvent = ({ event }) => {
    if (event.isMoreEvent) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-2 rounded-lg bg-gray-500 text-white text-sm font-medium cursor-pointer hover:bg-gray-600 transition-colors h-full flex items-center justify-center"
          title={`Click to see ${event.allEvents.length - 1} more events`}
        >
          <span className="font-semibold">{event.title}</span>
        </motion.div>
      );
    }

    const isTask = event.resource?.type === 'task';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-2 rounded-lg text-white text-sm font-medium cursor-pointer hover:shadow-md transition-shadow h-full overflow-hidden ${
          isTask ? 'bg-gray-900' : 'bg-green-500'
        }`}
        title={`${event.title} (${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')})`}
      >
        <div className="flex items-center space-x-1 mb-1">
          <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full"></div>
          <span className="text-xs font-semibold truncate">
            {isTask ? 'Task' : 'Meeting'}
          </span>
        </div>
        <div className="font-semibold truncate">{event.title}</div>
        <div className="text-xs opacity-90 truncate mt-1">
          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
        </div>
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

  // Custom Toolbar Component
  const CustomToolbar = ({ label, onNavigate, onView }) => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="p-2 bg-gray-900 rounded-lg">
            <CalendarIcon className="text-white" size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Calendar</h2>
          <span className="hidden sm:block text-lg font-semibold text-gray-700">{label}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onNavigate('TODAY')}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
            >
              Today
            </button>
            <div className="flex space-x-1">
              <button
                onClick={() => onNavigate('PREV')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => onNavigate('NEXT')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* View Buttons */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onView(Views.MONTH)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                view === Views.MONTH
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <Grid size={14} />
              <span>Month</span>
            </button>
            <button
              onClick={() => onView(Views.WEEK)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                view === Views.WEEK
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <List size={14} />
              <span>Week</span>
            </button>
            <button
              onClick={() => onView(Views.DAY)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                view === Views.DAY
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <Square size={14} />
              <span>Day</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle event selection
  const handleSelectEvent = (event) => {
    if (event.isMoreEvent) {
      // Show all events from this time slot (excluding the first one that's already shown)
      const otherEvents = event.allEvents.slice(1);
      setMoreEventsData({
        events: otherEvents,
        date: event.start
      });
      setShowMoreEvents(true);
    } else {
      setSelectedEvent(event);
      setShowEventModal(true);
    }
  };

  // Handle slot selection (for creating new events)
  const handleSelectSlot = ({ start, end }) => {
    console.log('Selected slot:', start, end);
  };

  // Handle "more" button click (for Month view built-in functionality)
  const handleShowMore = (events, date) => {
    setMoreEventsData({ events, date });
    setShowMoreEvents(true);
  };

  // Navigate to team page
  const handleNavigateToTeam = (teamId) => {
    navigate(`/team/${teamId}`);
    setShowEventModal(false);
  };

  // Format time for display
  const formatTime = (date) => {
    return format(date, 'HH:mm');
  };

  // Format date for display
  const formatDate = (date) => {
    return format(date, 'MMMM dd, yyyy');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="max-w-md w-full p-6 bg-white border border-red-200 rounded-xl shadow-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Calendar</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
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
        {/* Calendar Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Calendar
            localizer={localizer}
            events={view === Views.MONTH ? events : groupedEvents}
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
            timeslots={2} // 2 timeslots per hour (30 min each)
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

        {/* Event Details Modal */}
        <AnimatePresence>
          {showEventModal && selectedEvent && (
            <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
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
                      <X size={20} />
                    </button>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-4">
                    {/* Time */}
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Clock size={18} />
                      <div>
                        <div className="font-medium">
                          {formatDate(selectedEvent.start)}
                        </div>
                        <div className="text-sm">
                          {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                        </div>
                      </div>
                    </div>

                    {/* Team */}
                    {selectedEvent.resource?.teamName && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Users size={18} />
                        <div>
                          <div className="text-sm font-medium">Team</div>
                          <div className="font-medium">{selectedEvent.resource.teamName}</div>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {selectedEvent.resource?.description && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
                        <p className="text-gray-600 text-sm">{selectedEvent.resource.description}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleNavigateToTeam(selectedEvent.resource.teamId)}
                        className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 font-medium"
                      >
                        <span>Go to Team</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* More Events Modal */}
        <AnimatePresence>
          {showMoreEvents && moreEventsData.date && (
            <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {format(moreEventsData.date, 'MMMM dd, yyyy')}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {moreEventsData.events.length} event{moreEventsData.events.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMoreEvents(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Events List */}
                  <div className="space-y-3">
                    {moreEventsData.events.map((event, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          event.resource?.type === 'task'
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-green-500 bg-green-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.resource?.type === 'task'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.resource?.type === 'task' ? 'Task' : 'Meeting'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </div>
                        {event.resource?.teamName && (
                          <div className="text-sm text-gray-700">
                            Team: <span className="font-medium">{event.resource.teamName}</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleNavigateToTeam(event.resource.teamId)}
                          className="mt-3 text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1 transition-colors"
                        >
                          <span>View Team</span>
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add custom CSS for calendar fixes */}
      <style jsx global>{`
        /* Fix time gutter and ensure proper time display */
        .rbc-time-gutter {
          background-color: #f8fafc !important;
          border-right: 1px solid #e2e8f0 !important;
          min-width: 60px !important;
          padding: 0 8px !important;
        }

        .rbc-time-header-gutter {
          background-color: #f8fafc !important;
          border-right: 1px solid #e2e8f0 !important;
          min-width: 60px !important;
        }

        .rbc-time-header-cell {
          background-color: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 8px !important;
          font-weight: 600 !important;
          color: #374151 !important;
        }

        .rbc-time-content {
          border-top: 1px solid #e2e8f0 !important;
          overflow-y: auto !important;
          display: flex !important;
        }

        .rbc-day-slot {
          min-height: 120px !important;
          position: relative !important;
        }

        .rbc-time-view {
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
        }

        .rbc-time-slot {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 4px 8px !important;
          font-size: 12px !important;
          color: #6b7280 !important;
        }

        .rbc-timeslot-group {
          min-height: 60px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }

        /* Ensure events are properly contained */
        .rbc-events-container {
          margin-right: 0px !important;
        }

        .rbc-event {
          border: none !important;
          padding: 2px 4px !important;
          margin: 1px 2px !important;
          overflow: hidden !important;
        }

        /* Custom scrollbar for calendar */
        .rbc-time-content::-webkit-scrollbar {
          width: 8px !important;
        }

        .rbc-time-content::-webkit-scrollbar-track {
          background: #f1f5f9 !important;
        }

        .rbc-time-content::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 4px !important;
        }

        .rbc-time-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
        }

        /* Month view event stacking */
        .rbc-month-view .rbc-event {
          margin: 1px !important;
          min-height: 18px !important;
        }

        /* Ensure time labels are visible */
        .rbc-time-gutter .rbc-timeslot-group {
          display: flex !important;
          align-items: flex-start !important;
          justify-content: center !important;
          padding: 0 8px !important;
        }

        .rbc-label {
          font-size: 12px !important;
          color: #6b7280 !important;
          font-weight: 500 !important;
        }

        /* Fix header alignment */
        .rbc-time-header-content {
          border-left: 1px solid #e2e8f0 !important;
        }

        .rbc-header {
          padding: 12px 8px !important;
          font-weight: 600 !important;
          color: #374151 !important;
          border-bottom: 1px solid #e2e8f0 !important;
          border-right: 1px solid #e2e8f0 !important;
          background: #f8fafc !important;
        }

        .rbc-header:last-child {
          border-right: none !important;
        }

        /* Today highlight */
        .rbc-today {
          background-color: #eff6ff !important;
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
