import React, { useState } from 'react'
import { Search, Filter, Book, FileText, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, Zap, Shield, Info } from 'lucide-react'
import { countryMatches } from '../utils'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  cardGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  }),
  instrumentCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardHeader: { padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBody: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
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
  insightBox: { padding: '12px', borderRadius: '8px', background: '#f0f9ff', border: '1px solid #e0f2fe', display: 'flex', flexDirection: 'column', gap: '8px' },
  insightTitle: { fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' },
  insightText: { fontSize: '0.85rem', color: '#0c4a6e', lineHeight: '1.4' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' },
  th: { textAlign: 'left', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#334155' },
  priorityBadge: (priority) => ({
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: 700,
    background: priority === 'high' ? '#fee2e2' : '#fef9c3',
    color: priority === 'high' ? '#991b1b' : '#854d0e',
    textTransform: 'uppercase',
    marginLeft: 'auto'
  })
}

export default function Instruments({ data, country, openEvidence, isMobile }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('cards')

  if (!data) return null

  const {
    source_hierarchy = [],
    legal_provisions = [],
    validation_notes = [],
    instrument_insights = []
  } = data

  const getTitle = (inst) => inst.source_title || inst.title || inst.source_type?.toUpperCase() || 'Unknown Instrument'
  const getId = (inst) => inst.source_id || inst.id || 'N/A'
  const getRank = (inst) => inst.normative_rank || inst.rank || 0

  const filteredInstruments = (Array.isArray(source_hierarchy) ? source_hierarchy : []).filter(inst => {
    const title = getTitle(inst).toLowerCase()
    const id = getId(inst).toLowerCase()
    const search = searchTerm.toLowerCase()
    return title.includes(search) || id.includes(search)
  })

  const getProvisionCount = (sourceId) => {
    if (!sourceId || sourceId === 'N/A') return 0
    return (Array.isArray(legal_provisions) ? legal_provisions : []).filter(p =>
      p.source_id === sourceId || p.instrument_id === sourceId
    ).length
  }

  const getManualReview = (sourceId) => {
    if (!sourceId || sourceId === 'N/A') return null
    return (Array.isArray(validation_notes) ? validation_notes : []).find(n =>
      (n.source_id === sourceId || n.instrument_id === sourceId) && n.manual_review_required === 'true'
    )
  }

  const getInsight = (sourceId) => {
    if (!sourceId || sourceId === 'N/A') return null
    return (Array.isArray(instrument_insights) ? instrument_insights : []).find(i =>
      (i.source_id === sourceId || i.instrument_id === sourceId || i.source_type === sourceId) && countryMatches(i.country, country)
    )
  }

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
          {filteredInstruments.map((inst, idx) => {
            const insight = getInsight(getId(inst)) || getInsight(inst.source_type)
            return (
              <div key={idx} style={styles.instrumentCard}>
                <div style={styles.cardHeader}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{getId(inst)}</div>
                    <div style={styles.rankBadge(getRank(inst))}>Rank {getRank(inst)}</div>
                  </div>
                  {getManualReview(getId(inst)) && <AlertTriangle size={18} color="#f59e0b" />}
                </div>
                <div style={styles.cardBody}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{getTitle(inst)}</h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Book size={14} color="#94a3b8" /> {inst.source_type}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={14} color="#94a3b8" /> {getProvisionCount(getId(inst)) || getProvisionCount(inst.source_type)} Provisions
                    </div>
                  </div>

                  {insight && (
                    <div style={styles.insightBox}>
                      <div style={styles.insightTitle}>
                        <Zap size={14} /> Analytical Insight
                        <span style={styles.priorityBadge(insight.manual_review_required === 'true' ? 'high' : 'medium')}>
                          {insight.manual_review_required === 'true' ? 'High Review' : 'Std Review'}
                        </span>
                      </div>
                      <div style={styles.insightText}>{insight.analytical_insight}</div>

                      <div style={{ borderTop: '1px solid #e0f2fe', paddingTop: '8px', marginTop: '4px' }}>
                        <div style={styles.insightTitle}><Shield size={14} /> Implication</div>
                        <div style={{ ...styles.insightText, fontSize: '0.8rem', color: '#0369a1' }}>{insight.legal_preparedness_implication}</div>
                      </div>

                      {insight.main_caveat && insight.main_caveat !== 'None identified.' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <Info size={14} color="#0369a1" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#0369a1' }}>{insight.main_caveat}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div style={styles.cardFooter}>
                  <button
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => openEvidence({ type: 'instrument', data: inst, title: getTitle(inst) })}
                  >
                    View Evidence <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Insight</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstruments.map((inst, idx) => {
                const insight = getInsight(getId(inst)) || getInsight(inst.source_type)
                return (
                  <tr key={idx}>
                    <td style={styles.td}>{getId(inst)}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{getTitle(inst)}</td>
                    <td style={styles.td}>{getRank(inst)}</td>
                    <td style={{ ...styles.td, color: '#64748b', fontSize: '0.8rem', maxWidth: '300px' }}>
                      {insight?.analytical_insight || 'No analytical summary available.'}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => openEvidence({ type: 'instrument', data: inst, title: getTitle(inst) })}
                        style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}
                      >
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
