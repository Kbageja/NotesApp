import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useNotes';
import {Button} from '../components/ui/Button';
import Card from '../components/ui/Card';
import CreateNoteModal from '../components/dashboard/CreateNodeModal';
import NoteCard from '../components/dashboard/NoteCard';
import { Plus, LogOut, Search } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { notes, isLoading, createNote, updateNote, deleteNote, refetch } = useNotes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleCreateNote = async (title: string, content: string) => {
    try {
      await createNote({ title, content });
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateNote = async (id: string, title: string, content: string) => {
    try {
      await updateNote(id, { title, content });
      setEditingNote(null);
      refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        refetch();
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername = 'x'.repeat(username.length);
    const maskedDomain = 'x'.repeat(domain.split('.')[0].length) + '.' + domain.split('.')[1];
    return `${maskedUsername}@${maskedDomain}`;
  };

  const filteredNotes = notes?.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile View */}
      <div className="md:hidden mobile-container">
        <div className="flex flex-col min-h-screen">
          {/* Header - Matching your design exactly */}
          <div className="flex items-center justify-between p-4 bg-white">
            <div className="flex items-center">
                <div className="">
              <img src="/logo2.png" alt="HD Logo" className="h-8 w-auto" />
            </div>
              <span className="text-lg font-semibold text-black">Dashboard</span>
            </div>
            <button
              onClick={logout}
              className="text-blue-600 font-medium hover:text-blue-700 text-sm underline"
            >
              Sign Out
            </button>
          </div>

          <div className="flex-1 p-4 space-y-4">
            {/* Welcome Card - Exact match to your design */}
            <Card className="p-4">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Welcome, {user?.name} !
              </h1>
              <p className="text-gray-600 text-sm">
                Email: {user?.email ?user.email : ''}
              </p>
            </Card>

            {/* Create Note Button - Exact match */}
            <Button
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="w-full h-12  font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
            >
              Create Note
            </Button>

            {/* Notes Section - Exact match */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading notes...</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    {notes?.length === 0 ? 'No notes yet' : 'No matching notes'}
                  </p>
                  {notes?.length === 0 && (
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first note
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotes.map((note, index) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={(note) => setEditingNote(note)}
                      onDelete={() => handleDeleteNote(note.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex desktop-container">
        <div className="w-full max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className='flex items-center gap-4'>
             <div className="">
              <img src="/logo2.png" alt="HD Logo" className="h-10 w-auto" />
            </div>
            <div className='text-4xl font-semibold'>
                Dashboard
            </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center bg-blue-500 text-white hover:bg-blue-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="space-y-8">
            {/* Welcome Card */}
            <Card className="text-center py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {user?.name}!
              </h1>
              <p className="text-gray-600 text-lg">
                Email: {user?.email ? user.email : ''}
              </p>
            </Card>

            {/* Search and Create */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Note
              </Button>
            </div>

            {/* Notes Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Notes</h2>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your notes...</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-600 text-lg mb-6">
                    {notes?.length === 0 ? 'No notes yet' : 'No matching notes found'}
                  </p>
                  {notes?.length === 0 && (
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      variant="outline"
                      size="lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create your first note
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={(note) => setEditingNote(note)}
                      onDelete={() => handleDeleteNote(note.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateNoteModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateNote}
        />
      )}

      {editingNote && (
        <CreateNoteModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSave={(title, content) => handleUpdateNote(editingNote.id, title, content)}
        />
      )}
    </div>
  );
};

export default Dashboard;