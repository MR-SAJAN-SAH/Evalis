import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaChevronLeft, FaChevronRight, FaSpinner, FaGraduationCap, FaClipboardList, FaCheckCircle, FaClock, FaFilter, FaThLarge, FaList, FaRocket, FaArchive, FaUndo } from 'react-icons/fa';
import CreateExam from '../components/exam/CreateExam';
import ExamDetailsModal from '../components/exam/ExamDetailsModal';
import PublishModal from '../components/exam/PublishModal';
import type { PublishFilters } from '../components/exam/PublishModal';
import '../styles/admin.css';
import '../styles/exams-enhanced.css';

interface Exam {
  id: string;
  code: string;
  name: string;
  subject: string;
  totalQuestions: number;
  durationMinutes: number;
  status: string;
  examType: string;
  createdAt: string;
}

interface ExamStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

const AllExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState<ExamStats>({ total: 0, published: 0, draft: 0, archived: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExamForPublish, setSelectedExamForPublish] = useState<Exam | null>(null);
  const [selectedExamForView, setSelectedExamForView] = useState<string | null>(null);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = viewMode === 'card' ? 12 : 10;

  // Fetch exams on mount
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/exams`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }

      const data = await response.json();
      setExams(data);
      
      // Calculate stats
      const statsData: ExamStats = {
        total: data.length,
        published: data.filter((e: Exam) => e.status === 'PUBLISHED').length,
        draft: data.filter((e: Exam) => e.status === 'DRAFT').length,
        archived: data.filter((e: Exam) => e.status === 'ARCHIVED').length,
      };
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/exams/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete exam');
        }

        setExams(exams.filter((exam) => exam.id !== id));
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete exam');
      }
    }
  };

  const handlePublishExam = async (id: string) => {
    const exam = exams.find((e) => e.id === id);
    if (exam) {
      setSelectedExamForPublish(exam);
      setShowPublishModal(true);
    }
  };

  const handlePublishWithFilters = async (filters: PublishFilters) => {
    if (!selectedExamForPublish) return;

    try {
      setPublishLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      console.log('Sending publish request with filters:', filters);
      console.log('Selected exam:', selectedExamForPublish);
      
      const response = await fetch(`${apiUrl}/api/exams/${selectedExamForPublish.id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to publish exam');
      }

      setShowPublishModal(false);
      setSelectedExamForPublish(null);
      fetchExams();
      alert('Exam published successfully with selected filters!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish exam');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleArchiveExam = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this exam?')) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/exams/${id}/archive`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to archive exam');
        }

        fetchExams();
        alert('Exam archived successfully!');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to archive exam');
      }
    }
  };

  const handleUnpublishExam = async (id: string) => {
    if (window.confirm('Are you sure you want to unpublish this exam? It will revert to DRAFT status and candidates will no longer see it.')) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/exams/${id}/unpublish`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to unpublish exam');
        }

        fetchExams();
        alert('Exam unpublished successfully! It has been reverted to DRAFT status.');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to unpublish exam');
      }
    }
  };

  const handleViewExam = (examId: string) => {
    setSelectedExamForView(examId);
    setShowDetailsModal(true);
  };

  const handleEditExam = (exam: any) => {
    setEditingExamId(exam.id);
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setEditingExamId(null);
    fetchExams();
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || exam.status === filterStatus;
    const matchesType = !filterType || exam.examType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const displayedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <FaCheckCircle />;
      case 'DRAFT':
        return <FaEdit />;
      case 'ARCHIVED':
        return <FaClock />;
      default:
        return <FaClipboardList />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'ARCHIVED':
        return 'secondary';
      case 'CLOSED':
        return 'danger';
      default:
        return 'info';
    }
  };

  return (
    <div className="all-exams-enhanced">
      {/* Page Header */}
      <div className="page-header-enhanced">
        <div className="header-content">
          <div className="header-text">
            <h1><FaGraduationCap /> Exam Management</h1>
            <p>Create, manage, and monitor your exams</p>
          </div>
          <button
            type="button"
            className="btn-primary-lg"
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
          >
            <FaPlus /> Create New Exam
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaClipboardList />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Exams</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon published">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.published}</h3>
            <p>Published</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon draft">
            <FaEdit />
          </div>
          <div className="stat-content">
            <h3>{stats.draft}</h3>
            <p>Draft</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon archived">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.archived}</h3>
            <p>Archived</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <p>{error}</p>
          <button onClick={fetchExams} className="btn-secondary">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <FaSpinner className="spinner" />
          <p>Loading exams...</p>
        </div>
      ) : (
        <>
          {/* Filters and Controls */}
          <div className="filters-bar">
            <div className="search-filters">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search by name, subject, or code..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="filter-group">
                <FaFilter />
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="filter-group">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select"
                >
                  <option value="">All Types</option>
                  <option value="MCQ">MCQ</option>
                  <option value="PROGRAMMING">Programming</option>
                </select>
              </div>
            </div>

            <div className="controls">
              <span className="results-count">
                {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''}
              </span>
              <div className="view-switcher">
                <button
                  className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
                  onClick={() => { setViewMode('card'); setCurrentPage(1); }}
                  title="Card View"
                >
                  <FaThLarge />
                </button>
                <button
                  className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => { setViewMode('table'); setCurrentPage(1); }}
                  title="Table View"
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>

          {displayedExams.length === 0 ? (
            <div className="empty-state-enhanced">
              <FaClipboardList className="empty-icon" />
              <h3>No exams found</h3>
              <p>
                {searchTerm || filterStatus || filterType
                  ? 'Try adjusting your filters'
                  : 'Create your first exam to get started!'}
              </p>
              {!searchTerm && !filterStatus && !filterType && (
                <button
                  className="btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <FaPlus /> Create Exam
                </button>
              )}
            </div>
          ) : viewMode === 'card' ? (
            <>
              {/* Card View */}
              <div className="exam-cards-grid">
                {displayedExams.map((exam) => (
                  <div key={exam.id} className="exam-card">
                    <div className="card-header">
                      <div className="card-title">
                        <h3>{exam.name}</h3>
                        <span className="exam-code">{exam.code}</span>
                      </div>
                      <span className={`status-badge status-${exam.status.toLowerCase()}`}>
                        {getStatusIcon(exam.status)} {exam.status}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="card-info">
                        <p><strong>Subject:</strong> {exam.subject}</p>
                        <p><strong>Type:</strong> <span className="badge badge-type">{exam.examType === 'MCQ' ? 'MCQ' : 'Programming'}</span></p>
                      </div>
                      <div className="card-stats">
                        <div className="stat">
                          <FaClipboardList />
                          <span>{exam.totalQuestions} Questions</span>
                        </div>
                        <div className="stat">
                          <FaClock />
                          <span>{exam.durationMinutes} min</span>
                        </div>
                      </div>
                      <p className="created-date">Created: {new Date(exam.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="btn-icon view" 
                        title="View exam details"
                        onClick={() => handleViewExam(exam.id)}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn-icon edit" 
                        title={exam.status === 'PUBLISHED' ? 'Cannot edit published exam' : 'Edit exam'}
                        onClick={() => {
                          if (exam.status === 'PUBLISHED') {
                            alert('This exam is PUBLISHED and cannot be edited. Please unpublish it first to make changes.');
                          } else {
                            const confirmEdit = window.confirm(
                              `Are you sure you want to edit "${exam.name}"?\n\nThis will allow you to modify the exam questions and settings.`
                            );
                            if (confirmEdit) {
                              handleEditExam(exam);
                            }
                          }
                        }}
                        disabled={exam.status === 'PUBLISHED'}
                      >
                        <FaEdit />
                      </button>
                      {exam.status === 'DRAFT' && (
                        <button
                          className="btn-icon publish"
                          title="Publish exam"
                          onClick={() => handlePublishExam(exam.id)}
                        >
                          <FaRocket />
                        </button>
                      )}
                      {exam.status === 'PUBLISHED' && (
                        <button
                          className="btn-icon archive"
                          title="Unpublish exam (Undo)"
                          onClick={() => handleUnpublishExam(exam.id)}
                        >
                          <FaUndo />
                        </button>
                      )}
                      {exam.status === 'PUBLISHED' && (
                        <button
                          className="btn-icon archive"
                          title="Archive exam"
                          onClick={() => handleArchiveExam(exam.id)}
                        >
                          <FaArchive />
                        </button>
                      )}
                      <button
                        className="btn-icon delete"
                        title="Delete exam"
                        onClick={() => handleDeleteExam(exam.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Table View */}
              <table className="management-table">
                <thead>
                  <tr>
                    <th>Exam Code</th>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Questions</th>
                    <th>Duration (min)</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedExams.map((exam) => (
                    <tr key={exam.id}>
                      <td className="exam-code">{exam.code}</td>
                      <td className="exam-name">{exam.name}</td>
                      <td>{exam.subject}</td>
                      <td>{exam.totalQuestions}</td>
                      <td>{exam.durationMinutes}</td>
                      <td>
                        <span className="badge badge-type">
                          {exam.examType === 'MCQ' ? 'MCQ' : 'Programming'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${exam.status.toLowerCase()}`}>
                          {getStatusIcon(exam.status)} {exam.status}
                        </span>
                      </td>
                      <td>{new Date(exam.createdAt).toLocaleDateString()}</td>
                      <td className="actions">
                        <button 
                          className="btn-icon view" 
                          title="View exam details"
                          onClick={() => handleViewExam(exam.id)}
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="btn-icon edit" 
                          title={exam.status === 'PUBLISHED' ? 'Cannot edit published exam' : 'Edit exam'}
                          onClick={() => {
                            if (exam.status === 'PUBLISHED') {
                              alert('This exam is PUBLISHED and cannot be edited. Please unpublish it first to make changes.');
                            } else {
                              const confirmEdit = window.confirm(
                                `Are you sure you want to edit "${exam.name}"?\n\nThis will allow you to modify the exam questions and settings.`
                              );
                              if (confirmEdit) {
                                handleEditExam(exam);
                              }
                            }
                          }}
                          disabled={exam.status === 'PUBLISHED'}
                        >
                          <FaEdit />
                        </button>
                        {exam.status === 'DRAFT' && (
                          <button
                            className="btn-icon publish"
                            title="Publish exam"
                            onClick={() => handlePublishExam(exam.id)}
                          >
                            <FaRocket />
                          </button>
                        )}
                        {exam.status === 'PUBLISHED' && (
                          <button
                            className="btn-icon archive"
                            title="Unpublish exam (Undo)"
                            onClick={() => handleUnpublishExam(exam.id)}
                          >
                            <FaUndo />
                          </button>
                        )}
                        {exam.status === 'PUBLISHED' && (
                          <button
                            className="btn-icon archive"
                            title="Archive exam"
                            onClick={() => handleArchiveExam(exam.id)}
                          >
                            <FaArchive />
                          </button>
                        )}
                        <button
                          className="btn-icon delete"
                          title="Delete exam"
                          onClick={() => handleDeleteExam(exam.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-pagination"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <FaChevronLeft /> Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                className="btn-pagination"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CreateExam
              onClose={() => {
                setShowCreateModal(false);
                setEditingExamId(null);
              }}
              onSuccess={handleCreateSuccess}
            />
          </div>
        </div>
      )}

      {showDetailsModal && selectedExamForView && (
        <ExamDetailsModal
          isOpen={showDetailsModal}
          examId={selectedExamForView}
          exam={null}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedExamForView(null);
          }}
          onEdit={handleEditExam}
        />
      )}

      {selectedExamForPublish && (
        <PublishModal
          isOpen={showPublishModal}
          examId={selectedExamForPublish.id}
          examName={selectedExamForPublish.name}
          onPublish={handlePublishWithFilters}
          onClose={() => {
            setShowPublishModal(false);
            setSelectedExamForPublish(null);
          }}
          loading={publishLoading}
        />
      )}
    </div>
  );
};

export default AllExams;
