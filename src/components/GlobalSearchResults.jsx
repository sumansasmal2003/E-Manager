import React from 'react';
// --- *** MODIFICATION HERE *** ---
// We no longer need 'Link' from react-router-dom
import {
  Users, ClipboardList, Notebook, FileText, User,
  Loader2, Search
} from 'lucide-react';
// --- *** END MODIFICATION *** ---


// --- *** MODIFICATION HERE *** ---
// 'ResultItem' is now a <button>
// 'onClick' (the prop) is renamed to 'onResultClick' for clarity
// The button's onClick handler now calls onResultClick(link)
const ResultItem = ({ icon, title, subtitle, link, onResultClick }) => (
  <button
    type="button"
    onClick={() => onResultClick(link)}
    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
  >
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-primary truncate">{title}</p>
      <p className="text-xs text-gray-500 truncate">{subtitle}</p>
    </div>
  </button>
);
// --- *** END MODIFICATION *** ---

// --- *** MODIFICATION HERE *** ---
// Change the prop name from 'onClear' to 'onResultClick'
const GlobalSearchResults = ({ results, isLoading, onResultClick }) => {
// --- *** END MODIFICATION *** ---
  if (isLoading) {
    // ... (This section remains the same)
    return (
      <div className="absolute top-full mt-2 w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Searching...</span>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const { teams = [], tasks = [], notes = [], teamNotes = [], members = [] } = results;
  const allResults = [...teams, ...tasks, ...notes, ...teamNotes, ...members];

  if (allResults.length === 0) {
    // ... (This section remains the same)
    return (
      <div className="absolute top-full mt-2 w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
        <div className="text-center text-gray-500">
          <Search size={32} className="mx-auto mb-2" />
          <p className="text-sm font-medium">No results found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full mt-2 w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
      <div className="p-2 space-y-1">
        {teams.map(item => (
          <ResultItem
            key={`team-${item._id}`}
            icon={<Users size={16} className="text-gray-500" />}
            title={item.teamName}
            subtitle="Team"
            link={`/team/${item._id}`}
            // --- *** MODIFICATION HERE *** ---
            onResultClick={onResultClick}
            // --- *** END MODIFICATION *** ---
          />
        ))}
        {tasks.map(item => (
          <ResultItem
            key={`task-${item._id}`}
            icon={<ClipboardList size={16} className="text-blue-500" />}
            title={item.title}
            subtitle={`Task in ${item.team.teamName}`}
            link={`/team/${item.team._id}`}
            // --- *** MODIFICATION HERE *** ---
            onResultClick={onResultClick}
            // --- *** END MODIFICATION *** ---
          />
        ))}
        {members.map(item => (
          <ResultItem
            key={`member-${item._id}`}
            icon={<User size={16} className="text-green-500" />}
            title={item.name}
            subtitle="Team Member"
            link={`/members/details?name=${encodeURIComponent(item.name)}`}
            // --- *** MODIFICATION HERE *** ---
            onResultClick={onResultClick}
            // --- *** END MODIFICATION *** ---
          />
        ))}
        {notes.map(item => (
          <ResultItem
            key={`note-${item._id}`}
            icon={<Notebook size={16} className="text-yellow-500" />}
            title={item.title}
            subtitle={`Personal Note (${item.category})`}
            link="/notes"
            // --- *** MODIFICATION HERE *** ---
            onResultClick={onResultClick}
            // --- *** END MODIFICATION *** ---
          />
        ))}
        {teamNotes.map(item => (
          <ResultItem
            key={`teamnote-${item._id}`}
            icon={<FileText size={16} className="text-purple-500" />}
            title={item.title}
            subtitle={`Note in ${item.team.teamName}`}
            link={`/team/${item.team._id}`}
            // --- *** MODIFICATION HERE *** ---
            onResultClick={onResultClick}
            // --- *** END MODIFICATION *** ---
          />
        ))}
      </div>
    </div>
  );
};

export default GlobalSearchResults;
