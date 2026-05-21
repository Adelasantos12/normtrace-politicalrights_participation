import React, { useState } from 'react'
import { Users, Share2, Activity, AlertCircle, Info, Database, Search, Filter, ExternalLink } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  card: { background: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  title: { fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },
  tableContainer: { border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '14px 16px', borderBottom: '1px solid #f1f5f9', color: '#1e293b' },
  badge: (bg, fg) => ({ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, background: bg, color: fg }),
  metric: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
  metricLabel: { color: '#475569', fontWeight: 500 },
  metricValue: { fontWeight: 800, color: '#0f172a' },
  caveat: { padding: '20px', background: '#eff6ff', borderRadius: '16px', fontSize: '0.95rem', color: '#1e40af', border: '1px solid #bfdbfe', lineHeight: 1.5 },
  tabBtn: (active) => ({
    padding: '10px 20px',
    borderRadius: '10px',
    background: active ? '#0f172a' : '#fff',
    color: active ? '#fff' : '#475569',
    border: '1px solid #cbd5e1',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none'
  })
}

export default function NetworkView({ data, country, setSelectedEvidence }) {
  const [view, setView] = useState('actors')
  const [search, setSearch] = useState('')

  if (!data) return null

  const {
    nodes = [],
    edges = [],
    centrality = [],
    bottlenecks = [],
    admin_dependence = []
  } = data

  const isMex = country === 'mexico'
  const filterPrefix = isMex ? 'MEX' : 'CRC'

  const countryNodes = nodes.filter(n => n.node_id.startsWith(filterPrefix))
  const countryEdges = edges.filter(e => e.source.startsWith(filterPrefix))
  const countryCentrality = centrality.filter(c => c.node_id.startsWith(filterPrefix))

  const filteredNodes = countryNodes.filter(n =>
    n.label?.toLowerCase().includes(search.toLowerCase()) ||
    n.node_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.container}>
      <div style={styles.caveat}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Info size={24} style={{ flexShrink: 0 }} />
          <div>
            <strong>Functional Network Layer (v2):</strong> This view maps legally encoded relationships derived from statutory and regulatory instruments. It reflects the institutional architecture defined in the legal corpus, not observed administrative behavior or real-world political dynamics.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setView('actors')} style={styles.tabBtn(view === 'actors')}>Actor Inventory</button>
          <button onClick={() => setView('functional')} style={styles.tabBtn(view === 'functional')}>Functional Relationships</button>
          <button onClick={() => setView('diagnostics')} style={styles.tabBtn(view === 'diagnostics')}>Network Diagnostics</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '4px 12px', gap: '8px' }}>
          <Search size={18} color="#64748b" />
          <input
            placeholder="Search actors..."
            style={{ border: 'none', outline: 'none', padding: '6px', fontSize: '0.9rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {view === 'actors' && (
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.title}><Users size={24} color="#3b82f6" /> Institutional Actors</div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Actor Label</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNodes.filter(n => n.node_type === 'actor').slice(0, 12).map((n, i) => (
                    <tr key={i}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 700 }}>{n.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{n.node_id}</div>
                      </td>
                      <td style={styles.td}><span style={styles.badge('#f1f5f9', '#475569')}>{n.node_type}</span></td>
                      <td style={styles.td}>
                        <button
                          onClick={() => setSelectedEvidence({ ...n, mechanism: 'Institutional', finding: `Institutional actor identified in framework: ${n.label}` })}
                          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}
                        >
                          <ExternalLink size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.title}><Activity size={24} color="#10b981" /> Centrality Indicators</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {countryCentrality.sort((a,b) => (b.degree || 0) - (a.degree || 0)).slice(0, 10).map((c, i) => (
                <div key={i} style={styles.metric}>
                  <span style={styles.metricLabel}>{c.label || c.node_id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '100px', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (c.degree || 0) * 5)}%`, height: '100%', background: '#10b981' }} />
                    </div>
                    <span style={styles.metricValue}>{Number(c.degree_centrality || c.degree || 0).toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
              <Info size={16} style={{ marginBottom: '4px', display: 'block' }} />
              High degree centrality identifies actors with the most legally encoded functional relationships, indicating key nodes for institutional stability.
            </div>
          </div>
        </div>
      )}

      {view === 'functional' && (
        <div style={styles.card}>
          <div style={styles.title}><Share2 size={24} color="#8b5cf6" /> Legally Encoded Edges (Functional)</div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Source Node</th>
                  <th style={styles.th}>Relationship</th>
                  <th style={styles.th}>Target Node</th>
                  <th style={styles.th}>Weight</th>
                </tr>
              </thead>
              <tbody>
                {countryEdges.slice(0, 25).map((e, i) => (
                  <tr key={i}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 700 }}>{e.source_label || e.source}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge('#eff6ff', '#1e40af')}>{e.relationship_type || e.type || 'FUNCTIONAL'}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 700 }}>{e.target_label || e.target}</div>
                    </td>
                    <td style={styles.td}>{Number(e.weight || 1).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'diagnostics' && (
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.title}><AlertCircle size={24} color="#ef4444" /> Bottleneck Diagnostics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bottlenecks.filter(b => b.node_id?.startsWith(filterPrefix)).length > 0 ? bottlenecks.filter(b => b.node_id?.startsWith(filterPrefix)).slice(0, 4).map((b, i) => (
                <div key={i} style={{ padding: '16px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                  <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.9rem', marginBottom: '4px' }}>{b.node_id}</div>
                  <div style={{ fontSize: '0.9rem', color: '#b91c1c', lineHeight: 1.5 }}>{b.bottleneck_description || b.notes || 'Potential diagnostic bottleneck in functional coverage.'}</div>
                </div>
              )) : <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No critical bottlenecks flagged in the current functional layer.</div>}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.title}><Database size={24} color="#10b981" /> Administrative Dependence</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {admin_dependence.filter(a => a.country?.toLowerCase() === country.toLowerCase() || a.node_id?.startsWith(filterPrefix)).slice(0, 8).map((a, i) => (
                <div key={i} style={styles.metric}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{a.mechanism_id || a.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Statutory vs Administrative</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      ...styles.badge((a.dependence_score || 0) > 0.7 ? '#fee2e2' : '#f0fdf4', (a.dependence_score || 0) > 0.7 ? '#b91c1c' : '#166534'),
                      fontSize: '0.85rem'
                    }}>
                      {Number(a.dependence_score || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', fontSize: '0.85rem', color: '#64748b' }}>
              Higher scores indicate mechanisms whose operation is primarily defined in lower-rank administrative instruments.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
