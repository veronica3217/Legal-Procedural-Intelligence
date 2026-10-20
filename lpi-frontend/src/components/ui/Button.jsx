import React from 'react';

/**
 * Button — Reusable button component.
 * Props:
 *   variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 *   size:    'sm' | 'md' | 'lg'
 *   loading: bool
 *   disabled: bool
 *   icon: ReactNode (renders before children)
 *   iconRight: ReactNode (renders after children)
 *   fullWidth: bool
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      style={fullWidth ? { width: '100%' } : {}}
      {...props}
    >
      {loading ? (
        <span className="spinner" style={{ width: '0.875rem', height: '0.875rem' }} />
      ) : icon ? (
        icon
      ) : null}
      {children}
      {!loading && iconRight && iconRight}
    </button>
  );
}
