/**
 * Shared Form Design System
 * ─────────────────────────
 * Encodes the "Checklist Design DNA" established in Checklists.component.tsx
 * so that all forms in the application share the same premium aesthetic.
 *
 * Usage:
 *   <FormSection label="Nome do Tribunal">
 *     <Input ... className={inputCls} />
 *   </FormSection>
 *
 *   <WarningBanner>Esta ação impedirá o avanço do processo.</WarningBanner>
 *
 *   <CheckboxRow id="is_active" label="Status Ativo" checked={...} onChange={...} />
 */
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
export { cn };

// ──────────────────────────────────────────
// 1. Canonical class tokens
// ──────────────────────────────────────────

/** Canonical label: ultra-caps, muted, extrabold — matches Checklist dialog labels */
export const labelCls =
  'text-[10px] font-extrabold uppercase tracking-widest text-foreground/90 dark:text-foreground brightness-125';

/** Canonical input: fixed height, soft border, inset shadow, gold focus ring */
export const inputCls =
  'h-11 border-white/10 focus:ring-2 focus:ring-primary shadow-sm bg-background/60 dark:bg-card/40 transition-all rounded-xl';

/** Canonical textarea: same border + ring, no resize */
export const textareaCls =
  'border-border focus:ring-2 focus:ring-primary shadow-sm resize-none bg-background/60 dark:bg-card/40 transition-all';

/** Canonical select trigger */
export const selectCls =
  'h-11 border-white/10 focus:ring-2 focus:ring-primary bg-background/60 dark:bg-card/40 font-medium transition-all shadow-sm rounded-xl';

/** Canonical glass card container — matches Checklist accordion items */
export const glassCardCls =
  'border border-white/10 shadow-xl bg-card/40 backdrop-blur-sm rounded-2xl overflow-hidden';

/** Canonical glass card header */
export const glassCardHeaderCls =
  'border-b border-white/10 px-6 py-4';


// ──────────────────────────────────────────
// 2. Compound form-field wrapper
// ──────────────────────────────────────────

interface FormSectionProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Wraps an input control with the canonical label + hint + error pattern.
 */
export const FormSection: React.FC<FormSectionProps> = ({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  action,
  children,
}) => (
  <div className={cn('space-y-2', className)}>
    <div className="flex items-center justify-between">
      <Label htmlFor={htmlFor} className={cn(labelCls, required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      {action}
    </div>
    {children}
    {hint && !error && (
      <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{hint}</p>
    )}
    {error && (
      <p className="text-[10px] font-semibold text-destructive flex items-center gap-1">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ──────────────────────────────────────────
// 3. Warning banner (for is_required alerts)
// ──────────────────────────────────────────

interface WarningBannerProps {
  children: React.ReactNode;
  variant?: 'warning' | 'info';
}

export const WarningBanner: React.FC<WarningBannerProps> = ({
  children,
  variant = 'warning',
}) => (
  <div
    className={cn(
      'p-3 rounded-xl border flex gap-3 items-start',
      variant === 'warning'
        ? 'bg-destructive/5 border-destructive/20'
        : 'bg-primary/5 border-primary/20'
    )}
  >
    <AlertCircle
      className={cn(
        'w-4 h-4 shrink-0 mt-0.5',
        variant === 'warning' ? 'text-destructive' : 'text-primary'
      )}
    />
    <p
      className={cn(
        'text-[11px] leading-tight',
        variant === 'warning' ? 'text-destructive' : 'text-primary'
      )}
    >
      {children}
    </p>
  </div>
);

// ──────────────────────────────────────────
// 4. Checkbox row (single hit-target, WIG compliant)
// ──────────────────────────────────────────

interface CheckboxRowProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const CheckboxRow: React.FC<CheckboxRowProps> = ({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
}) => (
  <div className="flex items-center space-x-3 p-3 rounded-xl bg-primary/5 border border-border/50 h-11 transition-colors hover:bg-primary/10 cursor-pointer">
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(!!v)}
      disabled={disabled}
      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50 dark:border-primary border-2"
    />
    <Label htmlFor={id} className="text-xs font-bold cursor-pointer flex-1 select-none">
      {label}
    </Label>
  </div>
);

// ──────────────────────────────────────────
// 5. Dialog icon header (matches Checklist dialog)
// ──────────────────────────────────────────

interface DialogIconHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

/**
 * Renders an icon + title + description header suitable for use inside
 * shadcn/Radix Dialog/Sheet headers.
 *
 * NOTE: This intentionally uses plain elements to avoid overriding
 * the required DialogTitle/DialogDescription accessibility primitives.
 * Wrap it inside <DialogHeader> alongside a visually hidden <DialogTitle>
 * if needed, or use it as the only content inside <DialogHeader>.
 */
export const DialogIconHeader: React.FC<DialogIconHeaderProps> = ({
  icon,
  title,
  description,
}) => (
  <div className="flex items-center gap-3 mb-1">
    <div className="p-2 rounded-xl bg-primary/20 text-primary" aria-hidden="true">{icon}</div>
    <div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  </div>
);

// ──────────────────────────────────────────
// 6. Form footer buttons (canonical pair)
// ──────────────────────────────────────────

interface FormFooterProps {
  onCancel: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  isPending?: boolean;
  submitIcon?: React.ReactNode;
}

export const FormFooter: React.FC<FormFooterProps> = ({
  onCancel,
  cancelLabel = 'Cancelar',
  submitLabel = 'Confirmar',
  isSubmitting,
  isPending,
  submitIcon,
}) => {
  const loading = isSubmitting || isPending;
  return (
    <div className="flex gap-3 w-full mt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 h-11 font-bold text-xs uppercase tracking-widest rounded-xl border border-border/50 bg-transparent hover:bg-accent/10 transition-colors text-foreground/80"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex-1 h-11 font-bold text-xs uppercase tracking-widest rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {submitIcon}
        {loading ? 'Salvando…' : submitLabel}
      </button>
    </div>
  );
};
