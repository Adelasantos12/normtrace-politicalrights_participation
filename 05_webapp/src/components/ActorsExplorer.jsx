import React, { useState, useMemo } from 'react'

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
  caution: {
    background: '#f0f9ff', border: '1px solid #7dd3fc', borderRadius: 6,
    padding: '10px 16px', margin: '16px 0', fontSize: 12, color: '#0c4a6e',
    display: 'flex', gap: 8, alignItems: 'flex-start'
  },
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 15, fontWeight: 700, color: '#1e3a5f',
    marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #e2e8f0'
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: {
    background: '#f1f5f9', padding: '8px 10px', textAlign: 'left',
    fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase',
    letterSpacing: 0.4, borderBottom: '2px solid #cbd5e1',
    whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none'
  },
  td: {
    padding: '7px 10px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top'
  },
  trEven: { background: '#fafafa' },
  trOdd: { background: '#fff' },
  badge: (color) => ({
    display: 'inline-block', padding: '1px 7px', borderRadius: 10,
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 0.3, ...COLOR_MAP[color] || COLOR_MAP.default
  }),
  filterRow: {
    display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap',
    alignItems: 'center'
  },
  input: {
    padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6,
    fontSize: 12, outline: 'none', width: 240
  },
  select: {
    padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6,
    fontSize: 12, outline: 'none', background: '#fff'
  },
  count: { fontSize: 12, color: '#94a3b8', marginLeft: 'auto' },
  tag: (type) => ({
    display: 'inline-block', padding: '1px 6px', borderRadius: 4,
    fontSize: 10, fontWeight: 600, marginRight: 3,
    ...NODE_TYPE_COLOR[type] || NODE_TYPE_COLOR.default
  }),
  stat: {
    display: 'inline-block', background: '#e0f2fe', color: '#0369a1',
    borderRadius: 4, padding: '0px 6px', fontSize: 11, fontWeight: 700
  },
  summaryGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12, marginBottom: 20
  },
  summaryCard: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '14px 16px', textAlign: 'center'
  },
  summaryNum: { fontSize: 28, fontWeight: 800, color: '#1e3a5f' },
  summaryLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  mapGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16
  },
  card: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '16px', overflow: 'hidden'
  },
  cardTitle: {
    fontSize: 13, fontWeight: 700, color: '#374151',
    marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #f1f5f9'
  },
  barWrap: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 },
  barLabel: { width: 180, fontSize: 11, color: '#374151', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 },
  bar: (pct, color) => ({
    height: 14, borderRadius: 3, background: color,
    width: `${Math.max(pct * 100, 2)}%`, transition: 'width 0.3s'
  }),
  barVal: { fontSize: 11, color: '#64748b', flexShrink: 0 },
  relTypeRow: { display: 'flex', justifyContent: 'space-between',
    padding: '3px 0', fontSize: 11, borderBottom: '1px solid #f8fafc' },
  edgeFilterRow: { display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  detailCell: { maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' },
}

const COLOR_MAP = {
  high:    { background: '#dcfce7', color: '#166534' },
  medium:  { background: '#fef9c3', color: '#713f12' },
  low:     { background: '#fee2e2', color: '#991b1b' },
  uncertain: { background: '#f3f4f6', color: '#374151' },
  default: { background: '#e2e8f0', color: '#475569' }
}

const NODE_TYPE_COLOR = {
  actor:                         { background: '#dbeafe', color: '#1d4ed8' },
  legal_instrument:              { background: '#d1fae5', color: '#065f46' },
  domestic_provision:            { background: '#ede9fe', color: '#5b21b6' },
  ihr2005_obligation:            { background: '#fce7f3', color: '#9d174d' },
  ihr2024_change:                { background: '#fff7ed', color: '#c2410c' },
  pandemic_agreement_obligation: { background: '#e0f2fe', color: '#075985' },
  pabs_draft_obligation:         { background: '#fef3c7', color: '#92400e' },
  implementation_domain:         { background: '#f0fdf4', color: '#166534' },
  gap_type:                      { background: '#fef2f2', color: '#991b1b' },
  default:                       { background: '#f1f5f9', color: '#475569' }
}

const REL_COLORS = {
  anchors_obligation:              '#3b82f6',
  indirectly_anchors_obligation:   '#8b5cf6',
  partially_anchors_obligation:    '#06b6d4',
  requires_review_for:             '#ef4444',
  has_legal_basis_in:              '#10b981',
  grants_power_to:                 '#f59e0b',
  creates_duty_for:                '#6366f1',
  creates_procedure_for:           '#ec4899',
  coordinates_with:                '#14b8a6',
  belongs_to:                      '#94a3b8',
  linked_to_implementation_domain: '#a3e635',
  linked_to_gap_type:              '#fb923c',
  linked_to_ihr2024_change:        '#fbbf24',
  linked_to_pandemic_agreement:    '#7dd3fc',
  linked_to_pabs:                  '#d8b4fe',
  default:                         '#cbd5e1'
}

// ── Sorting helper ────────────────────────────────────────────────────────────

function useSortedRows(rows, defaultKey, defaultDir = 'asc') {
  const [sort, setSort] = useState({ key: defaultKey, dir: defaultDir })
  const sorted = useMemo(() => {
    if (!rows) return []
    return [...rows].sort((a, b) => {
      const va = a[sort.key] ?? ''
      const vb = b[sort.key] ?? ''
      const cmp = typeof va === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb))
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [rows, sort.key, sort.dir])

  const toggle = (key) => setSort(s =>
    s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })

  const arrow = (key) => sort.key === key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''
  return { sorted, toggle, arrow }
}

// ── Caution banner ────────────────────────────────────────────────────────────

function CorpusCaution() {
  return (
    <div style={S.caution}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
      <span>
        <strong>Corpus-derived network — not an operational coordination map.</strong>{' '}
        Nodes and edges reflect what is documented in the NormTrace-IHR legal corpus and mapping tables.
        Centrality scores measure legal-institutional salience in the available documentation,
        not real-world power, influence, or coordination effectiveness.
        All data is <strong>preliminary_ai_assisted · requires_human_review</strong>.
      </span>
    </div>
  )
}

// ── ACTOR INVENTORY TAB ───────────────────────────────────────────────────────

function ActorInventoryTab({ nodes, metrics }) {
  const [query, setQuery] = useState('')
  const [govFilter, setGovFilter] = useState('')
  const [sectorFilter, setSectorFilter] = useState('')

  const metricsByNode = useMemo(() => {
    const m = {}
    if (metrics) metrics.forEach(r => { m[r.node_id] = r })
    return m
  }, [metrics])

  const actors = useMemo(() =>
    (nodes || []).filter(n => n.node_type === 'actor'), [nodes])

  const govLevels = useMemo(() =>
    [...new Set(actors.map(a => a.government_level).filter(Boolean))].sort(), [actors])

  const sectors = useMemo(() =>
    [...new Set(actors.map(a => a.sector).filter(Boolean))].sort(), [actors])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return actors.filter(a => {
      if (q && !a.label.toLowerCase().includes(q) &&
          !a.description?.toLowerCase().includes(q) &&
          !a.notes?.toLowerCase().includes(q)) return false
      if (govFilter && a.government_level !== govFilter) return false
      if (sectorFilter && a.sector !== sectorFilter) return false
      return true
    })
  }, [actors, query, govFilter, sectorFilter])

  const { sorted, toggle, arrow } = useSortedRows(
    filtered.map(a => ({
      ...a,
      degree: metricsByNode[a.node_id]?.degree ?? 0,
      betweenness: metricsByNode[a.node_id]?.betweenness_centrality ?? 0,
      in_degree: metricsByNode[a.node_id]?.in_degree ?? 0,
      out_degree: metricsByNode[a.node_id]?.out_degree ?? 0,
    })),
    'degree', 'desc'
  )

  return (
    <div style={S.section}>
      <CorpusCaution />
      <div style={S.filterRow}>
        <input style={S.input} placeholder="Search actors…" value={query}
          onChange={e => setQuery(e.target.value)} />
        <select style={S.select} value={govFilter}
          onChange={e => setGovFilter(e.target.value)}>
          <option value="">All government levels</option>
          {govLevels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select style={S.select} value={sectorFilter}
          onChange={e => setSectorFilter(e.target.value)}>
          <option value="">All sectors</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={S.count}>{sorted.length} actors</span>
      </div>
      <table style={S.table}>
        <thead>
          <tr>
            {[
              ['label', 'Actor Name'],
              ['actor_type', 'Type'],
              ['government_level', 'Gov. Level'],
              ['sector', 'Sector'],
              ['degree', 'Degree ↕'],
              ['betweenness', 'Betweenness'],
              ['in_degree', 'In'],
              ['out_degree', 'Out'],
            ].map(([key, label]) => (
              <th key={key} style={S.th} onClick={() => toggle(key)}>
                {label}{arrow(key)}
              </th>
            ))}
            <th style={S.th}>IHR Relevance (excerpt)</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((a, i) => (
            <tr key={a.node_id} style={i % 2 === 0 ? S.trEven : S.trOdd}>
              <td style={S.td}>
                <strong>{a.label}</strong>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{a.node_id}</div>
              </td>
              <td style={S.td}><span style={S.badge('default')}>{a.actor_type || '—'}</span></td>
              <td style={S.td}>{a.government_level || '—'}</td>
              <td style={S.td}>{a.sector || '—'}</td>
              <td style={{ ...S.td, textAlign: 'right', fontWeight: 700, color: '#1e3a5f' }}>
                {a.degree}
              </td>
              <td style={{ ...S.td, textAlign: 'right' }}>
                {a.betweenness > 0 ? a.betweenness.toFixed(4) : '—'}
              </td>
              <td style={{ ...S.td, textAlign: 'right' }}>{a.in_degree}</td>
              <td style={{ ...S.td, textAlign: 'right' }}>{a.out_degree}</td>
              <td style={{ ...S.td, ...S.detailCell, maxWidth: 220 }}>
                <span title={a.notes}>{a.notes || '—'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── RELATIONSHIP MAP TAB ──────────────────────────────────────────────────────

function RelationshipMapTab({ nodes, edges, summary }) {
  const [relFilter, setRelFilter] = useState('')
  const [layerFilter, setLayerFilter] = useState('')
  const [query, setQuery] = useState('')
  const [showEdges, setShowEdges] = useState(true)

  const nodeMap = useMemo(() => {
    const m = {}
    if (nodes) nodes.forEach(n => { m[n.node_id] = n })
    return m
  }, [nodes])

  const relTypes = useMemo(() =>
    [...new Set((edges || []).map(e => e.relationship_type))].sort(), [edges])

  const layers = useMemo(() =>
    [...new Set((nodes || []).map(n => n.layer))].sort(), [nodes])

  const edgeList = useMemo(() => {
    const q = query.toLowerCase()
    return (edges || []).filter(e => {
      if (relFilter && e.relationship_type !== relFilter) return false
      if (layerFilter) {
        const sn = nodeMap[e.source]
        const tn = nodeMap[e.target]
        if (sn?.layer !== layerFilter && tn?.layer !== layerFilter) return false
      }
      if (q) {
        const sl = nodeMap[e.source]?.label?.toLowerCase() || ''
        const tl = nodeMap[e.target]?.label?.toLowerCase() || ''
        if (!sl.includes(q) && !tl.includes(q)) return false
      }
      return true
    }).slice(0, 300)
  }, [edges, relFilter, layerFilter, query, nodeMap])

  const relTypeCounts = useMemo(() => {
    const c = {}
    ;(edges || []).forEach(e => { c[e.relationship_type] = (c[e.relationship_type] || 0) + 1 })
    return Object.entries(c).sort((a, b) => b[1] - a[1])
  }, [edges])

  const maxRelCount = Math.max(...relTypeCounts.map(([,c]) => c), 1)

  return (
    <div style={S.section}>
      <CorpusCaution />
      {summary && (
        <div style={S.summaryGrid}>
          {[
            [summary.node_count, 'Total Nodes'],
            [summary.edge_count, 'Total Edges'],
            [summary.node_type_counts?.actor || 0, 'Actors'],
            [summary.node_type_counts?.legal_instrument || 0, 'Legal Instruments'],
            [summary.node_type_counts?.ihr2005_obligation || 0, 'IHR 2005 Obligations'],
            [summary.node_type_counts?.domestic_provision || 0, 'Domestic Provisions'],
          ].map(([n, l]) => (
            <div key={l} style={S.summaryCard}>
              <div style={S.summaryNum}>{n}</div>
              <div style={S.summaryLabel}>{l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={S.mapGrid}>
        {/* Relationship type distribution */}
        <div style={S.card}>
          <div style={S.cardTitle}>Edges by Relationship Type</div>
          {relTypeCounts.map(([rel, count]) => (
            <div key={rel} style={S.barWrap}>
              <div style={S.barLabel} title={rel}>{rel.replace(/_/g, ' ')}</div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <div style={S.bar(count / maxRelCount, REL_COLORS[rel] || REL_COLORS.default)} />
              </div>
              <div style={S.barVal}>{count}</div>
            </div>
          ))}
        </div>

        {/* Node type distribution */}
        <div style={S.card}>
          <div style={S.cardTitle}>Nodes by Type</div>
          {summary && Object.entries(summary.node_type_counts || {})
            .sort((a,b) => b[1]-a[1])
            .map(([type, count]) => (
            <div key={type} style={S.barWrap}>
              <div style={{ ...S.barLabel }}>
                <span style={S.tag(type)}>{type.replace(/_/g,' ')}</span>
              </div>
              <div style={S.barVal}>{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top obligations by domestic anchors */}
      {summary?.top_obligations_by_anchors && (
        <div style={{ ...S.card, marginTop: 16 }}>
          <div style={S.cardTitle}>IHR 2005 Obligations — Domestic Anchor Counts</div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Obligation ID</th>
                <th style={S.th}>Label</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Anchors</th>
              </tr>
            </thead>
            <tbody>
              {summary.top_obligations_by_anchors.map((r, i) => (
                <tr key={r.obligation_id} style={i % 2 === 0 ? S.trEven : S.trOdd}>
                  <td style={S.td}><code style={{ fontSize: 11 }}>{r.obligation_id}</code></td>
                  <td style={{ ...S.td, ...S.detailCell }}>{r.label}</td>
                  <td style={{ ...S.td, textAlign: 'right', fontWeight: 700, color: '#1e3a5f' }}>
                    {r.anchor_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edge browser */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>Edge Browser</h3>
          <button
            style={{ ...S.badge('default'), cursor: 'pointer', border: 'none', padding: '4px 12px' }}
            onClick={() => setShowEdges(v => !v)}>
            {showEdges ? 'Hide' : 'Show'} edge table
          </button>
        </div>
        {showEdges && (
          <>
            <div style={S.edgeFilterRow}>
              <input style={S.input} placeholder="Search source/target label…" value={query}
                onChange={e => setQuery(e.target.value)} />
              <select style={S.select} value={relFilter} onChange={e => setRelFilter(e.target.value)}>
                <option value="">All relationship types</option>
                {relTypes.map(r => <option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
              </select>
              <select style={S.select} value={layerFilter} onChange={e => setLayerFilter(e.target.value)}>
                <option value="">All layers</option>
                {layers.map(l => <option key={l} value={l}>{l.replace(/_/g,' ')}</option>)}
              </select>
              <span style={S.count}>{edgeList.length} edges (max 300 shown)</span>
            </div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Source</th>
                  <th style={S.th}>Relationship</th>
                  <th style={S.th}>Target</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Wt</th>
                  <th style={S.th}>Instrument</th>
                  <th style={S.th}>Anchoring</th>
                  <th style={S.th}>Gap Type</th>
                  <th style={S.th}>Conf.</th>
                </tr>
              </thead>
              <tbody>
                {edgeList.map((e, i) => {
                  const sn = nodeMap[e.source]
                  const tn = nodeMap[e.target]
                  return (
                    <tr key={e.edge_id} style={i % 2 === 0 ? S.trEven : S.trOdd}>
                      <td style={S.td}>
                        <span style={S.tag(sn?.node_type)}>{sn?.node_type?.replace(/_/g,' ')}</span>
                        <div style={{ fontSize: 11, marginTop: 1 }}
                          title={sn?.label}>{sn?.label?.slice(0, 50) || e.source}</div>
                      </td>
                      <td style={S.td}>
                        <span style={{
                          ...S.badge('default'),
                          background: REL_COLORS[e.relationship_type] + '20',
                          color: REL_COLORS[e.relationship_type] || '#475569',
                          border: `1px solid ${REL_COLORS[e.relationship_type] || '#cbd5e1'}40`
                        }}>
                          {e.relationship_type.replace(/_/g,' ')}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={S.tag(tn?.node_type)}>{tn?.node_type?.replace(/_/g,' ')}</span>
                        <div style={{ fontSize: 11, marginTop: 1 }}
                          title={tn?.label}>{tn?.label?.slice(0, 50) || e.target}</div>
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', fontFamily: 'monospace' }}>
                        {Number(e.weight).toFixed(2)}
                      </td>
                      <td style={{ ...S.td, ...S.detailCell, maxWidth: 140 }}>
                        {e.instrument || '—'}
                      </td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        {e.anchoring_level || '—'}
                      </td>
                      <td style={{ ...S.td, ...S.detailCell, maxWidth: 100 }}>
                        {e.gap_type || '—'}
                      </td>
                      <td style={S.td}>
                        {e.confidence_level
                          ? <span style={S.badge(e.confidence_level)}>{e.confidence_level}</span>
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

// ── NETWORK METRICS TAB ───────────────────────────────────────────────────────

function NetworkMetricsTab({ nodes, metrics, summary }) {
  const [typeFilter, setTypeFilter] = useState('actor')
  const [query, setQuery] = useState('')

  const nodeMap = useMemo(() => {
    const m = {}
    if (nodes) nodes.forEach(n => { m[n.node_id] = n })
    return m
  }, [nodes])

  const nodeTypes = useMemo(() =>
    [...new Set((nodes || []).map(n => n.node_type))].sort(), [nodes])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return (metrics || []).filter(m => {
      if (typeFilter && m.node_type !== typeFilter) return false
      if (q && !(m.label || '').toLowerCase().includes(q)) return false
      return true
    }).sort((a,b) => b.degree - a.degree)
  }, [metrics, typeFilter, query])

  return (
    <div style={S.section}>
      <CorpusCaution />

      {/* Top actors + instruments summary cards */}
      {summary && (
        <div style={S.mapGrid}>
          <div style={S.card}>
            <div style={S.cardTitle}>Top Actors by Degree (corpus-derived)</div>
            {summary.top_actors_degree?.map((a, i) => (
              <div key={a.node_id} style={S.barWrap}>
                <div style={S.barLabel} title={a.label}>
                  <strong style={{ color: '#6b21a8', marginRight: 4 }}>{i+1}.</strong>
                  {a.label.slice(0, 32)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={S.bar(
                    a.degree / (summary.top_actors_degree[0]?.degree || 1),
                    '#3b82f6'
                  )} />
                </div>
                <div style={S.barVal}>{a.degree}</div>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>Top Legal Instruments by Degree (corpus-derived)</div>
            {summary.top_instruments?.map((a, i) => (
              <div key={a.node_id} style={S.barWrap}>
                <div style={S.barLabel} title={a.label}>
                  <strong style={{ color: '#065f46', marginRight: 4 }}>{i+1}.</strong>
                  {a.label.slice(0, 32)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={S.bar(
                    a.degree / (summary.top_instruments[0]?.degree || 1),
                    '#10b981'
                  )} />
                </div>
                <div style={S.barVal}>{a.degree}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full metrics table */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 10 }}>
          Full Metrics Table
        </h3>
        <div style={S.filterRow}>
          <input style={S.input} placeholder="Search by label…" value={query}
            onChange={e => setQuery(e.target.value)} />
          <select style={S.select} value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All node types</option>
            {nodeTypes.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
          </select>
          <span style={S.count}>{filtered.length} nodes</span>
        </div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Label</th>
              <th style={S.th}>Type</th>
              <th style={S.th}>Layer</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Degree</th>
              <th style={{ ...S.th, textAlign: 'right' }}>In</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Out</th>
              <th style={{ ...S.th, textAlign: 'right' }}>W. Degree</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Betweenness</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Eigenvector</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Comp.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.node_id} style={i % 2 === 0 ? S.trEven : S.trOdd}>
                <td style={S.td}>
                  <div title={m.label}>{(m.label || '').slice(0, 60)}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.node_id}</div>
                </td>
                <td style={S.td}><span style={S.tag(m.node_type)}>{m.node_type.replace(/_/g,' ')}</span></td>
                <td style={{ ...S.td, fontSize: 10, color: '#64748b' }}>
                  {m.layer.replace(/_layer$/,'').replace(/_/g,' ')}
                </td>
                <td style={{ ...S.td, textAlign: 'right', fontWeight: 700 }}>{m.degree}</td>
                <td style={{ ...S.td, textAlign: 'right' }}>{m.in_degree}</td>
                <td style={{ ...S.td, textAlign: 'right' }}>{m.out_degree}</td>
                <td style={{ ...S.td, textAlign: 'right' }}>{Number(m.weighted_degree).toFixed(2)}</td>
                <td style={{ ...S.td, textAlign: 'right', fontFamily: 'monospace', fontSize: 11 }}>
                  {m.betweenness_centrality > 0 ? m.betweenness_centrality.toFixed(5) : '—'}
                </td>
                <td style={{ ...S.td, textAlign: 'right', fontFamily: 'monospace', fontSize: 11 }}>
                  {m.eigenvector_centrality > 0 ? m.eigenvector_centrality.toFixed(5) : '—'}
                </td>
                <td style={{ ...S.td, textAlign: 'right' }}>{m.component_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function ActorsExplorer({ tab, nodes, edges, metrics, summary }) {
  if (tab === 'actors') return <ActorInventoryTab nodes={nodes} metrics={metrics} />
  if (tab === 'network') return <RelationshipMapTab nodes={nodes} edges={edges} summary={summary} />
  if (tab === 'metrics') return <NetworkMetricsTab nodes={nodes} metrics={metrics} summary={summary} />
  return null
}
