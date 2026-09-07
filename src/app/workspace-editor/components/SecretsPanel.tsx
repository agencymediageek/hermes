'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, Plus, Trash2, Save, Lock, Loader2, AlertTriangle } from 'lucide-react';
import { envSecrets as initialSecrets, type EnvSecret } from './workspaceData';

interface AddSecretForm {
  key: string;
  value: string;
  isSecret: boolean;
}

export default function SecretsPanel() {
  const [secrets, setSecrets] = useState<EnvSecret[]>(initialSecrets);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddSecretForm>({
    defaultValues: { key: '', value: '', isSecret: true },
  });

  const toggleVisibility = (id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string, key: string) => {
    setDeletingId(id);
    // BACKEND INTEGRATION: DELETE /api/workspaces/:workspaceId/secrets/:id
    await new Promise((res) => setTimeout(res, 600));
    setSecrets((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
    toast.success(`Deleted secret: ${key}`);
  };

  const onAddSecret = async (data: AddSecretForm) => {
    setSavingId('new');
    // BACKEND INTEGRATION: POST /api/workspaces/:workspaceId/secrets — encrypts value server-side
    await new Promise((res) => setTimeout(res, 800));
    const newSecret: EnvSecret = {
      id: `env-${Date.now()}`,
      key: data.key.toUpperCase().replace(/\s+/g, '_'),
      value: data.value,
      isSecret: data.isSecret,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setSecrets((prev) => [...prev, newSecret]);
    setSavingId(null);
    setShowAddForm(false);
    reset();
    toast.success(`Secret "${newSecret.key}" added and encrypted`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <Lock size={13} className="text-primary" />
          <span className="text-xs font-semibold text-foreground">{secrets.length} variables</span>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/15 text-primary border border-primary/30 rounded text-xs font-medium hover:bg-primary/25 transition-colors duration-150"
        >
          <Plus size={11} />
          Add
        </button>
      </div>

      {/* Security notice */}
      <div className="mx-3 mt-2 mb-1 flex items-start gap-2 px-2 py-2 bg-warning/5 border border-warning/20 rounded-lg shrink-0">
        <AlertTriangle size={11} className="text-warning mt-0.5 shrink-0" />
        <p className="text-2xs text-muted-foreground leading-relaxed">
          Secrets are encrypted at rest and injected into the container at runtime. Never exposed in logs or agent conversations.
        </p>
      </div>

      {/* Add form */}
      {showAddForm && (
        <form onSubmit={handleSubmit(onAddSecret)} className="mx-3 my-2 p-3 bg-secondary/40 border border-border rounded-lg space-y-2.5 shrink-0 fade-in">
          <div>
            <label htmlFor="secret-key" className="block text-2xs font-medium text-foreground mb-1">Key</label>
            <input
              id="secret-key"
              type="text"
              placeholder="DATABASE_URL"
              className="input-base w-full px-2.5 py-1.5 text-xs font-mono uppercase"
              {...register('key', { required: 'Key is required', pattern: { value: /^[A-Z0-9_]+$/i, message: 'Letters, numbers, underscores only' } })}
            />
            {errors.key && <p className="mt-0.5 text-2xs text-danger">{errors.key.message}</p>}
          </div>
          <div>
            <label htmlFor="secret-value" className="block text-2xs font-medium text-foreground mb-1">Value</label>
            <input
              id="secret-value"
              type="password"
              placeholder="••••••••••"
              className="input-base w-full px-2.5 py-1.5 text-xs font-mono"
              {...register('value', { required: 'Value is required' })}
            />
            {errors.value && <p className="mt-0.5 text-2xs text-danger">{errors.value.message}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input id="is-secret" type="checkbox" className="w-3.5 h-3.5 rounded border-border bg-input accent-primary cursor-pointer" {...register('isSecret')} />
            <label htmlFor="is-secret" className="text-2xs text-muted-foreground cursor-pointer">Mark as secret (mask in UI)</label>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={() => { setShowAddForm(false); reset(); }} className="btn-secondary text-xs px-2.5 py-1.5 flex-1">
              Cancel
            </button>
            <button type="submit" disabled={savingId === 'new'} className="btn-primary text-xs px-2.5 py-1.5 flex-1">
              {savingId === 'new' ? <Loader2 size={12} className="animate-spin" /> : <><Save size={11} /> Save</>}
            </button>
          </div>
        </form>
      )}

      {/* Secrets list */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        {secrets.map((secret) => {
          const isVisible = visibleIds.has(secret.id);
          const isDeleting = deletingId === secret.id;
          const displayValue = secret.isSecret && !isVisible
            ? '•'.repeat(Math.min(secret.value.length, 20))
            : secret.value;

          return (
            <div
              key={secret.id}
              className="flex items-start gap-2 px-2.5 py-2 rounded-lg border border-border hover:border-border/80 hover:bg-muted/10 transition-all duration-150 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-mono font-semibold text-foreground">{secret.key}</span>
                  {secret.isSecret && (
                    <span className="text-2xs px-1 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded">
                      secret
                    </span>
                  )}
                </div>
                <p className="text-2xs font-mono text-muted-foreground truncate">{displayValue}</p>
                <p className="text-2xs text-muted-foreground/60 mt-0.5">Updated {secret.lastUpdated}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {secret.isSecret && (
                  <button
                    onClick={() => toggleVisibility(secret.id)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                    title={isVisible ? 'Hide value' : 'Reveal value'}
                  >
                    {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(secret.id, secret.key)}
                  disabled={isDeleting}
                  className="p-1 rounded text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all duration-150 disabled:opacity-50"
                  title={`Delete ${secret.key} — this cannot be undone`}
                >
                  {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}