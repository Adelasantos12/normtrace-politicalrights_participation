import React, { useState } from 'react'
import { Search, FileText, AlertTriangle, Shield, CheckCircle, ArrowRight, Zap, Info, Users, Target, Settings } from 'lucide-react'
import { countryMatches } from '../utils'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' },
  td: { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' },
  searchContainer: { position: 'relative', marginBottom: '20px' },
  searchInput: { width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  badge: (rank) => ({
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    background: rank <= 2 ? '#eff6ff' : '#f1f5f9',
    color: rank <= 2 ? '#1e40af' : '#475569',
  }),
  insightCard: { background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '12px' },
  detailSection: { marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' },
  detailTitle: { fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }
}

export default function InstrumentsView({ data, country }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInstrument, setSelectedInstrument] = useState(null)

  if (!data || !data.instrument_insights) return <div>No instruments data available.</div>

  const instruments = data.instrument_insights.filter(i => countryMatches(i.country, country))
  const coverage = data.instrument_mechanism_coverage.filter(c => countryMatches(c.country, country))
  const princCoverage = data.instrument_principle_coverage.filter(c => countryMatches(c.country, country))
  const actorLinks = data.instrument_actor_links.filter(c => countryMatches(c.country, country))

  const filtered = instruments.filter(i =>
    (i.source_title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (i.source_type?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const activeInstrument = selectedInstrument ? instruments.find(i => i.source_id === selectedInstrument) : null
  const activeCoverage = selectedInstrument ? coverage.filter(c => c.source_id === selectedInstrument) : []
  const activePrincCoverage = selectedInstrument ? princCoverage.filter(c => c.source_id === selectedInstrument) : []
  const activeActorLinks = selectedInstrument ? actorLinks.filter(c => c.source_id === selectedInstrument) : []

  return (
    <div style={styles.container}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Instruments Reviewed</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Normative sources and instrument-level analytical insights.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: selectedInstrument ? '1fr 450px' : '1fr', gap: '20px' }}>
        <div style={styles.card}>
          <div style={styles.searchContainer}>
            <Search style={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search instruments by title or type..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Source Title / Type</th>
                  <th style={styles.th}>Rank</th>
                  <th style={styles.th}>Mechanisms</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst, idx) => (
                  <tr key={idx} style={{ background: selectedInstrument === inst.source_id ? '#f0f9ff' : 'transparent' }}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{inst.source_title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inst.source_type.replace(/_/g, ' ')}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge(inst.normative_rank)}>Rank {inst.normative_rank}</span>
                    </td>
                    <td style={styles.td}>{inst.mechanism_count} detected</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => setSelectedInstrument(inst.source_id === selectedInstrument ? null : inst.source_id)}
                        style={{ border: 'none', background: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {selectedInstrument === inst.source_id ? 'Close' : 'View Insights'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedInstrument && activeInstrument && (
          <div style={{ ...styles.card, height: 'fit-content', position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Instrument Insight</h3>
               <div style={styles.badge(activeInstrument.normative_rank)}>{activeInstrument.operational_role.toUpperCase()}</div>
            </div>

            <div style={styles.insightCard}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="#38bdf8" /> Analytical Finding
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '8px', lineHeight: 1.5 }}>{activeInstrument.analytical_insight}</p>
            </div>

            <div style={styles.detailSection}>
              <div style={styles.detailTitle}><Settings size={14} style={{ marginRight: '6px' }} /> Mechanisms Detected</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activeCoverage.map((c, idx) => (
                  <div key={idx} style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {c.mechanism_id}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.detailSection}>
              <div style={styles.detailTitle}><Shield size={14} style={{ marginRight: '6px' }} /> Principles Supported</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activePrincCoverage.map((p, idx) => (
                  <div key={idx} style={{ background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {p.principle_id}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.detailSection}>
              <div style={styles.detailTitle}><Users size={14} style={{ marginRight: '6px' }} /> Linked Actors</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activeActorLinks.map((a, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', color: '#475569', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {a.actor_name}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.detailSection}>
              <div style={styles.detailTitle}><Target size={14} style={{ marginRight: '6px' }} /> Legal Implication</div>
              <p style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600, lineHeight: 1.4 }}>
                {activeInstrument.legal_preparedness_implication}
              </p>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                <AlertTriangle size={14} /> Main Caveat
              </div>
              <p style={{ fontSize: '0.8rem', marginTop: '6px', color: '#92400e', lineHeight: 1.4 }}>
                {activeInstrument.main_caveat}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
