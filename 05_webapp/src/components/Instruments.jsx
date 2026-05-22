import React, { useState } from 'react'
import { Search, Filter, Book, FileText, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { countryMatches } from '../utils'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  cardGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  }),
  instrumentCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardHeader: { padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBody: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
  cardFooter: { padding: '12px 20px', background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rankBadge: (rank) => ({
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    background: rank === 1 ? '#eff6ff' : rank === 2 ? '#f0fdf4' : '#fefce8',
    color: rank === 1 ? '#1e40af' : rank === 2 ? '#166534' : '#854d0e',
    textTransform: 'uppercase'
  }),
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' },
  th: { textAlign: 'left', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#334155' }
}

export default function Instruments({ data, country, openEvidence, isMobile }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState(isMobile ? 'cards' : 'cards')

  if (!data) return null

  const { source_hierarchy = [], legal_provisions = [], validation_notes = [] } = data

  const filteredInstruments = source_hierarchy.filter(inst =>
    inst.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inst.source_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProvisionCount = (sourceId) => legal_provisions.filter(p => p.source_id === sourceId).length
  const getManualReview = (sourceId) => validation_notes.find(n => n.source_id === sourceId && n.manual_review_required === 'true')

  return (
    <div style={styles.container}>
      <div style={{ background: '#fff', padding: isMobile ? '16px' : '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Instruments Reviewed</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.85rem' }}>Normative sources included in the diagnostic corpus.</p>
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setViewMode('cards')}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: viewMode === 'cards' ? '#f1f5f9' : '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: viewMode === 'table' ? '#f1f5f9' : '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Table
              </button>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search instruments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div style={styles.cardGrid(isMobile)}>
          {filteredInstruments.map((inst, idx) => (
            <div key={idx} style={styles.instrumentCard}>
              <div style={styles.cardHeader}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{inst.source_id}</div>
                  <div style={styles.rankBadge(inst.normative_rank)}>Rank {inst.normative_rank}</div>
                </div>
                {getManualReview(inst.source_id) && <AlertTriangle size={18} color="#f59e0b" />}
              </div>
              <div style={styles.cardBody}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{inst.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Book size={14} color="#94a3b8" /> {inst.source_type}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} color="#94a3b8" /> {getProvisionCount(inst.source_id)} Provisions
                  </div>
                </div>
              </div>
              <div style={styles.cardFooter}>
                <button
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => openEvidence({ type: 'instrument', data: inst, title: inst.title })}
                >
                  View Evidence <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Provisions</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstruments.map((inst, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{inst.source_id}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{inst.title}</td>
                  <td style={styles.td}>{inst.normative_rank}</td>
                  <td style={styles.td}>{getProvisionCount(inst.source_id)}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => openEvidence({ type: 'instrument', data: inst, title: inst.title })}
                      style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}
                    >
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
