import React, { useState } from 'react'
import { Search, Filter, AlertCircle, FileText, ExternalLink } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e293b' },
  cardMeta: { fontSize: '0.875rem', color: '#64748b', display: 'flex', gap: '12px' },
  badge: (bg, fg) => ({
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: bg,
    color: fg,
  }),
  tableContainer: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    marginTop: '12px'
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    color: '#475569',
    fontWeight: 600
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    color: '#1e293b'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    maxWidth: '400px'
  },
  input: { border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }
}

export default function Instruments({ data, country }) {
  const [query, setQuery] = useState('')
  if (!data) return null

  const {
    source_hierarchy = [],
    mechanism_sources = [],
    legal_provisions = [],
    validation_notes = []
  } = data

  const filteredSources = source_hierarchy.filter(s =>
    s.source_type.toLowerCase().includes(query.toLowerCase()) ||
    (s.function && s.function.toLowerCase().includes(query.toLowerCase()))
  )

  const getProvisionCount = (sourceType) => {
    // This is an approximation as we don't always have source_id mapping in all files
    // In a real app, we'd use the source_id from mechanism_sources
    return legal_provisions.filter(p => p.source_id && p.source_id.includes(sourceType.toUpperCase())).length
  }

  return (
    <div style={styles.container}>
      <div style={styles.searchBox}>
        <Search size={18} color="#94a3b8" />
        <input
          style={styles.input}
          placeholder="Search instruments or functions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={styles.cardGrid}>
        {filteredSources.map((source, idx) => (
          <div key={idx} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={styles.badge('#eff6ff', '#1e40af')}>Rank {source.rank}</div>
              {source.caution && <AlertCircle size={16} color="#ef4444" title={source.caution} />}
            </div>
            <div style={styles.cardTitle}>{source.source_type.replace(/_/g, ' ').toUpperCase()}</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', flex: 1 }}>{source.function}</div>
            <div style={styles.cardMeta}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={14} /> {source.legal_preparedness_value} preparedness
              </span>
            </div>
            {source.caution && (
              <div style={{ fontSize: '0.75rem', color: '#b91c1c', background: '#fef2f2', padding: '8px', borderRadius: '4px' }}>
                <strong>Caution:</strong> {source.caution}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Detailed Instrument Mapping</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Source Title</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Mechanisms</th>
                <th style={styles.th}>Manual Review</th>
              </tr>
            </thead>
            <tbody>
              {mechanism_sources.map((ms, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>{ms.source_title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ms.source_id}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badge('#f1f5f9', '#475569')}>{ms.source_type}</span>
                  </td>
                  <td style={styles.td}>{ms.normative_rank}</td>
                  <td style={styles.td}>{ms.mechanism_name}</td>
                  <td style={styles.td}>
                    {ms.manual_review_required === "true" ? (
                      <span style={styles.badge('#fef3c7', '#92400e')}>Required</span>
                    ) : (
                      <span style={styles.badge('#f0fdf4', '#166534')}>Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
