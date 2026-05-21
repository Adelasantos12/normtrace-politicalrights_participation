import React, { useState, useMemo } from 'react'
import { Filter, Info, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  controls: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    flexWrap: 'wrap'
  },
  select: { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.875rem' },
  heatmapContainer: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflowX: 'auto'
  },
  grid: {
    display: 'grid',
    gap: '4px',
    minWidth: '800px'
  },
  cell: (score, isSelected) => ({
    width: '100%',
    aspectRatio: '1',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: isSelected ? '2px solid #1e293b' : '1px solid transparent',
    background: getScoreColor(score),
    color: score > 2 ? '#fff' : '#1e293b'
  }),
  headerLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#64748b',
    textAlign: 'center',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1.2
  },
  rowLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#475569',
    textAlign: 'right',
    paddingRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  legend: { display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' },
  legendBox: (score) => ({ width: '12px', height: '12px', borderRadius: '2px', background: getScoreColor(score) }),

  implicationCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    marginTop: '24px'
  },
  impHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  impTitle: { fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' },
  impBadge: (score) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: 700,
    background: getScoreColor(score),
    color: score > 2 ? '#fff' : '#1e293b'
  }),
  impGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  impSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  impLabel: { fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' },
  impContent: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }
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
  "1 Declaratory",
  "2 Partial Basis",
  "3 Functional Basis",
  "4 Strong Basis",
  "5 Integrated Basis"
]

export default function GapMap({ data, country, setSelectedEvidence }) {
  const [selectedCell, setSelectedCell] = useState(null)
  const [filterPrinciple, setFilterPrinciple] = useState('')
  const [filterMechanism, setFilterMechanism] = useState('')

  if (!data) return null

  const {
    principle_definitions = { principles: [] },
    mechanism_map = [],
    traceability_matrix = { matrix: [] }
  } = data

  const matrixData = traceability_matrix.matrix.filter(m => m.country.toLowerCase() === country.toLowerCase())

  const principles = principle_definitions.principles
  const mechanisms = [...new Set(matrixData.map(m => m.mechanism_name))].sort()

  const gridMatrix = useMemo(() => {
    const m = {}
    matrixData.forEach(row => {
      if (!m[row.principle_name]) m[row.principle_name] = {}
      m[row.principle_name][row.mechanism_name] = row
    })
    return m
  }, [matrixData])

  const getImplication = (score, principleName) => {
    if (score === 0) return "The mechanism is not detected in the current corpus; this may reflect genuine absence, vocabulary mismatch, or missing source coverage."
    if (score === 3) return "The mechanism has functional legal basis but lacks specific evidence for one or more operational dimensions (e.g. procedures or remedies)."
    if (score === 4) return "Strong anchoring is present, but the evidence does not fully show integrated coverage across all operational dimensions."
    if (principleName === 'accessibility_and_reasonable_accommodation' && score < 5) {
      return "Generic access language detected. Note: This does not necessarily satisfy CRPD Article 29 specificity requirements."
    }
    return "Legal preparedness level determined by statutory anchoring and operational dimensions detected."
  }

  const selectedData = selectedCell ? gridMatrix[selectedCell.p]?.[selectedCell.m] : null

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="#64748b" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filters:</span>
        </div>
        <select
          style={styles.select}
          value={filterPrinciple}
          onChange={(e) => setFilterPrinciple(e.target.value)}
        >
          <option value="">All Principles</option>
          {principles.map(p => <option key={p.principle_name} value={p.principle_name}>{p.short_label}</option>)}
        </select>
        <select
          style={styles.select}
          value={filterMechanism}
          onChange={(e) => setFilterMechanism(e.target.value)}
        >
          <option value="">All Mechanisms</option>
          {mechanisms.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div style={styles.heatmapContainer}>
        <div style={{
          ...styles.grid,
          gridTemplateColumns: `180px repeat(${mechanisms.length}, 1fr)`
        }}>
          {/* Header Row */}
          <div />
          {mechanisms.map(m => (
            <div key={m} style={styles.headerLabel}>
              <div style={{ transform: 'rotate(-45deg)', whiteSpace: 'nowrap', width: '0' }}>
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
                const isSelected = selectedCell?.p === p.principle_name && selectedCell?.m === m
                return (
                  <div
                    key={m}
                    style={styles.cell(score, isSelected)}
                    onClick={() => setSelectedCell({ p: p.principle_name, m })}
                  >
                    {score}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>

        <div style={styles.legend}>
          {SCORE_LABELS.map((label, i) => (
            <div key={i} style={styles.legendItem}>
              <div style={styles.legendBox(i)} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {selectedData ? (
        <div style={styles.implicationCard}>
          <div style={styles.impHeader}>
            <div style={styles.impTitle}>
              {selectedData.principle_name.replace(/_/g, ' ')} × {selectedData.mechanism_name.replace(/_/g, ' ')}
            </div>
            <div style={styles.impBadge(selectedData.max_anchor_strength)}>
              Score {selectedData.max_anchor_strength}: {SCORE_LABELS[selectedData.max_anchor_strength]}
            </div>
          </div>

          <div style={styles.impGrid}>
            <div style={styles.impSection}>
              <div style={styles.impLabel}>Diagnostic Interpretation</div>
              <div style={styles.impContent}>{getImplication(selectedData.max_anchor_strength, selectedData.principle_name)}</div>
            </div>
            <div style={styles.impSection}>
              <div style={styles.impLabel}>Legal Preparedness Implication</div>
              <div style={styles.impContent}>
                {selectedData.max_anchor_strength < 3
                  ? "Weak anchoring may lead to administrative discretion and lack of procedural certainty."
                  : "Functional anchoring provides a basis for rights-based implementation, though operational gaps may exist."}
              </div>
            </div>
            <div style={styles.impSection}>
              <div style={styles.impLabel}>Institutional Relationship</div>
              <div style={styles.impContent}>
                {selectedData.actor_assigned === "true"
                  ? "A duty-bearer is clearly identified in the legal framework."
                  : "No specific actor is explicitly assigned responsibility for this mechanism-principle intersection."}
              </div>
            </div>
            <div style={styles.impSection}>
              <div style={styles.impLabel}>Evidence Summary</div>
              <div style={styles.impContent}>
                Detected {selectedData.matched_provision_count} provisions.
                Process defined: {selectedData.process_defined}.
                Remedy defined: {selectedData.remedy_defined}.
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setSelectedEvidence({ type: 'gap', ...selectedData })}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              View Detailed Evidence <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          Select a cell in the heatmap to view implications and evidence.
        </div>
      )}
    </div>
  )
}
