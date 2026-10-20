import React, { useMemo, useState } from 'react';
import { getEntityConfig, ALL_ENTITY_TYPES } from '../../utils/entityColors';
import EntityBadge from '../ui/EntityBadge';

export default function DocumentViewer({ text = '', entities = [] }) {
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [activeTypes, setActiveTypes] = useState(ALL_ENTITY_TYPES);

  const presentTypes = useMemo(() => [...new Set(entities.map(e => e.entity))], [entities]);

  const toggleType = (type) => {
    setActiveTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Build highlighted segments
  const segments = useMemo(() => {
    if (!text || entities.length === 0) return [{ text, isEntity: false }];
    const activeEntities = entities.filter(e => activeTypes.includes(e.entity));
    const sorted = [...activeEntities].sort((a, b) => a.start - b.start);
    const result = [];
    let cursor = 0;
    for (const ent of sorted) {
      if (ent.start > cursor) result.push({ text: text.slice(cursor, ent.start), isEntity: false });
      if (ent.end > ent.start) {
        result.push({ text: text.slice(ent.start, ent.end), isEntity: true, entity: ent.entity, entObj: ent });
        cursor = ent.end;
      }
    }
    if (cursor < text.length) result.push({ text: text.slice(cursor), isEntity: false });
    return result;
  }, [text, entities, activeTypes]);

  return (
    <div>
      {/* Type toggles */}
      {presentTypes.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
          {presentTypes.map(type => {
            const active = activeTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  opacity: active ? 1 : 0.35, transition: 'opacity 0.15s',
                }}
                title={active ? `Hide ${type}` : `Show ${type}`}
              >
                <EntityBadge type={type} size="sm" />
              </button>
            );
          })}
        </div>
      )}

      {/* Text with highlights */}
      <div style={{
        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)', padding: '1.25rem',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8125rem',
        lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        maxHeight: 400, overflowY: 'auto', color: 'var(--color-text-secondary)',
      }}>
        {segments.map((seg, i) => {
          if (!seg.isEntity) return <span key={i}>{seg.text}</span>;
          const cfg = getEntityConfig(seg.entity);
          const isHovered = hoveredEntity === i;
          return (
            <span
              key={i}
              className="entity-highlight"
              style={{
                background: cfg.highlight,
                borderBottom: `2px solid ${cfg.border}`,
                boxShadow: isHovered ? `0 0 0 1px ${cfg.border}` : 'none',
                cursor: 'default',
              }}
              onMouseEnter={() => setHoveredEntity(i)}
              onMouseLeave={() => setHoveredEntity(null)}
              title={`${seg.entity}: ${seg.text}`}
            >
              {seg.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
