'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, DollarSign, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { Project } from '@/types';
import DatePicker from './DatePicker';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: (data: Partial<Project>) => Promise<void>;
}

export default function ProjectModal({ project, onClose, onSave }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'ON_HOLD' | 'COMPLETED'>('ACTIVE');
  const [deadline, setDeadline] = useState('');
  const [teamMember, setTeamMember] = useState('');
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!project;

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setStatus(project.status);
      setDeadline(new Date(project.deadline).toISOString().split('T')[0]);
      setTeamMember(project.teamMember);
      setBudget(project.budget.toString());
    }
  }, [project]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Project name is required';
    if (!teamMember.trim()) newErrors.teamMember = 'Team member is required';
    if (!deadline) newErrors.deadline = 'Deadline is required';
    if (!budget || parseFloat(budget) < 0) newErrors.budget = 'Valid budget is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        deadline: new Date(deadline),
        teamMember: teamMember.trim(),
        budget: parseFloat(budget),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700 bg-dark-800/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {isEditing ? 'Edit Project' : 'New Project'}
            </h2>
            <p className="text-xs text-dark-400 mt-0.5">
              {isEditing ? 'Update project details and status' : 'Fill in the information to create a new project'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-dark-700 text-dark-400 hover:text-white transition-all duration-200 border border-transparent hover:border-dark-600 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form id="project-form" onSubmit={handleSubmit} className="p-6 space-y-6 pb-24">
            {/* Project Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                Project Name
                <span className="text-primary-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Q3 Marketing Campaign"
              />
              {errors.name && (
                <p className="text-[11px] font-medium text-red-400 pl-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-dark-200">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[120px] py-3 resize-none"
                placeholder="Provide a brief overview of the project goals..."
                rows={4}
              />
            </div>

            {/* Status & Team */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                  Project Status
                  <span className="text-primary-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'ACTIVE', label: 'Active', icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', activeBg: 'bg-green-500', shadow: 'shadow-green-500/30' },
                    { id: 'ON_HOLD', label: 'On Hold', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', activeBg: 'bg-yellow-500', shadow: 'shadow-yellow-500/30' },
                    { id: 'COMPLETED', label: 'Done', icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', activeBg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStatus(item.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 gap-2.5 relative group ${
                        status === item.id 
                          ? `${item.activeBg} text-white border-transparent shadow-lg ${item.shadow} scale-[1.02]` 
                          : `${item.bg} ${item.color} ${item.border} hover:border-dark-500 hover:bg-dark-700/50`
                      }`}
                    >
                      <item.icon className={`w-5 h-5 transition-transform duration-300 ${status === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                      {status === item.id && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="teamMember" className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                  Lead Team Member
                  <span className="text-primary-500">*</span>
                </label>
                <input
                  id="teamMember"
                  type="text"
                  value={teamMember}
                  onChange={(e) => setTeamMember(e.target.value)}
                  className={`input ${errors.teamMember ? 'input-error' : ''}`}
                  placeholder="e.g. Sarah Jenkins"
                />
                {errors.teamMember && (
                  <p className="text-[11px] font-medium text-red-400 pl-1">{errors.teamMember}</p>
                )}
              </div>
            </div>

            {/* Deadline & Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="deadline" className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                  Deadline
                  <span className="text-primary-500">*</span>
                </label>
                <DatePicker
                  value={deadline}
                  onChange={setDeadline}
                  error={!!errors.deadline}
                  placeholder="Set deadline"
                />
                {errors.deadline && (
                  <p className="text-[11px] font-medium text-red-400 pl-1">{errors.deadline}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="budget" className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                  Budget (USD)
                  <span className="text-primary-500">*</span>
                </label>
                <div className="relative group">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 group-focus-within:text-primary-400 transition-colors" />
                  <input
                    id="budget"
                    type="text"
                    value={budget ? Number(budget).toLocaleString() : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      setBudget(val);
                    }}
                    className={`input input-with-icon ${errors.budget ? 'input-error' : ''}`}
                    placeholder="25,000"
                  />
                </div>
                {errors.budget && (
                  <p className="text-[11px] font-medium text-red-400 pl-1">{errors.budget}</p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Sticky Actions Footer */}
        <div className="p-6 border-t border-dark-700 bg-dark-800/80 backdrop-blur-md sticky bottom-0 z-10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-md px-6 rounded-xl hover:bg-dark-700 transition-all active:scale-95"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            form="project-form"
            type="submit"
            className="btn btn-primary btn-md px-8 rounded-xl shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Update Project' : 'Create Project'}</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
