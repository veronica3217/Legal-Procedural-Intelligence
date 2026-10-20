import React, { useState } from 'react';
import EntityBadge from '../ui/EntityBadge';
import { ALL_ENTITY_TYPES } from '../../utils/entityColors';
import { Search, ArrowUpDown } from 'lucide-react';

export default function EntityTable({ entities = [] }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortBy, setSortBy] = useState('start');
  const [sortDir, setSortDir] = useState('asc');

  const presentTypes = [...new Set(entities.map(e => e.entity))];

  const filtered = entities
    .filter(e => {
      const matchType = filterType === 'ALL' || e.entity === filterType;
      const matchSearch = e.text.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    })
    .sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <Search size={15} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: '2rem' }}
            placeholder="Search entities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="ALL">All Types ({entities.length})</option>
          {presentTypes.map(t => (
            <option key={t} value={t}>{t} ({entities.filter(e => e.entity === t).length})</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('entity')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>Entity Type <ArrowUpDown size={12} /></span>
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('text')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>Extracted Text <ArrowUpDown size={12} /></span>
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('start')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>Position <ArrowUpDown size={12} /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
                  No entities found.
                </td>
              </tr>
            ) : (
              filtered.map((ent, i) => (
                <tr key={i}>
                  <td><EntityBadge type={ent.entity} /></td>
                  <td style={{ fontWeight: 500, color: 'var(--color-text)' }}>{ent.text}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    {ent.start}–{ent.end}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted mt-2" style={{ textAlign: 'right' }}>
        {filtered.length} of {entities.length} entities
      </div>
    </div>
  );
}
