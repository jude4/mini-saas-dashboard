'use client';

import { Edit2, Trash2, Calendar, DollarSign, User } from 'lucide-react';
import { Project } from '@/types';

interface ProjectTableProps {
  projects: Project[];
  isLoading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  ACTIVE: 'badge-active',
  ON_HOLD: 'badge-on-hold',
  COMPLETED: 'badge-completed',
};

const statusLabels = {
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
};

function getDeadlineInfo(deadline: Date | string, status: string) {
  const date = new Date(deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dDate = new Date(date);
  dDate.setHours(0, 0, 0, 0);
  
  const diffTime = dDate.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  let relativeLabel = '';
  let colorClass = 'text-dark-200';
  let isOverdue = false;

  if (diffDays === 0) {
    relativeLabel = 'Today';
    colorClass = 'text-yellow-400';
  } else if (diffDays === 1) {
    relativeLabel = 'Tomorrow';
    colorClass = 'text-primary-400';
  } else if (diffDays === -1) {
    relativeLabel = 'Yesterday';
    colorClass = 'text-red-400';
    isOverdue = true;
  } else if (diffDays > 1 && diffDays <= 7) {
    relativeLabel = `In ${diffDays} days`;
    colorClass = 'text-primary-400/80';
  } else if (diffDays < -1) {
    relativeLabel = `${Math.abs(diffDays)} days overdue`;
    colorClass = 'text-red-400';
    isOverdue = true;
  } else if (diffDays > 7) {
    relativeLabel = `In ${Math.floor(diffDays / 7)} weeks`;
    colorClass = 'text-dark-400';
  }

  if (status === 'COMPLETED') {
    colorClass = 'text-dark-400';
    isOverdue = false;
    relativeLabel = 'Done';
  }

  return { 
    relativeLabel, 
    fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    colorClass,
    isOverdue
  };
}

function formatBudget(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function isOverdue(deadline: Date | string, status: string): boolean {
  if (status === 'COMPLETED') return false;
  return new Date(deadline) < new Date();
}

export default function ProjectTable({
  projects,
  isLoading,
  onEdit,
  onDelete,
}: ProjectTableProps) {
  if (isLoading) {
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Team Member</th>
              <th>Deadline</th>
              <th>Budget</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="py-4">
                  <div className="space-y-2">
                    <div className="skeleton h-5 w-40"></div>
                    <div className="skeleton h-3 w-24 opacity-60"></div>
                  </div>
                </td>
                <td>
                  <div className="skeleton h-6 w-20 rounded-full"></div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="skeleton w-8 h-8 rounded-full"></div>
                    <div className="skeleton h-4 w-24"></div>
                  </div>
                </td>
                <td>
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-3 w-16 opacity-60"></div>
                  </div>
                </td>
                <td>
                  <div className="skeleton h-4 w-16"></div>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <div className="skeleton w-8 h-8 rounded-lg"></div>
                    <div className="skeleton w-8 h-8 rounded-lg"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-700 mb-4">
          <Calendar className="w-8 h-8 text-dark-400" />
        </div>
        <h3 className="text-lg font-medium text-dark-100 mb-2">No projects found</h3>
        <p className="text-dark-400">
          Create your first project or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Status</th>
            <th>Team Member</th>
            <th>Deadline</th>
            <th>Budget</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="group">
              <td>
                <div>
                  <p className="font-medium text-dark-100">{project.name}</p>
                  {project.description && (
                    <p className="text-sm text-dark-400 truncate max-w-xs">
                      {project.description}
                    </p>
                  )}
                </div>
              </td>
              <td>
                <span className={`badge ${statusColors[project.status]}`}>
                  {statusLabels[project.status]}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-400" />
                  </div>
                  <span className="text-dark-200">{project.teamMember}</span>
                </div>
              </td>
              <td>
                {(() => {
                  const info = getDeadlineInfo(project.deadline, project.status);
                  return (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${info.colorClass}`} />
                        <span className={`text-sm font-semibold tracking-tight ${info.colorClass}`}>
                          {info.relativeLabel}
                        </span>
                      </div>
                      <span className="text-xs text-dark-400 ml-6 font-medium whitespace-nowrap">
                        {info.fullDate}
                      </span>
                    </div>
                  );
                })()}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-dark-200 font-medium">
                    {formatBudget(project.budget)}
                  </span>
                </div>
              </td>
              <td>
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(project)}
                    className="p-2 rounded-lg hover:bg-dark-600 text-dark-300 hover:text-dark-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(project.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-dark-300 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
