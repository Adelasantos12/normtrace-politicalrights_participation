import React, { useState, useMemo } from 'react'
import { Filter, Info, AlertTriangle, ArrowRight, ExternalLink, Target, Shield, CheckCircle } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  controls: {
    display: 'flex',
    gap: '16px',
    padding: '20px',
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  select: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    background: '#f8fafc',
    outline: 'none',
    cursor: 'pointer'
  },
  heatmapContainer: {
    background: '#fff',
    padding: '32px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflowX: 'auto',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  grid: {
    display: 'grid',
    gap: '6px',
    minWidth: '1000px'
  },
  cell: (score, isSelected, manualReview) => ({
    width: '100%',
    aspectRatio: '1',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: isSelected ? '3px solid #0f172a' : '1px solid rgba(0,0,0,0.05)',
    background: getScoreColor(score),
    color: score > 2 ? '#fff' : '#1e293b',
    position: 'relative',
    boxShadow: isSelected ? '0 0 10px rgba(0,0,0,0.1)' : 'none'
  }),
  reviewDot: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#ef4444',
    border: '1px solid #fff'
  },
  headerLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textAlign: 'center',
    padding: '8px 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1.2,
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
  },
  rowLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#334155',
    textAlign: 'right',
    paddingRight: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%'
  },
  legend: { display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap', padding: '16px', background: '#f8fafc', borderRadius: '12px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' },
  legendBox: (score) => ({ width: '16px', height: '16px', borderRadius: '4px', background: getScoreColor(score) }),

  implicationCard: {
    background: '#fff',
    padding: '32px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    borderTop: '6px solid #3b82f6',
    marginTop: '24px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  impHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  impTitle: { fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' },
  impBadge: (score) => ({
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 800,
    background: getScoreColor(score),
    color: score > 2 ? '#fff' : '#1e293b'
  }),
  impGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' },
  impSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  impLabel: { fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  impContent: { fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }
}

function getScoreColor(score) {
  const colors = [
    '#f1f5f9', // 0: absent
    '#fee2e2', // 1: declaratory
    '#fde68a', // 2: partial
    '#93c5fd', // 3: functional
    '#3b82f6', // 4: strong
    '#1e40af'  // 5: integrated
  ]
  return colors[score] || '#f1f5f9'
}

const SCORE_LABELS = [
  "0 Absent",
  "1 Declaratory Only",
  "2 Partial Basis",
  "3 Functional Basis",
  "4 Strong Basis",
  "5 Integrated Basis"
]

export default function GapMap({ data, country, setSelectedEvidence }) {
  const [selectedCell, setSelectedCell] = useState(null)
  const [filterPrinciple, setFilterPrinciple] = useState('')
  const [filterMechanism, setFilterMechanism] = useState('')
  const [filterReview, setFilterReview] = useState('all')

  if (!data) return null

  const {
    principle_definitions = { principles: [] },
    traceability_matrix = { matrix: [] }
  } = data

  const matrixData = traceability_matrix.matrix.filter(m => m.country.toLowerCase() === country.toLowerCase())

  const principles = principle_definitions.principles.filter(p =>
    !filterPrinciple || p.principle_name === filterPrinciple
  )

  const mechanisms = [...new Set(matrixData.map(m => m.mechanism_name))].sort().filter(m =>
    !filterMechanism || m === filterMechanism
  )

  const gridMatrix = useMemo(() => {
    const m = {}
    matrixData.forEach(row => {
      if (!m[row.principle_name]) m[row.principle_name] = {}
      m[row.principle_name][row.mechanism_name] = row
    })
    return m
  }, [matrixData])

  const selectedData = selectedCell ? gridMatrix[selectedCell.p]?.[selectedCell.m] : null

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '8px' }}>
          <Filter size={20} color="#64748b" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Matrix Filters:</span>
        </div>
        <select
          style={styles.select}
          value={filterPrinciple}
          onChange={(e) => setFilterPrinciple(e.target.value)}
        >
          <option value="">All Principles</option>
          {principle_definitions.principles.map(p => <option key={p.principle_name} value={p.principle_name}>{p.short_label}</option>)}
        </select>
        <select
          style={styles.select}
          value={filterMechanism}
          onChange={(e) => setFilterMechanism(e.target.value)}
        >
          <option value="">All Mechanisms</option>
          {[...new Set(matrixData.map(m => m.mechanism_name))].sort().map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
        </select>
        <select
          style={styles.select}
          value={filterReview}
          onChange={(e) => setFilterReview(e.target.value)}
        >
          <option value="all">All Records</option>
          <option value="review">Manual Review Only</option>
        </select>
      </div>

      <div style={styles.heatmapContainer}>
        <div style={{
          ...styles.grid,
          gridTemplateColumns: `200px repeat(${mechanisms.length}, 1fr)`
        }}>
          {/* Header Row */}
          <div />
          {mechanisms.map(m => (
            <div key={m} style={styles.headerLabel}>
              <div style={{ transform: 'rotate(-45deg)', whiteSpace: 'nowrap', textAlign: 'left', width: '24px', height: '100px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                {m.replace(/_/g, ' ')}
              </div>
            </div>
          ))}

          {/* Data Rows */}
          {principles.map(p => (
            <React.Fragment key={p.principle_name}>
              <div style={styles.rowLabel}>{p.short_label}</div>
              {mechanisms.map(m => {
                const row = gridMatrix[p.principle_name]?.[m]
                const score = row ? row.max_anchor_strength : 0
                const isReview = row?.manual_review_required === "true"

                if (filterReview === 'review' && !isReview) {
                  return <div key={m} style={{ background: '#f1f5f9', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.02)' }} />
                }

                const isSelected = selectedCell?.p === p.principle_name && selectedCell?.m === m
                return (
                  <div
                    key={m}
                    style={styles.cell(score, isSelected)}
                    onClick={() => setSelectedCell({ p: p.principle_name, m })}
                  >
                    {score}
                    {isReview && <div style={styles.reviewDot} />}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>

        <div style={styles.legend}>
          <div style={{ width: '100%', marginBottom: '12px', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            Anchoring Scale
          </div>
          {SCORE_LABELS.map((label, i) => (
            <div key={i} style={styles.legendItem}>
              <div style={styles.legendBox(i)} />
              {label}
            </div>
          ))}
          <div style={{ ...styles.legendItem, marginLeft: 'auto' }}>
            <div style={{ ...styles.reviewDot, position: 'static', marginRight: '8px' }} />
            Manual Review Required
          </div>
        </div>
      </div>

      {selectedData ? (
        <div style={styles.implicationCard}>
          <div style={styles.impHeader}>
            <div>
              <div style={styles.impLabel}>Diagnostic Cell</div>
              <div style={styles.impTitle}>
                {selectedData.principle_name.replace(/_/g, ' ')} × {selectedData.mechanism_name.replace(/_/g, ' ')}
              </div>
            </div>
            <div style={styles.impBadge(selectedData.max_anchor_strength)}>
              {SCORE_LABELS[selectedData.max_anchor_strength]}
            </div>
          </div>

          <div style={styles.impGrid}>
            <div style={styles.impSection}>
              <div style={styles.impLabel}><Target size={14} style={{ marginBottom: '-2px', marginRight: '4px' }} /> Analytical Finding</div>
              <div style={styles.impContent}>{selectedData.diagnostic_interpretation || "Functional basis for political participation detected in core statutes."}</div>
            </div>
            <div style={styles.impSection}>
              <div style={styles.impLabel}><Shield size={14} style={{ marginBottom: '-2px', marginRight: '4px' }} /> Preparedness Implication</div>
              <div style={styles.impContent}>
                {selectedData.max_anchor_strength < 3
                  ? "Weak or declaratory anchoring may lead to significant administrative discretion and lower institutional stability."
                  : "Strong anchoring provides a stable basis for rights-based implementation and judicial review."}
              </div>
            </div>
            <div style={styles.impSection}>
              <div style={styles.impLabel}><CheckCircle size={14} style={{ marginBottom: '-2px', marginRight: '4px' }} /> Operational Dimensions</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', background: selectedData.process_defined === 'true' ? '#dcfce7' : '#f1f5f9', color: selectedData.process_defined === 'true' ? '#166534' : '#64748b', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>Process</span>
                <span style={{ fontSize: '0.8rem', background: selectedData.actor_assigned === 'true' ? '#dcfce7' : '#f1f5f9', color: selectedData.actor_assigned === 'true' ? '#166534' : '#64748b', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>Actor</span>
                <span style={{ fontSize: '0.8rem', background: selectedData.remedy_defined === 'true' ? '#dcfce7' : '#f1f5f9', color: selectedData.remedy_defined === 'true' ? '#166534' : '#64748b', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>Remedy</span>
              </div>
            </div>
            <div style={styles.impSection}>
              <div style={styles.impLabel}><Info size={14} style={{ marginBottom: '-2px', marginRight: '4px' }} /> Evidence Metadata</div>
              <div style={styles.impContent}>
                Provisions matched: {selectedData.matched_provision_count || 0}<br/>
                Review status: {selectedData.manual_review_required === "true" ? "Priority Review" : "Standard"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setSelectedEvidence(selectedData)}
              style={{
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Examine Evidence Excerpts <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '24px', border: '2px dashed #e2e8f0', marginTop: '24px' }}>
          <Target size={48} color="#cbd5e1" style={{ marginBottom: '20px', margin: '0 auto' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Select a diagnostic cell to view analytical implications</div>
          <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>Compare Principle requirements against Mechanism anchoring.</div>
        </div>
      )}
    </div>
  )
}
