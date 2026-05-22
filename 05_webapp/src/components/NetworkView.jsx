import React, { useState, useMemo } from 'react'
import { Network, Users, Activity, AlertCircle, Shield, ExternalLink, Filter, TrendingUp, Zap, Info, BarChart2, Share2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts'
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
  }),
  chartContainer: { height: '400px', width: '100%', marginTop: '20px' },
  mapContainer: {
    height: '500px',
    width: '100%',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    position: 'relative',
    overflow: 'hidden'
  }
}

export default function NetworkView({ data, country, openEvidence, isMobile }) {
  const [activeTab, setActiveTab] = useState('map')

  if (!data) return null

  const {
    nodes = [],
    edges = [],
    actor_centrality = [],
    bottlenecks = [],
    network_validation = []
  } = data

  const countryName = country === 'Mexico' ? 'Mexico' : 'Costa Rica'

  const countryNodes = useMemo(() => (Array.isArray(nodes) ? nodes : []).filter(n => countryMatches(n.country, countryName)), [nodes, countryName])
  const countryEdges = useMemo(() => (Array.isArray(edges) ? edges : []).filter(e => countryMatches(e.country, countryName)), [edges, countryName])
  const countryBottlenecks = useMemo(() => (Array.isArray(bottlenecks) ? bottlenecks : []).filter(b => countryMatches(b.country, countryName)), [bottlenecks, countryName])
  const countryCentrality = useMemo(() => (Array.isArray(actor_centrality) ? actor_centrality : []).filter(c => countryMatches(c.country, countryName)), [actor_centrality, countryName])

  // Chart data: Top actors by degree centrality
  const chartData = useMemo(() => {
    return [...countryCentrality]
      .sort((a, b) => (b.degree_centrality || 0) - (a.degree_centrality || 0))
      .slice(0, 10)
      .map(c => ({
        name: c.actor_name,
        centrality: c.degree_centrality || 0,
        inDegree: c.in_degree || 0,
        outDegree: c.out_degree || 0
      }))
  }, [countryCentrality])

  // Simple Force-Directed-like layout for SVG Map
  const mapNodes = useMemo(() => {
    const width = 800
    const height = 500
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) * 0.7

    return countryNodes.map((node, i) => {
      const angle = (i / countryNodes.length) * 2 * Math.PI
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    })
  }, [countryNodes])

  const findNode = (id) => mapNodes.find(n => n.actor_id === id)

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Actors & Network</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.85rem' }}>Legally encoded functional relationships between institutions.</p>
          </div>
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', width: isMobile ? '100%' : 'auto', overflowX: 'auto' }}>
            {[
              { id: 'map', label: 'Map', icon: Share2 },
              { id: 'inventory', label: 'Inventory', icon: Users },
              { id: 'metrics', label: 'Metrics', icon: BarChart2 },
              { id: 'bottlenecks', label: 'Bottlenecks', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: isMobile ? 1 : 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  color: activeTab === tab.id ? '#0f172a' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <tab.icon size={14} />
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'map' && (
        <div style={styles.section}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
            <Info size={16} /> This map visualizes legally encoded links. Circular layout used for clarity.
          </div>
          <div style={styles.mapContainer}>
            <svg viewBox="0 0 800 500" style={{ width: '100%', height: '100%' }}>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="15" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                </marker>
              </defs>
              {/* Edges */}
              {countryEdges.map((edge, i) => {
                const source = findNode(edge.source)
                const target = findNode(edge.target)
                if (!source || !target) return null
                return (
                  <line
                    key={i}
                    x1={source.x} y1={source.y}
                    x2={target.x} y2={target.y}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    markerEnd="url(#arrowhead)"
                  />
                )
              })}
              {/* Nodes */}
              {mapNodes.map((node, i) => (
                <g key={i}>
                  <circle
                    cx={node.x} cy={node.y} r="8"
                    fill={node.actor_type === 'Citizen' ? '#0ea5e9' : '#1e293b'}
                  />
                  <text
                    x={node.x} y={node.y + 20}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#475569"
                  >
                    {node.actor_name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div style={styles.grid(isMobile)}>
          {countryNodes.map((actor, idx) => {
            const centrality = countryCentrality.find(c => c.actor_id === actor.actor_id)
            return (
              <div key={idx} style={styles.actorCard}>
                <div style={styles.cardHeader}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0ea5e9' }}>{actor.actor_type}</div>
                  {centrality && <div style={styles.metricBadge}>Degree: {centrality.degree_centrality?.toFixed(2)}</div>}
                </div>
                <div style={styles.cardBody}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{actor.actor_name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>{actor.legal_preparedness_role || actor.actor_description}</p>
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
        <div style={styles.container}>
          <div style={styles.section}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Top 10 Actors by Centrality</h3>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} fontSize={10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="centrality" fill="#0ea5e9" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#0369a1' : '#0ea5e9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...styles.section, padding: isMobile ? '12px' : '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Actor</th>
                    <th style={styles.th}>In</th>
                    <th style={styles.th}>Out</th>
                    <th style={styles.th}>Participation</th>
                  </tr>
                </thead>
                <tbody>
                  {countryCentrality
                    .sort((a, b) => (b.degree_centrality || 0) - (a.degree_centrality || 0))
                    .map((c, idx) => (
                      <tr key={idx}>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{c.actor_name}</td>
                        <td style={styles.td}>{c.in_degree}</td>
                        <td style={styles.td}>{c.out_degree}</td>
                        <td style={styles.td}>{c.mechanism_participation_count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bottlenecks' && (
        <div style={{ ...styles.section, padding: isMobile ? '12px' : '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
            <Activity size={16} /> Diagnostic of structural bottlenecks in legal procedures.
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Mechanism / Node</th>
                  <th style={styles.th}>Risk</th>
                  <th style={styles.th}>Diagnostic Note</th>
                </tr>
              </thead>
              <tbody>
                {countryBottlenecks.map((b, idx) => (
                  <tr key={idx}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{(b.mechanism_id || b.actor_id || '').replace(/_/g, ' ') || 'N/A'}</td>
                    <td style={styles.td}><span style={styles.riskBadge(b.bottleneck_risk)}>{b.bottleneck_risk}</span></td>
                    <td style={{ ...styles.td, color: '#64748b', fontSize: '0.8rem' }}>{b.risk_description || 'Identified as a critical coordination point.'}</td>
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
