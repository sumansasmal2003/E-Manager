import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import api from '../api/axiosConfig';
import { Editor } from '@tinymce/tinymce-react'; // <-- IMPORT EDITOR

const EditTeamNoteModal = ({ isOpen, onClose, note, onNoteUpdated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // This will hold HTML
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content); // Will render saved HTML
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/teamnotes/note/${note._id}`, {
        title,
        content, // Send updated HTML
      });
      onNoteUpdated(res.data);
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update note');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!note) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Team Note">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          icon={<FileText size={18} className="text-gray-400" />}
          type="text"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoComplete="off"
        />

        {/* --- REPLACE TEXTAREA WITH TINYMCE EDITOR --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <Editor
            apiKey='btbqthaaki8gu807fixqn8vbiv7peb7wcoml3q320qnkfedf' // <-- PUT YOUR API KEY HERE
            value={content}
            onEditorChange={(newValue, editor) => setContent(newValue)}
            init={{
              height: 250, // Taller
              menubar: false,
              plugins: [
                'lists', 'link', 'autolink', 'code', 'wordcount', 'textcolor'
              ],
              toolbar:
                'undo redo | bold italic | bullist numlist | link | code | forecolor backcolor | removeformat',
              content_style: 'body { font-family:Roboto,sans-serif; font-size:14px }',
            }}
          />
        </div>
        {/* --- END REPLACEMENT --- */}

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTeamNoteModal;
