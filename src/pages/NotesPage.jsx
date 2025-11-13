import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import NoteCard from '../components/NoteCard';
import { Plus, FileText, Tag, Search, Filter, Grid, List } from 'lucide-react';
import AddNoteModal from '../components/AddNoteModal';
import EditNoteModal from '../components/EditNoteModal';
import Input from '../components/Input';
import CustomSelect from '../components/CustomSelect';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Sort by Title' },
];

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);

  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'title'

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const res = await api.get('/notes');
        setNotes(res.data);

        // Get unique categories
        const uniqueCategories = [
          'All',
          ...new Set(res.data.map(note => note.category || 'Personal'))
        ];
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch notes');
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleNoteAdded = (newNote) => {
    setNotes([newNote, ...notes]);
    const category = newNote.category || 'Personal';
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter((note) => note._id !== noteId));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleOpenEditModal = (note) => {
    setCurrentNote(note);
    setIsEditModalOpen(true);
  };

  const handleNoteUpdated = (updatedNote) => {
    const newNotes = notes.map(note =>
      note._id === updatedNote._id ? updatedNote : note
    );
    setNotes(newNotes);

    const category = updatedNote.category || 'Personal';
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedNotes = notes
    .filter(note => {
      const category = note.category || 'Personal';
      const matchesCategory = activeCategory === 'All' || category === activeCategory;
      const matchesSearch =
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt);
        case 'oldest':
          return new Date(a.createdAt || a.updatedAt) - new Date(b.createdAt || b.updatedAt);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="text-white" size={24} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
                <p className="text-gray-600 mt-1">
                  {filteredAndSortedNotes.length} note{filteredAndSortedNotes.length !== 1 ? 's' : ''} •
                  <span className="text-gray-900 font-medium ml-1">
                    {activeCategory === 'All' ? 'All categories' : activeCategory}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="group bg-gray-900 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} className="transition-transform group-hover:rotate-90" />
              <span className="font-semibold">New Note</span>
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <Input
                icon={<Search size={18} className="text-gray-400" />}
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center justify-between lg:justify-end space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>

              <CustomSelect
                options={sortOptions}
                value={sortBy}
                onChange={(value) => setSortBy(value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mr-3">
                <Filter size={16} />
                <span>Filter by:</span>
              </div>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeCategory === category
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  {category !== 'All' && <Tag size={14} />}
                  <span>{category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="text-gray-600">Loading your notes...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load notes</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Notes Grid/List */}
        {!loading && !error && (
          filteredAndSortedNotes.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredAndSortedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onDelete={handleDeleteNote}
                  onEdit={handleOpenEditModal}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchTerm
                  ? "No notes match your search criteria. Try adjusting your search terms or filters."
                  : activeCategory === 'All'
                    ? "Get started by creating your first note. Click the 'New Note' button to begin."
                    : `No notes found in the "${activeCategory}" category.`}
              </p>
              {!searchTerm && activeCategory === 'All' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
                >
                  Create Your First Note
                </button>
              )}
            </div>
          )
        )}
      </div>

      {/* Modals */}
      <AddNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNoteAdded={handleNoteAdded}
      />
      <EditNoteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        note={currentNote}
        onNoteUpdated={handleNoteUpdated}
      />
    </div>
  );
};

export default NotesPage;
