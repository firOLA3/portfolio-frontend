import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Spinner } from 'flowbite-react'
import { getNotes, getNote, createNote, updateNote, deleteNote } from '../../../services/noteService'

function Notepad() {
  const [notes, setNotes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [error, setError] = useState(null)
  const [fontSize, setFontSize] = useState('md')
  const [wordWrap, setWordWrap] = useState(true)

  // Edit Mode & Auth State
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const [passcode, setPasscode] = useState('')
  const [showPasscodeModal, setShowPasscodeModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [passcodeInput, setPasscodeInput] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDiscardModal, setShowDiscardModal] = useState({ isOpen: false, nextId: null })

  const fetchNotes = useCallback(async () => {
    setLoadingList(true)
    setError(null)
    try {
      const data = await getNotes()
      setNotes(data)
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
      }
    } catch (err) {
      setError('Failed to load notes')
      console.error(err)
    } finally {
      setLoadingList(false)
    }
  }, [selectedId])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  useEffect(() => {
    if (!selectedId) {
      setSelectedNote(null)
      return
    }
    setLoadingContent(true)
    const fetchContent = async () => {
      try {
        const note = await getNote(selectedId)
        setSelectedNote(note)
      } catch (err) {
        setError('Failed to load note content')
        console.error(err)
      } finally {
        setLoadingContent(false)
      }
    }
    fetchContent()
  }, [selectedId])

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleSelectNote = (id) => {
    if (isEditing) {
      setShowDiscardModal({ isOpen: true, nextId: id })
      return;
    }
    setIsEditing(false)
    setSelectedId(id)
  }

  const handleAction = (actionType) => {
    if (!passcode) {
      setPendingAction(actionType)
      setShowPasscodeModal(true)
    } else {
      executeAction(actionType, passcode)
    }
  }

  const executeAction = async (actionType, code) => {
    try {
      if (actionType === 'new') {
        const newNote = await createNote({ title: 'New Article', content: 'Write your content here...' }, code)
        setNotes([newNote, ...notes])
        setSelectedId(newNote.id)
        setSelectedNote(newNote)
        setEditForm({ title: newNote.title, content: newNote.content })
        setIsEditing(true)
      } else if (actionType === 'delete') {
        setShowDeleteModal(true)
      } else if (actionType === 'deleteConfirmed') {
        await deleteNote(selectedId, code)
        setNotes(notes.filter((n) => n.id !== selectedId))
        setSelectedId(null)
        setSelectedNote(null)
      } else if (actionType === 'edit') {
        setEditForm({ title: selectedNote.title, content: selectedNote.content })
        setIsEditing(true)
      } else if (actionType === 'save') {
        setLoadingContent(true)
        const updated = await updateNote(selectedId, editForm, code)
        setNotes(notes.map((n) => (n.id === updated.id ? { ...n, title: updated.title } : n)))
        setSelectedNote(updated)
        setIsEditing(false)
        setLoadingContent(false)
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setPasscode('')
        setPendingAction(actionType)
        setShowPasscodeModal(true)
        alert('Invalid Admin Passcode')
      } else {
        alert('Error: ' + err.message)
      }
      setLoadingContent(false)
    }
  }

  const handlePasscodeSubmit = (e) => {
    e.preventDefault()
    setPasscode(passcodeInput)
    setShowPasscodeModal(false)
    if (pendingAction) {
      executeAction(pendingAction, passcodeInput)
      setPendingAction(null)
    }
  }

  const fontSizeClass = fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base'

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0 overflow-hidden rounded-b-win-lg bg-[var(--win-bg)] relative" style={{ color: 'var(--win-text)' }}>
      {/* Discard Changes Modal */}
      {showDiscardModal.isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-80 rounded-2xl border p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--win-bg)', borderColor: 'var(--win-border)' }}
          >
            <h3 className="mb-4 text-lg font-semibold">Discard Changes?</h3>
            <p className="mb-6 text-sm text-[var(--win-text-secondary)]">You have unsaved changes. Are you sure you want to discard them?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal({ isOpen: false, nextId: null })}
                className="rounded-xl px-4 py-2 text-sm hover:bg-[var(--win-button-hover)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setSelectedId(showDiscardModal.nextId)
                  setShowDiscardModal({ isOpen: false, nextId: null })
                }}
                className="rounded-xl px-4 py-2 text-sm text-white"
                style={{ backgroundColor: 'var(--win-accent)' }}
              >
                Discard
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-80 rounded-2xl border p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--win-bg)', borderColor: 'var(--win-border)' }}
          >
            <h3 className="mb-4 text-lg font-semibold text-red-500">Delete Devlog?</h3>
            <p className="mb-6 text-sm text-[var(--win-text-secondary)]">Are you sure you want to permanently delete this devlog? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl px-4 py-2 text-sm hover:bg-[var(--win-button-hover)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  executeAction('deleteConfirmed', passcode)
                }}
                className="rounded-xl px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-80 rounded-2xl border p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--win-bg)', borderColor: 'var(--win-border)' }}
          >
            <h3 className="mb-4 text-lg font-semibold">Admin Authentication</h3>
            <p className="mb-4 text-sm text-[var(--win-text-secondary)]">Please enter the admin passcode to perform this action.</p>
            <form onSubmit={handlePasscodeSubmit}>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                className="mb-4 w-full rounded-xl border p-2 text-sm outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--win-button-hover)', borderColor: 'var(--win-border)', color: 'var(--win-text)' }}
                autoFocus
                placeholder="Passcode..."
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasscodeModal(false)}
                  className="rounded-xl px-4 py-2 text-sm hover:bg-[var(--win-button-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-4 py-2 text-sm text-white"
                  style={{ backgroundColor: 'var(--win-accent)' }}
                >
                  Submit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <aside className="w-full md:w-[220px] border-b md:border-b-0 md:border-r p-4 overflow-x-auto md:overflow-y-auto backdrop-blur-xl flex flex-row md:flex-col shrink-0 items-center md:items-stretch gap-4 md:gap-0 no-scrollbar" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}>
        <div className="md:mb-4 flex items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--win-text-secondary)' }}>
              Devlogs
            </h2>
            {notes.length > 1 && (
              <motion.div
                animate={{ x: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="md:hidden flex items-center text-[10px] uppercase tracking-wider font-semibold"
                style={{ color: 'var(--win-accent)' }}
              >
                Swipe 
                <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => handleAction('new')}
            className="flex h-6 w-6 items-center justify-center rounded-full transition text-xs"
            style={{ backgroundColor: 'var(--win-button-hover)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--win-button-active)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--win-button-hover)')}
            title="New Article"
          >
            ➕
          </button>
        </div>

        {loadingList ? (
          <div className="flex md:flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-12 w-32 md:h-16 md:w-full animate-pulse rounded-3xl p-3 shrink-0"
                style={{ backgroundColor: 'var(--win-button-hover)' }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-sm text-red-400">{error}</div>
        ) : notes.length === 0 ? (
          <div className="text-center text-sm" style={{ color: 'var(--win-text-secondary)' }}>No devlogs yet</div>
        ) : (
          <nav className="flex md:flex-col gap-2">
            {notes.map((note) => {
              const active = selectedId === note.id
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => handleSelectNote(note.id)}
                  className="w-[180px] md:w-full shrink-0 flex flex-col items-start gap-1 rounded-3xl px-4 py-3 text-left transition border"
                  style={{
                    backgroundColor: active ? 'var(--win-button-active)' : 'transparent',
                    borderColor: active ? 'var(--win-accent)' : 'var(--win-border)',
                    color: active ? 'var(--win-text)' : 'var(--win-text)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = 'var(--win-button-hover)'
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div className="text-sm font-medium truncate w-full">{note.title}</div>
                  <div className="text-xs" style={{ color: 'var(--win-text-secondary)' }}>
                    {formatDate(note.createdAt)}
                  </div>
                </button>
              )
            })}
          </nav>
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b px-4 sm:px-6 py-3 backdrop-blur-xl shrink-0" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)' }}>
          <div className="flex items-center gap-3">
            <label className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--win-text-secondary)' }}>
              Font Size:
            </label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="rounded-2xl border px-3 py-2 text-xs outline-none focus:ring-2"
              style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)', color: 'var(--win-text)' }}
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleAction('save')}
                  className="rounded-2xl px-4 py-2 text-xs font-medium transition text-white"
                  style={{ backgroundColor: 'var(--win-accent)' }}
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-medium transition"
                  style={{ backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text)' }}
                >
                  Cancel
                </button>
              </>
            ) : selectedNote ? (
              <>
                <button
                  onClick={() => setWordWrap(!wordWrap)}
                  className="rounded-2xl px-4 py-2 text-xs font-medium transition"
                  style={{
                    backgroundColor: wordWrap ? 'var(--win-accent)' : 'var(--win-button-hover)',
                    color: wordWrap ? 'white' : 'var(--win-text-secondary)',
                  }}
                >
                  {wordWrap ? 'Wrap: On' : 'Wrap: Off'}
                </button>
                <button
                  onClick={() => handleAction('edit')}
                  className="rounded-2xl px-4 py-2 text-xs font-medium transition"
                  style={{ backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text)' }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleAction('delete')}
                  className="rounded-2xl px-4 py-2 text-xs font-medium transition"
                  style={{ backgroundColor: 'var(--win-button-hover)', color: '#ef4444' }}
                >
                  🗑️ Delete
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 relative">
          {loadingContent ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size="lg" color="info" />
            </div>
          ) : !selectedNote ? (
            <div className="flex h-full items-center justify-center text-center" style={{ color: 'var(--win-text-secondary)' }}>
              <p>Select an article to read</p>
            </div>
          ) : isEditing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col gap-4">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full rounded-2xl border px-4 py-3 text-lg font-bold outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--win-button-active)', borderColor: 'var(--win-border)', color: 'var(--win-text)' }}
                placeholder="Article Title..."
              />
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className={`w-full flex-1 resize-none rounded-2xl border p-4 outline-none focus:ring-2 ${fontSizeClass} ${wordWrap ? 'break-words' : 'whitespace-pre'}`}
                style={{ backgroundColor: 'var(--win-button-active)', borderColor: 'var(--win-border)', color: 'var(--win-text)', fontFamily: 'monospace' }}
                placeholder="Write your Markdown here..."
              />
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNote.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className={`prose prose-invert max-w-none rounded-3xl border p-6 ${fontSizeClass} ${wordWrap ? 'break-words' : 'whitespace-pre-wrap'}`}
                style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text)' }}
              >
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="mb-4 text-3xl font-bold" style={{ color: 'var(--win-text)' }} {...props} />,
                    h2: ({ node, ...props }) => <h2 className="mb-3 mt-6 text-2xl font-semibold" style={{ color: 'var(--win-text)' }} {...props} />,
                    h3: ({ node, ...props }) => <h3 className="mb-2 mt-4 text-xl font-semibold" style={{ color: 'var(--win-text)' }} {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 leading-7" style={{ color: 'var(--win-text)' }} {...props} />,
                    a: ({ node, ...props }) => <a className="text-win-accent underline hover:text-win-accent/80" {...props} />,
                    code: ({ node, inline, ...props }) =>
                      inline ? (
                        <code className="rounded px-2 py-1 font-mono text-sm" style={{ backgroundColor: 'var(--win-button-active)', color: 'var(--win-text-secondary)' }} {...props} />
                      ) : (
                        <code className="block overflow-x-auto rounded-2xl p-4 font-mono text-sm" style={{ backgroundColor: 'var(--win-button-active)', color: 'var(--win-text-secondary)' }} {...props} />
                      ),
                    pre: ({ node, ...props }) => <pre className="mb-4 overflow-x-auto" {...props} />,
                    ul: ({ node, ...props }) => <ul className="mb-4 list-inside list-disc space-y-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="mb-4 list-inside list-decimal space-y-2" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="mb-4 border-l-4 pl-4 italic" style={{ borderColor: 'var(--win-accent)', color: 'var(--win-text-secondary)' }} {...props} />
                    ),
                  }}
                >
                  {selectedNote.content}
                </ReactMarkdown>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  )
}

export default Notepad
