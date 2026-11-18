import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Badge, Spinner } from 'flowbite-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../../../services/projectService'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'Web App', label: 'Web Apps' },
  { key: 'Mobile', label: 'Mobile' },
  { key: 'Open Source', label: 'Open Source' },
  { key: 'Experiment', label: 'Experiments' },
]

const SORT_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'techStack', label: 'Tech Stack' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Date' },
]

const VIEW_MODES = {
  grid: 'grid',
  list: 'list',
}

const STATUS_COLOR_MAP = {
  Completed: 'bg-emerald-500/15 text-emerald-300',
  'In Progress': 'bg-amber-500/15 text-amber-300',
  Archived: 'bg-slate-500/15 text-slate-300',
}

const skeletonCards = Array.from({ length: 6 }, (_, index) => index)

const formatDate = (value) => {
  const date = new Date(value)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const sortProjects = (projects, column, direction) => {
  return [...projects].sort((a, b) => {
    let left = a[column]
    let right = b[column]

    if (column === 'name') {
      left = a.title.toLowerCase()
      right = b.title.toLowerCase()
    }

    if (column === 'techStack') {
      left = a.techStack.join(', ').toLowerCase()
      right = b.techStack.join(', ').toLowerCase()
    }

    if (column === 'status') {
      left = a.status
      right = b.status
    }

    if (column === 'createdAt') {
      left = new Date(a.createdAt).getTime()
      right = new Date(b.createdAt).getTime()
    }

    if (left < right) return direction === 'asc' ? -1 : 1
    if (left > right) return direction === 'asc' ? 1 : -1
    return 0
  })
}

function Projects() {
  const location = useLocation()
  const navigate = useNavigate()
  const projectId = location.pathname.match(/^\/app\/projects\/([^/]+)\/?$/)?.[1] ?? null
  const [projects, setProjects] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState(VIEW_MODES.grid)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [projectLoadResult, setProjectLoadResult] = useState(null)
  const [detailRetryCount, setDetailRetryCount] = useState(0)
  const detailProject = projectLoadResult?.id === projectId ? projectLoadResult.project : null
  const detailError = projectLoadResult?.id === projectId ? projectLoadResult.error : null
  const detailLoading = Boolean(projectId && projectLoadResult?.id !== projectId)

  // Admin CRUD State
  const [showPasscodeModal, setShowPasscodeModal] = useState(false)
  const [passcodeInput, setPasscodeInput] = useState('')
  const [pendingAction, setPendingAction] = useState(null) // 'new', 'edit', 'delete'
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    techStack: '',
    category: 'Web App',
    status: 'Completed',
    thumbnail: '',
    githubUrl: '',
    liveUrl: '',
    featured: false,
  })

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getProjects({ category: activeCategory })
      setProjects(data)
    } catch (err) {
      setError('Could not load projects. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [activeCategory])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    if (!projectId) return undefined

    let active = true
    getProject(projectId)
      .then((project) => {
        if (active) {
          setProjectLoadResult({ id: projectId, project, error: null })
        }
      })
      .catch((requestError) => {
        if (active) {
          setProjectLoadResult({
            id: projectId,
            project: null,
            error: requestError.response?.status === 404
              ? 'Project not found.'
              : 'Could not load this project. Check your connection.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [projectId, detailRetryCount])

  const visibleProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return sortProjects(
      projects.filter((project) =>
        project.title.toLowerCase().includes(query),
      ),
      sortColumn,
      sortDirection,
    )
  }, [projects, searchQuery, sortColumn, sortDirection])

  const handleCategoryClick = useCallback((key) => {
    setActiveCategory(key)
    navigate('/app/projects')
  }, [navigate])

  const handleSortClick = useCallback(
    (column) => {
      if (sortColumn === column) {
        setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
        return
      }
      setSortColumn(column)
      setSortDirection('asc')
    },
    [sortColumn],
  )

  const handleOpenDetail = useCallback((project) => {
    navigate(`/app/projects/${encodeURIComponent(project.id)}`)
  }, [navigate])

  // Admin Handlers
  const handleAction = (action) => {
    setPendingAction(action)
    setPasscodeInput('')
    setShowPasscodeModal(true)
  }

  const handlePasscodeSubmit = async (e) => {
    e.preventDefault()
    setShowPasscodeModal(false)

    if (pendingAction === 'new') {
      setProjectFormData({
        title: '', description: '', longDescription: '', techStack: '',
        category: 'Web App', status: 'Completed', thumbnail: '', githubUrl: '', liveUrl: '', featured: false
      })
      setShowProjectModal(true)
    } else if (pendingAction === 'edit') {
      if (!detailProject) return
      setProjectFormData({
        ...detailProject,
        techStack: detailProject.techStack.join(', ')
      })
      setShowProjectModal(true)
    } else if (pendingAction === 'delete') {
      setShowDeleteModal(true)
    }
  }

  const handleProjectSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      ...projectFormData,
      techStack: projectFormData.techStack.split(',').map(s => s.trim()).filter(Boolean)
    }

    try {
      if (pendingAction === 'new') {
        const newProj = await createProject(payload, passcodeInput)
        setProjects(prev => [newProj, ...prev])
        setProjectLoadResult({ id: newProj.id, project: newProj, error: null })
        navigate(`/app/projects/${encodeURIComponent(newProj.id)}`)
      } else if (pendingAction === 'edit') {
        const updated = await updateProject(detailProject.id, payload, passcodeInput)
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
        setProjectLoadResult({ id: updated.id, project: updated, error: null })
      }
      setShowProjectModal(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed. Wrong passcode?')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!detailProject) return
    const deletedProjectId = detailProject.id
    setIsSubmitting(true)
    try {
      await deleteProject(deletedProjectId, passcodeInput)
      setProjects(prev => prev.filter(p => p.id !== deletedProjectId))
      setShowDeleteModal(false)
      navigate('/app/projects')
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed. Wrong passcode?')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col relative" style={{ color: 'var(--win-text)', backgroundColor: 'var(--win-bg)' }}>
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
            <p className="mb-4 text-sm" style={{ color: 'var(--win-text-secondary)' }}>Please enter the admin passcode.</p>
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
                <button type="button" onClick={() => setShowPasscodeModal(false)} className="rounded-xl px-4 py-2 text-sm hover:bg-[var(--win-button-hover)]">Cancel</button>
                <button type="submit" className="rounded-xl px-4 py-2 text-sm text-white" style={{ backgroundColor: 'var(--win-accent)' }}>Submit</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-80 rounded-2xl border p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--win-bg)', borderColor: 'var(--win-border)' }}
          >
            <h3 className="mb-2 text-lg font-semibold text-red-400">Delete Project?</h3>
            <p className="mb-6 text-sm" style={{ color: 'var(--win-text-secondary)' }}>
              Are you sure you want to delete "{detailProject?.title}"? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="rounded-xl px-4 py-2 text-sm hover:bg-[var(--win-button-hover)]">Cancel</button>
              <button type="button" onClick={confirmDelete} disabled={isSubmitting} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 disabled:opacity-50">
                {isSubmitting ? <Spinner size="sm" /> : null} Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Project Form Modal */}
      {showProjectModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl max-h-full overflow-y-auto rounded-3xl border shadow-2xl no-scrollbar"
            style={{ backgroundColor: 'var(--win-bg)', borderColor: 'var(--win-border)' }}
          >
            <div className="sticky top-0 border-b p-4 backdrop-blur-xl z-10 flex items-center justify-between" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}>
              <h3 className="text-lg font-semibold">{pendingAction === 'new' ? 'New Project' : 'Edit Project'}</h3>
              <button onClick={() => setShowProjectModal(false)} className="rounded-full p-2 hover:bg-[var(--win-button-hover)]">✕</button>
            </div>
            <form onSubmit={handleProjectSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--win-text-secondary)' }}>Title *</label>
                  <input required value={projectFormData.title} onChange={e => setProjectFormData({...projectFormData, title: e.target.value})} className="w-full rounded-xl border p-2 text-sm" style={{ backgroundColor: 'var(--win-button-hover)', borderColor: 'var(--win-border)', color: 'var(--win-text)' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--win-text-secondary)' }}>Category</label>
                  <select value={projectFormData.category} onChange={e => setProjectFormData({...projectFormData, category: e.target.value})} className="w-full rounded-xl border p-2 text-sm" style={{ backgroundColor: 'var(--win-button-hover)', borderColor: 'var(--win-border)', color: 'var(--win-text)' }}>
                    <option value="Web App">Web App</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Experiment">Experiment</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--win-text-secondary)' }}>Short Description</label>
                  <input value={projectFormData.description} onChange={e => setProjectFormData({...projectFormData, description: e.target.value})} className="w-full rounded-xl border p-2 text-sm" style={{ backgroundColor: 'var(--win-button-hover)', borderColor: 'var(--win-border)', color: 'var(--win-text)' }} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--win-text-secondary)' }}>Long Description</label>
                  <textarea rows={3} value={projectFormData.longDescription} onChange={e => setProjectFormData({...projectFormData, longDescription: e.target.value})} className="w-full rounded-xl border p-2 text-sm" style={{ backgroundColor: 'var(--win-button-hover)', borderColor: 'var(--win-border)', color: 'var(--win-text)' }} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--win-text-secondary)' }}>Tech Stack (comma separated)</label>
                  <input value={projectFormData.techStack} onChange={e => setProjectFormData({...projectFormData, techStack: e.target.value})} className="w-full rounded-xl border p-2 text-sm" style={{ backgroundColor: 'var(--win-button-hover)', borderColor: 'var(--win-border)', color: 'var(--win-text)' }} placeholder="React, Node.js, MongoDB" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--win-text-secondary)' }}>Thumbnail URL</label>
                  <input value={projectFormData.thumbnail} onChange={e => setProjectFormData({...projectFormData, thumbnail: e.target.value})} className="w-full rounded-xl border p-2 text-sm" style={{ backgroundColor: 'var(--win-button-hover)', borderColor: 'var(--win-border)', color: 'var(--win-text)' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--win-text-secondary)' }}>Status</label>
                  <select value={projectFormData.status} onChange={e => setProjectFormData({...projectFormData, status: e.target.value})} className="w-full rounded-xl border p-2 text-sm" style={{ backgroundColor: 'var(--win-button-hover)', borderColor: 'var(--win-border)', color: 'var(--win-text)' }}>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--win-text-secondary)' }}>GitHub URL</label>
                  <input value={projectFormData.githubUrl} onChange={e => setProjectFormData({...projectFormData, githubUrl: e.target.value})} className="w-full rounded-xl border p-2 text-sm" style={{ backgroundColor: 'var(--win-button-hover)', borderColor: 'var(--win-border)', color: 'var(--win-text)' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--win-text-secondary)' }}>Live URL</label>
                  <input value={projectFormData.liveUrl} onChange={e => setProjectFormData({...projectFormData, liveUrl: e.target.value})} className="w-full rounded-xl border p-2 text-sm" style={{ backgroundColor: 'var(--win-button-hover)', borderColor: 'var(--win-border)', color: 'var(--win-text)' }} />
                </div>
                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" id="featured" checked={projectFormData.featured} onChange={e => setProjectFormData({...projectFormData, featured: e.target.checked})} className="rounded text-win-accent" />
                  <label htmlFor="featured" className="text-sm">Featured Project</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--win-border)' }}>
                <button type="button" onClick={() => setShowProjectModal(false)} className="rounded-xl px-4 py-2 text-sm hover:bg-[var(--win-button-hover)]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white disabled:opacity-50" style={{ backgroundColor: 'var(--win-accent)' }}>
                  {isSubmitting ? <Spinner size="sm" /> : null}
                  Save Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="hidden md:flex items-center justify-between gap-3 border-b px-5 py-4 backdrop-blur-xl" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)' }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--win-text)' }}>
          <button
            type="button"
            className="rounded-2xl border px-3 py-2 text-xs font-medium transition"
            style={{
              borderColor: 'var(--win-border)',
              backgroundColor: 'var(--win-bg)',
              color: 'var(--win-text)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-active)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--win-bg)'}
            onClick={() => projectId ? navigate('/app/projects') : window.history.back()}
          >
            ←
          </button>
          {!projectId && <button
            type="button"
            className="rounded-2xl border px-3 py-2 text-xs font-medium transition"
            style={{
              borderColor: 'var(--win-border)',
              backgroundColor: 'var(--win-bg)',
              color: 'var(--win-text)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-active)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--win-bg)'}
            onClick={() => window.history.forward()}
          >
            →
          </button>}
          <div className="ml-3 rounded-2xl border px-4 py-2 text-[0.85rem]" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)', color: 'var(--win-text-secondary)' }}>
            This PC › Projects › {projectId ? detailProject?.title || 'Loading project' : activeCategory === 'all' ? 'All' : activeCategory}
          </div>
        </div>

        {!projectId && <div className="flex flex-1 items-center justify-end gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-3xl border px-4 py-2 text-sm outline-none transition focus:ring-2"
              style={{
                borderColor: 'var(--win-border)',
                backgroundColor: 'var(--win-bg)',
                color: 'var(--win-text)',
              }}
            />
          </div>

          <div className="flex items-center gap-2 rounded-3xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text)' }}>
            {Object.values(VIEW_MODES).map((mode) => (
              <button
                key={mode}
                type="button"
                className="rounded-2xl px-3 py-2 transition"
                style={{
                  backgroundColor: viewMode === mode ? 'var(--win-accent)' : 'transparent',
                  color: viewMode === mode ? 'white' : 'var(--win-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== mode) {
                    e.currentTarget.style.backgroundColor = 'var(--win-button-active)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== mode) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
                onClick={() => setViewMode(mode)}
              >
                {mode === VIEW_MODES.grid ? 'Grid' : 'List'}
              </button>
            ))}
          </div>
        </div>}
      </div>

      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
        <aside className="w-full md:w-[180px] border-b md:border-b-0 md:border-r p-4 backdrop-blur-xl shrink-0 overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}>
          <div className="mb-3 md:mb-4 flex items-center justify-between shrink-0 gap-4">
            <div className="text-xs uppercase tracking-[0.22em] hidden md:block" style={{ color: 'var(--win-text-secondary)' }}>This PC</div>
            <button
              onClick={() => handleAction('new')}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition text-xs"
              style={{ backgroundColor: 'var(--win-button-hover)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--win-button-active)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--win-button-hover)')}
              title="New Project"
            >
              ➕
            </button>
          </div>
          <nav className="flex flex-row md:flex-col gap-2">
            {CATEGORIES.map((category) => {
              const active = activeCategory === category.key
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => handleCategoryClick(category.key)}
                  className="flex shrink-0 w-auto md:w-full items-center justify-between rounded-3xl px-4 py-3 text-sm transition"
                  style={{
                    backgroundColor: active ? 'var(--win-button-active)' : 'transparent',
                    color: active ? 'var(--win-text)' : 'var(--win-text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'var(--win-button-hover)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span>{category.label}</span>
                  {active ? <span className="text-xs text-win-accent">›</span> : null}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-3 md:p-5">
          {projectId ? (
            <div className="flex-1 min-h-0 overflow-y-auto rounded-[24px] border p-4 shadow-inner shadow-black/10 md:p-6" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}>
              {detailLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner size="xl" />
                </div>
              ) : detailError ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p style={{ color: 'var(--win-text-secondary)' }}>{detailError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectLoadResult(null)
                      setDetailRetryCount((count) => count + 1)
                    }}
                    className="rounded-3xl border bg-win-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-win-accent/90"
                    style={{ borderColor: 'var(--win-border)' }}
                  >
                    Retry
                  </button>
                </div>
              ) : !detailProject ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <h1 className="text-xl font-semibold">Project not found</h1>
                  <p style={{ color: 'var(--win-text-secondary)' }}>This project may have been removed.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/app/projects')}
                    className="rounded-3xl border px-4 py-2 text-sm transition"
                    style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)' }}
                  >
                    Back to projects
                  </button>
                </div>
              ) : (
                <article className="mx-auto max-w-4xl space-y-6">
                  <button
                    type="button"
                    onClick={() => navigate('/app/projects')}
                    className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition hover:bg-[var(--win-button-hover)]"
                    style={{ color: 'var(--win-text-secondary)' }}
                  >
                    ← All projects
                  </button>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color="info">{detailProject.category}</Badge>
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${STATUS_COLOR_MAP[detailProject.status]}`}>
                        {detailProject.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction('edit')}
                        title="Edit Project"
                        className="rounded-full p-2 transition hover:bg-[var(--win-button-active)]"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction('delete')}
                        title="Delete Project"
                        className="rounded-full p-2 text-red-500 transition hover:bg-red-500/20"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {detailProject.thumbnail ? (
                    <img
                      src={detailProject.thumbnail}
                      alt={`${detailProject.title} preview`}
                      className="max-h-[360px] w-full rounded-[28px] border object-cover"
                      style={{ borderColor: 'var(--win-border)' }}
                    />
                  ) : (
                    <div
                      className="flex h-48 items-center justify-center rounded-[28px] border text-5xl"
                      style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)' }}
                    >
                      📁
                    </div>
                  )}

                  <div>
                    <h1 className="text-3xl font-semibold">{detailProject.title}</h1>
                    {detailProject.description && (
                      <p className="mt-3 text-base" style={{ color: 'var(--win-text-secondary)' }}>
                        {detailProject.description}
                      </p>
                    )}
                  </div>

                  {detailProject.longDescription && (
                    <section className="space-y-2">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--win-text-secondary)' }}>
                        About this project
                      </h2>
                      <p className="whitespace-pre-line text-sm leading-7">{detailProject.longDescription}</p>
                    </section>
                  )}

                  {detailProject.techStack.length > 0 && (
                    <section>
                      <h2 className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--win-text-secondary)' }}>
                        Tech stack
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {detailProject.techStack.map((tech) => (
                          <Badge key={tech} color="light" className="rounded-full text-[0.72rem]" style={{ backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text)' }}>
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="flex flex-wrap gap-3 border-t pt-5" style={{ borderColor: 'var(--win-border)' }}>
                    <span className="mr-auto self-center text-sm" style={{ color: 'var(--win-text-secondary)' }}>
                      Created {formatDate(detailProject.createdAt)}
                    </span>
                    {detailProject.githubUrl && (
                      <a
                        href={detailProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-3xl border bg-win-accent px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-win-accent/90"
                        style={{ borderColor: 'var(--win-border)' }}
                      >
                        View on GitHub
                      </a>
                    )}
                    {detailProject.liveUrl && (
                      <a
                        href={detailProject.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-3xl border px-4 py-3 text-center text-sm font-medium transition hover:bg-[var(--win-button-hover)]"
                        style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)', color: 'var(--win-text)' }}
                      >
                        Live demo
                      </a>
                    )}
                  </div>
                </article>
              )}
            </div>
          ) : (
          <div className="flex-1 overflow-y-auto rounded-[24px] border p-4 shadow-inner shadow-black/10" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {skeletonCards.map((index) => (
                  <div
                    key={index}
                    className="h-48 animate-pulse rounded-3xl p-4"
                    style={{ backgroundColor: 'var(--win-button-hover)' }}
                  >
                    <div className="mb-4 h-8 rounded-2xl" style={{ backgroundColor: 'var(--win-button-active)' }} />
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 rounded-full" style={{ backgroundColor: 'var(--win-button-active)' }} />
                      <div className="h-3 w-1/2 rounded-full" style={{ backgroundColor: 'var(--win-button-active)' }} />
                      <div className="mt-4 h-8 rounded-2xl" style={{ backgroundColor: 'var(--win-button-active)' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border p-6 text-center" style={{ borderColor: 'rgba(255,0,0,0.2)', backgroundColor: 'rgba(255,0,0,0.05)', color: 'var(--win-text)' }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full text-xl" style={{ backgroundColor: 'rgba(255,0,0,0.2)' }}>
                  !
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Could not load projects</h2>
                  <p className="mt-2 text-sm" style={{ color: 'var(--win-text-secondary)' }}>
                    Check your connection and try again.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchProjects}
                  className="rounded-3xl border bg-win-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-win-accent/90"
                  style={{ borderColor: 'var(--win-border)' }}
                >
                  Retry
                </button>
              </div>
            ) : visibleProjects.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed p-6" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text-secondary)' }}>
                <p className="text-lg font-medium">No projects match your filter.</p>
                <p className="mt-2 text-sm">Try a different search term or category.</p>
              </div>
            ) : (
                <section className="min-w-0">
                  <div className="mb-4 flex items-center justify-between text-sm" style={{ color: 'var(--win-text-secondary)' }}>
                    <span>{visibleProjects.length} projects</span>
                    <span className="uppercase tracking-[0.2em]">{viewMode === VIEW_MODES.grid ? 'Grid View' : 'List View'}</span>
                  </div>

                  {viewMode === VIEW_MODES.grid ? (
                    <motion.div
                      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 overflow-y-visible lg:overflow-y-auto no-scrollbar lg:h-full lg:pb-12"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.06 } },
                      }}
                    >
                      {visibleProjects.map((project) => {
                        return (
                          <motion.button
                            type="button"
                            key={project.id}
                            onClick={() => handleOpenDetail(project)}
                            layout
                            whileHover={{ y: -2 }}
                            className="group flex h-52 w-full flex-col justify-between overflow-hidden rounded-[28px] border p-4 text-left transition"
                            style={{
                              borderColor: 'var(--win-border)',
                              backgroundColor: 'transparent',
                              color: 'var(--win-text)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--win-button-hover)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <div>
                              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl text-2xl" style={{ backgroundColor: 'var(--win-button-hover)' }}>
                                📁
                              </div>
                              <h3 className="text-lg font-semibold">{project.title}</h3>
                              <p className="mt-2 text-sm leading-6" style={{ color: 'var(--win-text-secondary)' }}>{project.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[0.72rem]" style={{ color: 'var(--win-text-secondary)' }}>
                              {project.techStack.slice(0, 3).map((tech) => (
                                <span
                                  key={`${project.id}-${tech}`}
                                  className="rounded-full px-2 py-1"
                                  style={{ backgroundColor: 'var(--win-button-hover)' }}
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  ) : (
                    <div className="overflow-hidden rounded-3xl border" style={{ borderColor: 'var(--win-border)' }}>
                      <table className="min-w-full border-separate border-spacing-0 text-sm">
                        <thead style={{ backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text-secondary)' }}>
                          <tr>
                            {SORT_COLUMNS.map((column) => (
                              <th key={column.key} className="px-4 py-3 text-left">
                                <button
                                  type="button"
                                  onClick={() => handleSortClick(column.key)}
                                  className="flex items-center gap-2 font-medium"
                                >
                                  {column.label}
                                  {sortColumn === column.key ? (
                                    <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                  ) : null}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody style={{ color: 'var(--win-text)' }}>
                          {visibleProjects.map((project, index) => {
                            return (
                              <tr
                                key={project.id}
                                onClick={() => handleOpenDetail(project)}
                                className="cursor-pointer transition"
                                style={{
                                  backgroundColor: index % 2 === 0 ? 'var(--win-button-hover)' : 'transparent',
                                }}
                              >
                                <td className="px-4 py-4">{project.title}</td>
                                <td className="px-4 py-4" style={{ color: 'var(--win-text-secondary)' }}>{project.techStack.join(', ')}</td>
                                <td className="px-4 py-4">
                                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${STATUS_COLOR_MAP[project.status]}`}>
                                    {project.status}
                                  </span>
                                </td>
                                <td className="px-4 py-4" style={{ color: 'var(--win-text-secondary)' }}>{formatDate(project.createdAt)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
            )}
          </div>
          )}
        </main>
      </div>

      <div className="flex items-center justify-between border-t px-5 py-3 text-sm" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text-secondary)' }}>
        <span>{visibleProjects.length} items</span>
        <span>{projectId ? 'Project details' : 'Select a project to view details'}</span>
      </div>
    </div>
  )
}

export default Projects
