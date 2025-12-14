import React, { useState } from 'react';
import Modal from './Modal';
import { Loader2, Megaphone, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import api from '../api/axiosConfig';

const CreateAnnouncementModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    message: '',
    priority: 'low',
    daysActive: 1
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/announcements', formData);
      if (onCreated) onCreated(); // Refresh list if needed
      onClose();
      setFormData({ message: '', priority: 'low', daysActive: 1 }); // Reset
    } catch (error) {
      alert("Failed to post announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Announcement">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Server maintenance tonight at 10 PM..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    formData.priority === p
                      ? p === 'high' ? 'bg-red-100 text-red-700 border-red-200 border'
                      : p === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200 border'
                      : 'bg-blue-100 text-blue-700 border-blue-200 border'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              value={formData.daysActive}
              onChange={(e) => setFormData({ ...formData, daysActive: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="1">24 Hours</option>
              <option value="3">3 Days</option>
              <option value="7">1 Week</option>
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className={`p-3 rounded-lg flex items-start gap-3 mt-4 ${
          formData.priority === 'high' ? 'bg-red-50 text-red-800' :
          formData.priority === 'medium' ? 'bg-amber-50 text-amber-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {formData.priority === 'high' ? <AlertTriangle size={18} className="shrink-0 mt-0.5" /> :
           formData.priority === 'medium' ? <Info size={18} className="shrink-0 mt-0.5" /> :
           <Megaphone size={18} className="shrink-0 mt-0.5" />}
          <p className="text-sm">{formData.message || "Preview message..."}</p>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Megaphone size={16} />}
            Post Notice
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAnnouncementModal;
