/**
 * src/utils/entityColors.js
 * ---------------------------------------------------------------
 * Maps entity types to their visual styling properties.
 * Used by EntityBadge and DocumentViewer for consistent colors.
 * ---------------------------------------------------------------
 */

export const ENTITY_CONFIG = {
  COURT: {
    label: 'Court',
    badgeClass: 'badge-COURT',
    highlight: 'rgba(219,234,254,0.6)',
    border: '#93C5FD',
  },
  JUDGE: {
    label: 'Judge',
    badgeClass: 'badge-JUDGE',
    highlight: 'rgba(237,233,254,0.6)',
    border: '#C4B5FD',
  },
  DATE: {
    label: 'Date',
    badgeClass: 'badge-DATE',
    highlight: 'rgba(204,251,241,0.6)',
    border: '#99F6E4',
  },
  PETITIONER: {
    label: 'Petitioner',
    badgeClass: 'badge-PETITIONER',
    highlight: 'rgba(219,234,254,0.5)',
    border: '#60A5FA',
  },
  RESPONDENT: {
    label: 'Respondent',
    badgeClass: 'badge-RESPONDENT',
    highlight: 'rgba(255,237,213,0.6)',
    border: '#FDBA74',
  },
  LAWYER: {
    label: 'Lawyer',
    badgeClass: 'badge-LAWYER',
    highlight: 'rgba(224,231,255,0.6)',
    border: '#A5B4FC',
  },
  STATUTE: {
    label: 'Statute',
    badgeClass: 'badge-STATUTE',
    highlight: 'rgba(220,252,231,0.6)',
    border: '#86EFAC',
  },
  PROVISION: {
    label: 'Provision',
    badgeClass: 'badge-PROVISION',
    highlight: 'rgba(209,250,229,0.6)',
    border: '#6EE7B7',
  },
  PRECEDENT: {
    label: 'Precedent',
    badgeClass: 'badge-PRECEDENT',
    highlight: 'rgba(255,228,230,0.6)',
    border: '#FCA5A5',
  },
  CASE_NUMBER: {
    label: 'Case No.',
    badgeClass: 'badge-CASE_NUMBER',
    highlight: 'rgba(254,243,199,0.6)',
    border: '#FCD34D',
  },
  ORG: {
    label: 'Organization',
    badgeClass: 'badge-ORG',
    highlight: 'rgba(241,245,249,0.8)',
    border: '#CBD5E1',
  },
  GPE: {
    label: 'Location',
    badgeClass: 'badge-GPE',
    highlight: 'rgba(207,250,254,0.6)',
    border: '#67E8F9',
  },
  WITNESS: {
    label: 'Witness',
    badgeClass: 'badge-WITNESS',
    highlight: 'rgba(254,252,232,0.6)',
    border: '#FDE047',
  },
  OTHER_PERSON: {
    label: 'Person',
    badgeClass: 'badge-OTHER_PERSON',
    highlight: 'rgba(243,244,246,0.8)',
    border: '#D1D5DB',
  },
};

export const ALL_ENTITY_TYPES = Object.keys(ENTITY_CONFIG);

export function getEntityConfig(entityType) {
  return ENTITY_CONFIG[entityType] || {
    label: entityType,
    badgeClass: 'badge-neutral',
    highlight: 'rgba(243,244,246,0.6)',
    border: '#D1D5DB',
  };
}

/**
 * Group an entities array by entity type.
 * @param {Array} entities
 * @returns {Object} { COURT: [...], JUDGE: [...], ... }
 */
export function groupEntitiesByType(entities) {
  return entities.reduce((acc, ent) => {
    if (!acc[ent.entity]) acc[ent.entity] = [];
    acc[ent.entity].push(ent);
    return acc;
  }, {});
}
