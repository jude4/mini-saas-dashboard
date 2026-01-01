'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  Filter, 
  LogOut,
  RefreshCw,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import ProjectTable from './ProjectTable';
import ProjectModal from './ProjectModal';
import StatusFilterComponent from './StatusFilter';
import Sidebar from './Sidebar';
import DeleteConfirmation from './DeleteConfirmation';
import { Project, ProjectsResponse } from '@/types';

type StatusFilter = 'ALL' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [userName, setUserName] = useState('');
  const [totalProjects, setTotalProjects] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }
      if (search.trim()) {
        params.set('search', search.trim());
      }
      params.set('page', currentPage.toString());
      params.set('limit', pageSize.toString());

      const response = await fetch(`/api/projects?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        const projectsData = data.data as ProjectsResponse;
        setProjects(projectsData.projects);
        setTotalProjects(projectsData.total);
        setTotalPages(projectsData.totalPages);
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      showToast('Failed to load projects', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search, currentPage, pageSize, router]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name);
      } catch {
        // Ignore
      }
    }
    fetchProjects();
  }, [fetchProjects]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setProjectToDelete(project);
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        showToast('Project deleted successfully', 'success');
        setProjectToDelete(null);
        fetchProjects();
      } else {
        showToast(data.error || 'Failed to delete project', 'error');
      }
    } catch {
      showToast('Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };


  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      const token = localStorage.getItem('token');
      const isEditing = !!editingProject;
      
      const url = isEditing 
        ? `/api/projects/${editingProject.id}` 
        : '/api/projects';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();
      
      if (data.success) {
        showToast(
          isEditing ? 'Project updated successfully' : 'Project created successfully', 
          'success'
        );
        setIsModalOpen(false);
        fetchProjects();
      } else {
        showToast(data.error || 'Failed to save project', 'error');
      }
    } catch {
      showToast('Failed to save project', 'error');
    }
  };

  // Stats
  const stats = {
    total: totalProjects,
    active: projects.filter(p => p.status === 'ACTIVE').length,
    onHold: projects.filter(p => p.status === 'ON_HOLD').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        userName={userName}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-dark-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 -ml-2 rounded-lg text-dark-400 hover:bg-dark-700 lg:hidden transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-600/20 lg:hidden">
                    <LayoutDashboard className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-dark-100">Dashboard</h1>
                    <p className="text-xs text-dark-400 hidden sm:block">Welcome back, {userName}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-dark-100">{userName}</span>
                  <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">Administrator</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center text-primary-400 font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="skeleton h-6 w-12"></div>
                    <div className="skeleton h-3 w-16 opacity-60"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="card p-4 card-hover">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-600/20">
                    <FolderKanban className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark-100">{stats.total}</p>
                    <p className="text-sm text-dark-400">Total</p>
                  </div>
                </div>
              </div>
              <div className="card p-4 card-hover">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <div className="w-5 h-5 rounded-full bg-green-500"></div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark-100">{stats.active}</p>
                    <p className="text-sm text-dark-400">Active</p>
                  </div>
                </div>
              </div>
              <div className="card p-4 card-hover">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <div className="w-5 h-5 rounded-full bg-yellow-500"></div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark-100">{stats.onHold}</p>
                    <p className="text-sm text-dark-400">On Hold</p>
                  </div>
                </div>
              </div>
              <div className="card p-4 card-hover">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <div className="w-5 h-5 rounded-full bg-blue-500"></div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark-100">{stats.completed}</p>
                    <p className="text-sm text-dark-400">Completed</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects or team members..."
              className="input input-with-icon"
            />
          </div>

          {/* Filter */}
          <StatusFilterComponent
            value={statusFilter}
            onChange={setStatusFilter}
          />

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => fetchProjects()}
              className="btn btn-secondary btn-md text-dark-100"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleAddProject}
              className="btn btn-primary btn-md"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        </div>

        {/* Projects Table */}
        <ProjectTable
          projects={projects}
          isLoading={isLoading}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
        />

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-dark-400">
              Showing <span className="text-dark-100 font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-dark-100 font-medium">{Math.min(currentPage * pageSize, totalProjects)}</span> of <span className="text-dark-100 font-medium">{totalProjects}</span> projects
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-dark-800 border border-dark-600 text-dark-300 hover:text-dark-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                            : 'bg-dark-800 text-dark-400 hover:text-dark-100 border border-dark-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    Math.abs(pageNum - currentPage) === 2
                  ) {
                    return <span key={pageNum} className="px-1 text-dark-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-dark-800 border border-dark-600 text-dark-300 hover:text-dark-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
      />
      )}

      <DeleteConfirmation
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDeleteProject}
        title={projectToDelete?.name || ''}
        isLoading={isDeleting}
      />

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
