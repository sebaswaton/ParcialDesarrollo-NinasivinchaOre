import clsx from 'clsx';

interface BadgeProps {
  label: string;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({ label, className, dot, pulse }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', className)}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full bg-current', pulse && 'pulse-dot')} />
      )}
      {label}
    </span>
  );
}
