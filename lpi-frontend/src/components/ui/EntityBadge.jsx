import React from 'react';
import { getEntityConfig } from '../../utils/entityColors';

/**
 * EntityBadge — displays a colored badge for a given entity type.
 * Props:
 *   type: string — entity type (e.g. 'COURT', 'JUDGE')
 *   size: 'sm' | 'md'
 */
export default function EntityBadge({ type, size = 'md' }) {
  const config = getEntityConfig(type);
  return (
    <span
      className={`badge ${config.badgeClass}`}
      style={size === 'sm' ? { fontSize: '0.6875rem', padding: '0.15em 0.45em' } : {}}
      title={type}
    >
      {config.label}
    </span>
  );
}
