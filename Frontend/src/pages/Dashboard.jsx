
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Users,
  Search,
  BookOpen,
} from 'lucide-react'

import Sidebar from '../components/Layout/Sidebar'
import TopBar from '../components/Layout/TopBar'

import {
  getMyGroups,
  createGroup,
  joinGroup,
  searchGroups,
} from '../api/groups'

import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

import './Dashboard.css'


const GROUP_COVERS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=200&fit=crop',
]


function Modal({ title, onClose, children }) {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="modal">

        <div className="modal-header">

          <h2 className="modal-title">
            {title}
          </h2>

          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>

        </div>

        {children}

      </div>
    </div>
  )
}


export default function Dashboard() {

  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [groups, setGroups] = useState([])
  const [filtered, setFiltered] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [showCreate, setShowCreate] =
    useState(false)

  const [showJoin, setShowJoin] =
    useState(false)

  const [createName, setCreateName] =
    useState('')

  const [joinSlug, setJoinSlug] =
    useState('')

  const [searchResults, setSearchResults] =
    useState([])

  const [searchLoading, setSearchLoading] =
    useState(false)

  const [submitting, setSubmitting] =
    useState(false)


  /* =========================================
     LOAD GROUPS
  ========================================= */

  useEffect(() => {
    loadGroups()
  }, [])


  const loadGroups = async () => {

    try {

      const res = await getMyGroups()

      setGroups(res.data)
      setFiltered(res.data)

    } catch {

      addToast(
        'Failed to load groups',
        'error'
      )

    } finally {

      setLoading(false)

    }
  }


  /* =========================================
     SEARCH GROUPS
  ========================================= */

  const handleSearch = (q) => {

    if (!q) {

      setFiltered(groups)

      return
    }

    const query =
      q.toLowerCase()

    setFiltered(
      groups.filter(
        (g) =>
          g.name
            .toLowerCase()
            .includes(query) ||
          g.slug
            .toLowerCase()
            .includes(query)
      )
    )
  }


  /* =========================================
     CREATE GROUP
  ========================================= */

  const handleCreate = async (e) => {

    e.preventDefault()

    if (!createName.trim()) return

    setSubmitting(true)

    try {

      const res =
        await createGroup(
          createName.trim()
        )

      addToast(
        'Group created!',
        'success'
      )

      setShowCreate(false)
      setCreateName('')

      loadGroups()

      navigate(
        `/groups/${res.data[0].slug}`
      )

    } catch {

      addToast(
        'Failed to create group',
        'error'
      )

    } finally {

      setSubmitting(false)

    }
  }


  /* =========================================
     SEARCH FOR GROUP TO JOIN
  ========================================= */

  const handleSearchSlug = async (val) => {

    setJoinSlug(val)

    if (!val.trim()) {

      setSearchResults([])

      return
    }

    setSearchLoading(true)

    try {

      const res =
        await searchGroups(
          val.trim()
        )

      setSearchResults(res.data)

    } catch {

      setSearchResults([])

    } finally {

      setSearchLoading(false)

    }
  }


  /* =========================================
     JOIN GROUP
  ========================================= */

  const handleJoin = async (slug) => {

    setSubmitting(true)

    try {

      await joinGroup(slug)

      addToast(
        'Joined group!',
        'success'
      )

      setShowJoin(false)
      setJoinSlug('')
      setSearchResults([])

      loadGroups()

    } catch (err) {

      const msg =
        err?.response?.data?.message ||
        'Failed to join group'

      addToast(msg, 'error')

    } finally {

      setSubmitting(false)

    }
  }


  const closeJoinModal = () => {

    setShowJoin(false)
    setSearchResults([])
    setJoinSlug('')

  }


  const topGroups =
    filtered.slice(0, 3)


  return (

    <div className="app-layout">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <Sidebar />


      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div className="main-content">

        <TopBar
          title="Main Dashboard"
          searchPlaceholder="Search groups…"
          onSearch={handleSearch}
        />


        <main className="page-body">

          {/* =================================
              COLLABORATIVE SPACES HEADER
          ================================= */}

          <div className="dash-section-header">

            <div className="dash-section-heading">

              <h2 className="dash-section-title">
                Collaborative Spaces
              </h2>

              <p className="dash-section-sub">
                Join a discussion or create a new
                literary circle with AI insights.
              </p>

            </div>


            <div className="dash-action-buttons">

              <button
                id="join-group-btn"
                className="btn btn-outline btn-sm"
                onClick={() =>
                  setShowJoin(true)
                }
              >
                <Plus size={15} />
                <span>Join Group</span>
              </button>


              <button
                id="create-group-btn"
                className="btn btn-primary btn-sm"
                onClick={() =>
                  setShowCreate(true)
                }
              >
                <Users size={15} />
                <span>Create Group</span>
              </button>

            </div>

          </div>


          {/* =================================
              TOP GROUP CARDS
          ================================= */}

          <div className="dash-grid">

            {loading ? (

              Array(3)
                .fill(0)
                .map((_, i) => (

                  <div
                    key={i}
                    className="dash-group-card skeleton"
                  />

                ))

            ) : topGroups.length === 0 ? (

              <div className="dash-empty">

                <BookOpen
                  size={40}
                  className="dash-empty-icon"
                />

                <p>
                  No groups yet. Create or join
                  one to get started!
                </p>

              </div>

            ) : (

              topGroups.map((g, i) => (

                <div
                  key={g.id}
                  className="dash-group-card card card-hover"
                  onClick={() =>
                    navigate(
                      `/groups/${g.slug}`
                    )
                  }
                >

                  <div className="dash-group-cover">

                    <img
                      src={
                        GROUP_COVERS[
                          i %
                          GROUP_COVERS.length
                        ]
                      }
                      alt={g.name}
                    />

                    <span className="dash-group-badge badge badge-green">
                      Active
                    </span>

                  </div>


                  <div className="dash-group-info">

                    <h3>
                      {g.name}
                    </h3>

                    <p className="text-sm text-muted">

                      <Users size={12} />

                      {g.member_count || 1}
                      {' '}
                      Members

                    </p>


                    <div className="dash-group-activity">

                      <span className="dash-activity-label">
                        RECENT ACTIVITY
                      </span>

                      <p>

                        <span
                          className="online-dot"
                        />

                        Group workspace available

                      </p>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>


          {/* =================================
              YOUR GROUPS
          ================================= */}

          <div className="dash-your-groups">

            <h2 className="dash-section-title dash-your-groups-title">
              Your Groups
            </h2>


            {filtered.length === 0 &&
            !loading ? (

              <p className="text-secondary text-sm">
                No groups found.
              </p>

            ) : (

              <div className="dash-groups-list">

                {filtered.map((g) => (

                  <div
                    key={g.id}
                    className="dash-group-row card card-hover"
                    onClick={() =>
                      navigate(
                        `/groups/${g.slug}`
                      )
                    }
                  >

                    <div
                      className="avatar dash-group-avatar"
                    >
                      {g.name[0].toUpperCase()}
                    </div>


                    <div className="dash-group-row-info">

                      <div className="font-semibold">
                        {g.name}
                      </div>

                      <div className="text-sm text-muted">
                        {g.slug}
                      </div>

                    </div>


                    <div className="dash-group-row-actions">

                      <span className="badge badge-purple">
                        <Users size={10} />
                        {g.member_count || 1}
                      </span>


                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()

                          navigate(
                            `/groups/${g.slug}/chat`
                          )
                        }}
                      >
                        Chat
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </main>

      </div>


      {/* =====================================
          CREATE GROUP MODAL
      ===================================== */}

      {showCreate && (

        <Modal
          title="Create New Group"
          onClose={() =>
            setShowCreate(false)
          }
        >

          <form onSubmit={handleCreate}>

            <div className="form-group dashboard-form-group">

              <label className="form-label">
                Group Name
              </label>

              <input
                id="create-group-name"
                className="form-input"
                placeholder="e.g. Philosophy Reading Circle"
                value={createName}
                onChange={(e) =>
                  setCreateName(
                    e.target.value
                  )
                }
                autoFocus
              />

            </div>


            <div className="modal-actions">

              <button
                type="button"
                className="btn btn-outline"
                onClick={() =>
                  setShowCreate(false)
                }
              >
                Cancel
              </button>


              <button
                id="create-group-submit"
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >

                {submitting ? (
                  <>
                    <span className="spinner" />
                    Creating…
                  </>
                ) : (
                  'Create Group'
                )}

              </button>

            </div>

          </form>

        </Modal>

      )}


      {/* =====================================
          JOIN GROUP MODAL
      ===================================== */}

      {showJoin && (

        <Modal
          title="Join a Group"
          onClose={closeJoinModal}
        >

          <div className="form-group dashboard-form-group">

            <label className="form-label">
              Search by group slug or name
            </label>

            <div className="join-search">

              <Search
                size={14}
                className="join-search-icon"
              />

              <input
                id="join-group-search"
                className="form-input"
                placeholder="e.g. philosophy-reading"
                value={joinSlug}
                onChange={(e) =>
                  handleSearchSlug(
                    e.target.value
                  )
                }
                autoFocus
              />

            </div>

          </div>


          {searchLoading && (

            <p className="text-sm text-muted join-status">
              Searching…
            </p>

          )}


          {searchResults.length > 0 && (

            <div className="join-results">

              {searchResults.map((g) => (

                <div
                  key={g.id}
                  className="join-result-row"
                >

                  <div className="join-result-info">

                    <div className="font-semibold">
                      {g.name}
                    </div>

                    <div className="text-sm text-muted">
                      {g.slug} ·{' '}
                      {g.member_count || 1}
                      {' '}
                      members
                    </div>

                  </div>


                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      handleJoin(g.slug)
                    }
                    disabled={submitting}
                  >
                    Join
                  </button>

                </div>

              ))}

            </div>

          )}


          {joinSlug &&
          !searchLoading &&
          searchResults.length === 0 && (

            <p className="text-sm text-muted join-status">
              No groups found for "{joinSlug}"
            </p>

          )}


          <div className="join-modal-footer">

            <button
              type="button"
              className="btn btn-outline"
              onClick={closeJoinModal}
            >
              Close
            </button>

          </div>

        </Modal>

      )}

    </div>
  )
}

