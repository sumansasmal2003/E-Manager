import React, { useState } from 'react';
import { Calendar, Clock, Video, Users, Share, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MeetingItem = ({ meeting }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const meetingDate = new Date(meeting.meetingTime);
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = meetingDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const isUpcoming = new Date(meeting.meetingTime) > new Date();

  // Format the meeting details for sharing
  const formatMeetingDetails = () => {
    return `📅 *${meeting.title}*

🗓️ *Date:* ${formattedDate}
⏰ *Time:* ${formattedTime}
📝 *Agenda:* ${meeting.agenda}

👥 *Participants:* ${meeting.participants.join(', ')}

🔗 *Meeting Link:* ${meeting.meetingLink}

See you there! 👋`;
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formatMeetingDetails());
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareModal(false);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = formatMeetingDetails();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareModal(false);
      }, 2000);
    }
  };

  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-white transition-all duration-200 group">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                {meeting.title}
              </h4>
              <button
                onClick={handleShareClick}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-2"
                title="Share meeting details"
              >
                <Share size={16} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {meeting.agenda}
            </p>

            <div className="flex flex-wrap gap-4 mb-3">
              <span className="flex items-center text-sm font-medium text-gray-700">
                <Calendar size={14} className="mr-1.5" />
                {formattedDate}
              </span>
              <span className="flex items-center text-sm font-medium text-gray-700">
                <Clock size={14} className="mr-1.5" />
                {formattedTime}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <Users size={14} className="mr-1.5" />
                {meeting.participants.length} attending
              </span>
            </div>

            {isUpcoming && meeting.meetingLink && (
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
              >
                <Video size={16} className="mr-2" />
                Join Meeting
              </a>
            )}
          </div>

          {!isUpcoming && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-md bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Share Meeting Details
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Copy and paste this in your group chat
                  </p>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start space-x-2">
                      <Calendar size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">{meeting.title}</strong>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Clock size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900">Date & Time:</span><br />
                        {formattedDate} at {formattedTime}
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <span className="font-medium text-gray-900">Agenda:</span><br />
                        {meeting.agenda}
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Users size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900">Participants:</span><br />
                        {meeting.participants.join(', ')}
                      </div>
                    </div>

                    {meeting.meetingLink && (
                      <div className="flex items-start space-x-2">
                        <Video size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-900">Meeting Link:</span><br />
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 break-all"
                          >
                            {meeting.meetingLink}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCopyToClipboard}
                  disabled={copied}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Share size={18} />
                      <span>Copy Meeting Details</span>
                    </>
                  )}
                </button>

                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 text-sm text-center mt-3"
                  >
                    Meeting details copied!
                  </motion.p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MeetingItem;
