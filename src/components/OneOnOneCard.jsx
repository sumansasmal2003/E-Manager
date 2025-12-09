// src/components/OneOnOneCard.jsx

import React, { useState } from 'react';
import { Calendar, MessageSquare, FileText, CheckSquare, Square, Plus, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import format from 'date-fns/format';
import api from '../api/axiosConfig';

const OneOnOneCard = ({ oneOnOne, onUpdated, onDeleted }) => {
  const [leaderNotes, setLeaderNotes] = useState(oneOnOne.leaderNotes);
  const [actionItems, setActionItems] = useState(oneOnOne.actionItems);
  const [newActionItem, setNewActionItem] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const formattedDate = format(new Date(oneOnOne.meetingDate), 'MMMM dd, yyyy');

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/oneonones/${oneOnOne._id}`, {
        leaderNotes,
        actionItems,
      });
      onUpdated(res.data); // Update parent state
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update 1-on-1', err);
    }
    setLoading(false);
  };

  const handleToggleActionItem = (index) => {
    const updatedItems = actionItems.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    setActionItems(updatedItems);
  };

  const handleAddActionItem = () => {
    if (newActionItem.trim() === '') return;
    setActionItems([...actionItems, { text: newActionItem, completed: false }]);
    setNewActionItem('');
  };

  const handleRemoveActionItem = (index) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this 1-on-1 record?')) {
      api.delete(`/oneonones/${oneOnOne._id}`)
        .then(() => onDeleted(oneOnOne._id))
        .catch(err => console.error('Failed to delete', err));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-primary">{formattedDate}</h3>
        </div>
        <div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isEditing ? <Save size={16} /> : <FileText size={16} />}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {oneOnOne.discussionPoints && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 flex items-center mb-2">
              <MessageSquare size={14} className="mr-2" />
              Discussion Points
            </h4>
            <p className="text-sm text-gray-800 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
              {oneOnOne.discussionPoints}
            </p>
          </div>
        )}

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Leader Notes */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 flex items-center mb-2">
                  <FileText size={14} className="mr-2" />
                  Leader's Private Notes
                </h4>
                <textarea
                  placeholder="Add your private notes here..."
                  value={leaderNotes}
                  onChange={(e) => setLeaderNotes(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-primary"
                />
              </div>

              {/* Action Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 flex items-center mb-2">
                  <CheckSquare size={14} className="mr-2" />
                  Action Items
                </h4>
                <div className="space-y-2">
                  {actionItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 group">
                      <button onClick={() => handleToggleActionItem(index)}>
                        {item.completed ? <CheckSquare size={18} className="text-green-600" /> : <Square size={18} className="text-gray-400" />}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => {
                          const newText = e.target.value;
                          setActionItems(actionItems.map((ai, i) => i === index ? { ...ai, text: newText } : ai));
                        }}
                        className={`flex-1 text-sm p-2 border-b ${item.completed ? 'line-through text-gray-500' : 'text-primary'}`}
                      />
                      <button
                        onClick={() => handleRemoveActionItem(index)}
                        className="opacity-0 group-hover:opacity-100 text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="text"
                      placeholder="New action item..."
                      value={newActionItem}
                      onChange={(e) => setNewActionItem(e.target.value)}
                      className="flex-1 text-sm p-2 border-b"
                    />
                    <button onClick={handleAddActionItem} className="p-2 bg-gray-100 rounded-lg">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpdate}
                disabled={loading}
                className="w-full bg-primary text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Notes & Actions'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OneOnOneCard;
