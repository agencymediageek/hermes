'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ShieldCheck, GitMerge, Globe, Database, Loader2, AlertTriangle, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { workspaceInfo } from './workspaceData';

interface ApprovalForm {
  type: string;
  description: string;
  targetEnv: string;
  confirmText: string;
}

const APPROVAL_TYPES = [
  { id: 'at-merge', value: 'merge_to_main', label: 'Merge to main', icon: <GitMerge size={14} />, color: 'text-primary', risk: 'medium' },
  { id: 'at-deploy', value: 'deploy_prod', label: 'Deploy to production', icon: <Globe size={14} />, color: 'text-success', risk: 'high' },
  { id: 'at-db', value: 'db_migration', label: 'Database migration', icon: <Database size={14} />, color: 'text-warning', risk: 'high' },
];

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  medium: { label: 'Medium risk', color: 'text-warning' },
  high: { label: 'High risk — requires explicit confirmation', color: 'text-danger' },
};

interface ApprovalGateModalProps {
  onClose: () => void;
}

export default function ApprovalGateModal({ onClose }: ApprovalGateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApprovalForm>({
    defaultValues: {
      type: 'merge_to_main',
      description: `Merge ${workspaceInfo.branch} into main — ${workspaceInfo.name}`,
      targetEnv: 'production',
      confirmText: '',
    },
  });

  const watchType = watch('type');
  const watchConfirm = watch('confirmText');
  const selectedType = APPROVAL_TYPES.find((t) => t.value === watchType);
  const risk = selectedType?.risk ?? 'medium';
  const riskConf = RISK_LABELS[risk];
  const isHighRisk = risk === 'high';
  const confirmMatch = watchConfirm === 'APPROVE';

  const onSubmit = async (data: ApprovalForm) => {
    if (isHighRisk && !confirmMatch) return;
    setIsSubmitting(true);
    // BACKEND INTEGRATION: POST /api/approvals — body: { workspaceId, type, description, targetEnv }
    await new Promise((res) => setTimeout(res, 1200));
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      toast.success('Approval request submitted — pending review');
      onClose();
    }, 1500);
  };

  if (submitted) {
    return (
      <Modal isOpen onClose={onClose} title="Approval Request" size="sm">
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mb-3">
            <Check size={20} className="text-success" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Request submitted</p>
          <p className="text-xs text-muted-foreground">The team will be notified. No action will be taken until approved.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} title="Request Approval Gate" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Warning banner */}
        <div className="flex items-start gap-2 p-3 bg-warning/8 border border-warning/25 rounded-lg">
          <AlertTriangle size={14} className="text-warning mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            This action requires explicit human approval. It will not proceed until a team member reviews and approves the request.
          </p>
        </div>

        {/* Action type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Action type</label>
          <div className="space-y-2">
            {APPROVAL_TYPES.map((type) => {
              const isSelected = watchType === type.value;
              return (
                <label
                  key={type.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150
                    ${isSelected ? 'border-primary/40 bg-primary/8' : 'border-border hover:border-border/80 hover:bg-muted/10'}`}
                >
                  <input
                    type="radio"
                    value={type.value}
                    className="accent-primary"
                    {...register('type')}
                  />
                  <span className={type.color}>{type.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{type.label}</p>
                    <p className={`text-2xs font-medium ${RISK_LABELS[type.risk].color}`}>
                      {RISK_LABELS[type.risk].label}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="apr-desc" className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <p className="text-xs text-muted-foreground mb-1.5">
            Explain what this action does and why it needs to happen now
          </p>
          <textarea
            id="apr-desc"
            rows={3}
            className="input-base w-full px-3 py-2 text-sm resize-none"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
        </div>

        {/* High-risk confirmation */}
        {isHighRisk && (
          <div className="fade-in">
            <label htmlFor="apr-confirm" className="block text-sm font-medium text-foreground mb-1">
              Type <span className="font-mono text-danger">APPROVE</span> to confirm
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">
              This is a high-risk action. Confirm you understand the consequences.
            </p>
            <input
              id="apr-confirm"
              type="text"
              placeholder="APPROVE"
              className="input-base w-full px-3 py-2 text-sm font-mono"
              {...register('confirmText')}
            />
            {isHighRisk && !confirmMatch && watchConfirm.length > 0 && (
              <p className="mt-1 text-xs text-danger">Type exactly: APPROVE</p>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (isHighRisk && !confirmMatch)}
            className="btn-primary flex-1"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <ShieldCheck size={14} />
                Submit for Approval
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}