import React, { useState } from 'react'
import { Users, Share2, Activity, AlertCircle, Info, Database } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  card: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  title: { fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  tableContainer: { border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#334155' },
  badge: (bg, fg) => ({ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: bg, color: fg }),
  metric: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  metricLabel: { color: '#64748b' },
  metricValue: { fontWeight: 700, color: '#1e3a8a' },
  caveat: { padding: '16px', background: '#eff6ff', borderRadius: '8px', fontSize: '0.875rem', color: '#1e40af', border: '1px solid #bfdbfe' }
}

export default function NetworkView({ data, country }) {
  const [view, setView] = useState('actors')

  if (!data) return null

  const {
    nodes = [],
    edges = [],
    centrality = [],
    bottlenecks = [],
    admin_dependence = []
  } = data

  const countryNodes = nodes.filter(n => n.node_id.startsWith(country === 'mexico' ? 'MEX' : 'CRC'))
  const countryEdges = edges.filter(e => e.source.startsWith(country === 'mexico' ? 'MEX' : 'CRC'))

  return (
    <div style={styles.container}>
      <div style={styles.caveat}>
        <Info size={18} style={{ float: 'left', marginRight: '12px' }} />
        <strong>Network Caveat:</strong> This is a legally encoded functional network, not observed administrative behaviour. It maps how actors and mechanisms are connected through statutory and regulatory instruments.
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setView('actors')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            background: view === 'actors' ? '#1e3a8a' : '#fff',
            color: view === 'actors' ? '#fff' : '#475569',
            border: '1px solid #cbd5e1',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Actor Inventory
        </button>
        <button
          onClick={() => setView('functional')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            background: view === 'functional' ? '#1e3a8a' : '#fff',
            color: view === 'functional' ? '#fff' : '#475569',
            border: '1px solid #cbd5e1',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Functional Relationship Map
        </button>
      </div>

      {view === 'actors' ? (
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.title}><Users size={20} /> Actor Inventory</div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Actor Name</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Prep. Role</th>
                  </tr>
                </thead>
                <tbody>
                  {countryNodes.filter(n => n.node_type === 'actor').slice(0, 15).map((n, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{n.label}</td>
                      <td style={styles.td}><span style={styles.badge('#f1f5f9', '#475569')}>{n.node_type}</span></td>
                      <td style={styles.td}>{n.role || 'Duty-bearer'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.title}><Activity size={20} /> Centrality Metrics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {centrality.slice(0, 8).map((c, i) => (
                <div key={i} style={styles.metric}>
                  <span style={styles.metricLabel}>{c.label || c.node_id}</span>
                  <span style={styles.metricValue}>{Number(c.degree_centrality || c.degree).toFixed(3)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', fontSize: '0.75rem', color: '#64748b' }}>
              High centrality suggests key institutional nodes for legal stability.
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.title}><Share2 size={20} /> Functional Relationships</div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Source</th>
                    <th style={styles.th}>Relationship</th>
                    <th style={styles.th}>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {countryEdges.slice(0, 20).map((e, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{e.source_label || e.source}</td>
                      <td style={styles.td}><span style={styles.badge('#eff6ff', '#1e40af')}>{e.relationship_type || e.type}</span></td>
                      <td style={styles.td}>{e.target_label || e.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={styles.card}>
              <div style={styles.title}><AlertCircle size={20} color="#ef4444" /> Bottleneck Diagnostics</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bottlenecks.length > 0 ? bottlenecks.slice(0, 3).map((b, i) => (
                  <div key={i} style={{ padding: '10px', background: '#fef2f2', borderRadius: '6px', fontSize: '0.8125rem', border: '1px solid #fee2e2' }}>
                    <strong>{b.node_id}:</strong> {b.bottleneck_description || b.notes || 'Potential diagnostic bottleneck.'}
                  </div>
                )) : <div>No critical bottlenecks detected in current layer.</div>}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.title}><Database size={20} color="#10b981" /> Administrative Dependence</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {admin_dependence.slice(0, 5).map((a, i) => (
                  <div key={i} style={styles.metric}>
                    <span style={styles.metricLabel}>{a.mechanism_id || a.label}</span>
                    <span style={{
                      ...styles.badge(a.dependence_score > 0.7 ? '#fee2e2' : '#f0fdf4', a.dependence_score > 0.7 ? '#991b1b' : '#166534')
                    }}>
                      {Number(a.dependence_score || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
