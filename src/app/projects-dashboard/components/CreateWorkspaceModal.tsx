'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, GitBranch, Cpu, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface CreateWorkspaceForm {
  name: string;
  repoUrl: string;
  branch: string;
  nodeVersion: string;
  cpuLimit: string;
  ramLimit: string;
  autoPreview: boolean;
}

const REPO_SUGGESTIONS: Array<{ id: string; label: string }> = [];

interface CreateWorkspaceModalProps {
  onClose: () => void;
}

export default function CreateWorkspaceModal({ onClose }: CreateWorkspaceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateWorkspaceForm>({
    defaultValues: {
      name: '',
      repoUrl: '',
      branch: 'main',
      nodeVersion: '20.11.0',
      cpuLimit: '2',
      ramLimit: '4',
      autoPreview: true,
    },
  });

  const onSubmit = async (data: CreateWorkspaceForm) => {
    toast.error(`Workspace provisioning is not connected. "${data.name}" was not created.`);
  };

  const watchName = watch('name');
  const watchRepo = watch('repoUrl');

  return (
    <Modal isOpen onClose={onClose} title="New Workspace" size="md">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <React.Fragment key={`step-${s}`}>
            <div className={`flex items-center gap-1.5 ${step >= s ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold border transition-all duration-200
                ${step > s ? 'bg-primary border-primary text-white' : step === s ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
                {step > s ? <Check size={10} /> : s}
              </div>
              <span className="text-xs font-medium">{s === 1 ? 'Repository' : 'Resources'}</span>
            </div>
            {s < 2 && <div className={`flex-1 h-px transition-colors duration-200 ${step > 1 ? 'bg-primary' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {step === 1 && (
          <div className="space-y-4 fade-in">
            {/* Workspace name */}
            <div>
              <label htmlFor="ws-name" className="block text-sm font-medium text-foreground mb-1">
                Workspace name
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Lowercase, hyphens only — used as container hostname</p>
              <input
                id="ws-name"
                type="text"
                placeholder="my-project-api"
                className="input-base w-full px-3 py-2 text-sm font-mono"
                {...register('name', {
                  required: 'Workspace name is required',
                  pattern: { value: /^[a-z0-9-]+$/, message: 'Only lowercase letters, numbers, and hyphens' },
                })}
              />
              {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
            </div>

            {/* Repo URL */}
            <div>
              <label htmlFor="ws-repo" className="block text-sm font-medium text-foreground mb-1">
                GitHub repository
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Full URL or owner/repo shorthand</p>
              <input
                id="ws-repo"
                type="text"
                placeholder="owner/repository or https://github.com/…"
                className="input-base w-full px-3 py-2 text-sm font-mono"
                {...register('repoUrl', { required: 'Repository is required' })}
              />
              {errors.repoUrl && <p className="mt-1 text-xs text-danger">{errors.repoUrl.message}</p>}
              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {REPO_SUGGESTIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setValue('repoUrl', r.label)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs border transition-all duration-150
                      ${watchRepo === r.label ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'}`}
                  >
                    <GitBranch size={9} />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Branch */}
            <div>
              <label htmlFor="ws-branch" className="block text-sm font-medium text-foreground mb-1">
                Branch
              </label>
              <input
                id="ws-branch"
                type="text"
                placeholder="main"
                className="input-base w-full px-3 py-2 text-sm font-mono"
                {...register('branch', { required: 'Branch is required' })}
              />
              {errors.branch && <p className="mt-1 text-xs text-danger">{errors.branch.message}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!watchName || !watchRepo}
                className="btn-primary text-sm"
              >
                Next: Configure Resources
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 fade-in">
            {/* Node version */}
            <div>
              <label htmlFor="ws-node" className="block text-sm font-medium text-foreground mb-1">
                Node.js version
              </label>
              <select
                id="ws-node"
                className="input-base w-full px-3 py-2 text-sm"
                {...register('nodeVersion')}
              >
                <option value="20.11.0">Node.js 20.11.0 LTS</option>
                <option value="18.20.2">Node.js 18.20.2 LTS</option>
                <option value="22.2.0">Node.js 22.2.0 (latest)</option>
              </select>
            </div>

            {/* CPU limit */}
            <div>
              <label htmlFor="ws-cpu" className="block text-sm font-medium text-foreground mb-1">
                CPU limit (vCPU cores)
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Max vCPU allocated to this container. KVM8 has 8 total.</p>
              <select
                id="ws-cpu"
                className="input-base w-full px-3 py-2 text-sm"
                {...register('cpuLimit')}
              >
                <option value="1">1 vCPU</option>
                <option value="2">2 vCPU</option>
                <option value="4">4 vCPU</option>
              </select>
            </div>

            {/* RAM limit */}
            <div>
              <label htmlFor="ws-ram" className="block text-sm font-medium text-foreground mb-1">
                RAM limit (GB)
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Max memory for this container. Prevent OOM-kill on other workspaces.</p>
              <select
                id="ws-ram"
                className="input-base w-full px-3 py-2 text-sm"
                {...register('ramLimit')}
              >
                <option value="2">2 GB</option>
                <option value="4">4 GB</option>
                <option value="8">8 GB</option>
                <option value="16">16 GB</option>
              </select>
            </div>

            {/* Auto preview */}
            <div className="flex items-start gap-3 p-3 bg-secondary/40 rounded-lg border border-border">
              <input
                id="ws-preview"
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded border-border bg-input accent-primary cursor-pointer"
                {...register('autoPreview')}
              />
              <div>
                <label htmlFor="ws-preview" className="text-sm font-medium text-foreground cursor-pointer">
                  Enable Cloudflare Tunnel preview
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically provision a preview URL via Cloudflare Tunnel when the workspace starts.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary text-sm"
                style={{ minWidth: 160 }}
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Cpu size={14} />
                    Provision Workspace
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}