import React, { useState } from 'react'
import { Network, Users, Activity, AlertCircle, Shield, ExternalLink, Filter, TrendingUp, Zap, Info } from 'lucide-react'
import { countryMatches } from '../utils'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  section: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' },
  grid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px'
  }),
  actorCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardHeader: { padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardBody: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
  metricBadge: { padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#1e40af', fontSize: '0.7rem', fontWeight: 700 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' },
  td: { padding: '12px', borderBottom: '1px solid #f1f5f9' },
  riskBadge: (risk) => ({
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    background: risk === 'high' ? '#fee2e2' : risk === 'medium' ? '#fef9c3' : '#f0fdf4',
    color: risk === 'high' ? '#991b1b' : risk === 'medium' ? '#854d0e' : '#166534',
    textTransform: 'uppercase'
  })
}

export default function NetworkView({ data, country, openEvidence, isMobile }) {
  const [activeTab, setActiveTab] = useState('inventory')

  if (!data) return null

  const {
    nodes = [],
    edges = [],
    actor_centrality = [],
    bottlenecks = [],
    network_validation = []
  } = data

  const countryName = country === 'Mexico' ? 'Mexico' : 'Costa Rica'
  const countryNodes = nodes.filter(n => countryMatches(n.country, countryName))
  const countryEdges = edges.filter(e => countryMatches(e.country, countryName))
  const countryBottlenecks = bottlenecks.filter(b => countryMatches(b.country, countryName))
  const countryValidation = network_validation.filter(v => countryMatches(v.country, countryName))

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Actors & Network</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.85rem' }}>Legally encoded functional relationships.</p>
          </div>
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', width: isMobile ? '100%' : 'auto' }}>
            {['inventory', 'metrics', 'bottlenecks'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: isMobile ? 1 : 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === tab ? '#fff' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: activeTab === tab ? 700 : 400,
                  color: activeTab === tab ? '#0f172a' : '#64748b'
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div style={styles.grid(isMobile)}>
          {countryNodes.map((actor, idx) => {
            const centrality = actor_centrality.find(c => c.actor_id === actor.actor_id)
            return (
              <div key={idx} style={styles.actorCard}>
                <div style={styles.cardHeader}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0ea5e9' }}>{actor.actor_type}</div>
                  {centrality && <div style={styles.metricBadge}>Degree: {centrality.degree_centrality?.toFixed(2)}</div>}
                </div>
                <div style={styles.cardBody}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{actor.actor_name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>{actor.legal_preparedness_role}</p>
                </div>
                <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
                   <button
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => openEvidence({ type: 'mechanism', data: { mechanism_id: 'all' }, title: actor.actor_name })}
                  >
                    View Evidence <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'metrics' && (
        <div style={{ ...styles.section, padding: isMobile ? '12px' : '24px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Actor</th>
                  <th style={styles.th}>In</th>
                  <th style={styles.th}>Out</th>
                  <th style={styles.th}>Mechs</th>
                </tr>
              </thead>
              <tbody>
                {actor_centrality
                  .filter(c => countryNodes.some(n => n.actor_id === c.actor_id))
                  .sort((a, b) => b.degree_centrality - a.degree_centrality)
                  .map((c, idx) => (
                    <tr key={idx}>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{countryNodes.find(n => n.actor_id === c.actor_id)?.actor_name}</td>
                      <td style={styles.td}>{c.in_degree}</td>
                      <td style={styles.td}>{c.out_degree}</td>
                      <td style={styles.td}>{c.mechanism_participation_count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bottlenecks' && (
        <div style={{ ...styles.section, padding: isMobile ? '12px' : '24px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Mechanism</th>
                  <th style={styles.th}>Risk</th>
                </tr>
              </thead>
              <tbody>
                {countryBottlenecks.map((b, idx) => (
                  <tr key={idx}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{b.mechanism_id.replace(/_/g, ' ')}</td>
                    <td style={styles.td}><span style={styles.riskBadge(b.bottleneck_risk)}>{b.bottleneck_risk}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
