import React, { useState } from 'react'
import { countryMatches } from '../utils'
import { Users, Activity, AlertTriangle, Link, Info } from 'lucide-react'

export default function NetworkView({ data, country, setSelectedEvidence }) {
  if (!data) return null

  // Handle potentially wrapped or missing data
  const nodes = data.nodes || []
  const edges = data.edges || []
  const actor_centrality = data.actor_centrality || []
  const bottleneck_diagnostics = data.bottleneck_diagnostics || []
  const admin_dependence = data.admin_dependence || []

  const countryFilter = countryMatches(country, 'mexico') ? 'MEX' : 'CRC'
  const countryName = countryMatches(country, 'mexico') ? 'Mexico' : 'Costa Rica'

  const countryNodes = nodes.filter(n => n.node_id && n.node_id.startsWith(countryFilter))
  const countryEdges = edges.filter(e => e.source && e.source.startsWith(countryFilter))

  const actors = countryNodes.filter(n => n.node_type === 'actor')

  // Metrics extraction
  const countryCentrality = (actor_centrality.metrics || actor_centrality).filter?.(c => countryMatches(c.country, country)) || []
  const countryBottlenecks = (bottleneck_diagnostics.bottlenecks || bottleneck_diagnostics).filter?.(b => countryMatches(b.country, country)) || []
  const countryAdminDep = (admin_dependence.metrics || admin_dependence).filter?.(a => countryMatches(a.country, country)) || []

  const [activeTab, setActiveTab] = useState('inventory')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Actors & Functional Network</h2>
        <p style={{ color: '#64748b' }}>Legally encoded relationships between institutional actors and political participation mechanisms in {countryName}.</p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          {['inventory', 'centrality', 'bottlenecks', 'dependence'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === tab ? '#eff6ff' : 'transparent',
                color: activeTab === tab ? '#2563eb' : '#64748b',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '24px' }}>
          {activeTab === 'inventory' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {actors.map((actor, i) => {
                const actorEdges = countryEdges.filter(e => e.source === actor.node_id || e.target === actor.node_id)
                return (
                  <div key={i} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Users size={16} color="#2563eb" />
                      <span style={{ fontWeight: 600 }}>{actor.label || actor.actor_name}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
                      {actor.actor_type || 'Institutional Actor'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {actorEdges.slice(0, 3).map((e, j) => (
                        <span key={j} style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                          {e.rel_type}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'centrality' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px' }}>Actor</th>
                    <th style={{ padding: '12px' }}>Degree</th>
                    <th style={{ padding: '12px' }}>Betweenness</th>
                    <th style={{ padding: '12px' }}>Closeness</th>
                  </tr>
                </thead>
                <tbody>
                  {countryCentrality.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 500 }}>{m.actor || m.actor_name}</td>
                      <td style={{ padding: '12px' }}>{Number(m.degree_centrality || 0).toFixed(3)}</td>
                      <td style={{ padding: '12px' }}>{Number(m.betweenness_centrality || 0).toFixed(3)}</td>
                      <td style={{ padding: '12px' }}>{Number(m.closeness_centrality || 0).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'bottlenecks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {countryBottlenecks.length > 0 ? countryBottlenecks.map((b, i) => (
                <div key={i} style={{ padding: '16px', border: '1px solid #fee2e2', background: '#fffafb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', marginBottom: '8px' }}>
                    <AlertTriangle size={18} />
                    <span style={{ fontWeight: 700 }}>{b.mechanism || b.mechanism_id}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#450a0a', fontWeight: 600, marginBottom: '4px' }}>
                    Bottleneck: {b.bottleneck_type}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>{b.description}</p>
                </div>
              )) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No major bottlenecks identified in current diagnostic.</div>
              )}
            </div>
          )}

          {activeTab === 'dependence' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {countryAdminDep.map((m, i) => (
                <div key={i} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>{m.mechanism || m.mechanism_id}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(m.dependence_score || 0) * 100}%`, height: '100%', background: (m.dependence_score || 0) > 0.6 ? '#f59e0b' : '#10b981' }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{((m.dependence_score || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                    Administrative Independence Risk
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#64748b" />
        <div>
          <strong>Network Caveat:</strong> This is a legally encoded functional network based on normative mandates, not observed administrative behaviour or political performance.
        </div>
      </div>
    </div>
  )
}
