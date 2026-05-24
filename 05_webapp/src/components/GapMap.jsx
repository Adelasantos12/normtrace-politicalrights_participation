import React, { useState } from 'react'
import { Info, AlertTriangle, ExternalLink, Filter, Target, Settings, ChevronRight, X } from 'lucide-react'
import { getScoreColor, getScoreLabel, countryMatches } from '../utils'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  controls: { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' },
  heatmapContainer: { overflowX: 'auto', background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  table: { borderCollapse: 'separate', borderSpacing: '4px' },
  cell: (score, isSelected) => ({
    width: '40px',
    height: '40px',
    background: getScoreColor(score),
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 800,
    color: score > 3 ? '#065f46' : score > 0 ? '#92400e' : '#64748b',
    border: isSelected ? '2px solid #0ea5e9' : '1px solid rgba(0,0,0,0.05)',
    transition: 'all 0.1s'
  }),
  headerCell: { writingMode: 'vertical-rl', transform: 'rotate(180deg)', padding: '12px 8px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textAlign: 'left', minHeight: '150px' },
  rowLabel: { padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', textAlign: 'right', whiteSpace: 'nowrap' },
  implicationCard: (isMobile) => ({
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: isMobile ? 'fixed' : 'sticky',
    top: isMobile ? 'auto' : '24px',
    bottom: isMobile ? '0' : 'auto',
    left: isMobile ? '0' : 'auto',
    right: isMobile ? '0' : 'auto',
    zIndex: isMobile ? '100' : 'auto',
    maxHeight: isMobile ? '70vh' : 'auto',
    overflowY: isMobile ? 'auto' : 'visible',
    boxShadow: isMobile ? '0 -10px 25px rgba(0,0,0,0.1)' : 'none',
    borderTopLeftRadius: isMobile ? '24px' : '12px',
    borderTopRightRadius: isMobile ? '24px' : '12px',
  }),
  badge: (score) => ({ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, background: getScoreColor(score), color: score > 3 ? '#065f46' : '#92400e', textTransform: 'uppercase' })
}

export default function GapMap({ data, country, openEvidence, isMobile }) {
  const [selectedCell, setSelectedCell] = useState(null)
  const [filterPrinciple, setFilterPrinciple] = useState('all')

  if (!data) return null

  const {
    principle_definitions = { principles: [] },
    mechanism_map = [],
    traceability_matrix = { matrix: [] },
    principle_explainer = { explainer: [] }
  } = data

  const countryName = country === 'Mexico' ? 'Mexico' : 'Costa Rica'
  const principles = principle_definitions.principles || []
  const mechanisms = mechanism_map.filter(m => m.country === countryName)
  const matrix = traceability_matrix.matrix || []
  const explainerArray = principle_explainer.explainer || []

  const getScore = (pId, mId) => {
    const entry = matrix.find(e => e.country === countryName && e.principle_id === pId && e.mechanism_id === mId)
    return entry ? parseFloat(entry.max_anchor_strength || entry.anchor_strength || 0) : 0
  }

  const currentExplainer = selectedCell ? explainerArray.find(e =>
    countryMatches(e.country, countryName) &&
    e.principle_id === selectedCell.pId &&
    e.mechanism_id === selectedCell.mId
  ) : null

  const filteredPrinciples = filterPrinciple === 'all' ? principles : principles.filter(p => p.principle_id === filterPrinciple)

  return (
    <div style={styles.container}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Anchoring / Gap Map</h2>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: isMobile ? '0.85rem' : '1rem' }}>
          Diagnostic heatmap crossing 12 principles against detected mechanisms. {isMobile ? 'Tap' : 'Click'} any cell to view specific implications.
        </p>
      </div>

      <div style={styles.controls}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
          <Filter size={18} color="#64748b" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Filter:</span>
          <select
            value={filterPrinciple}
            onChange={(e) => setFilterPrinciple(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
          >
            <option value="all">All Principles</option>
            {principles.map(p => <option key={p.principle_id} value={p.principle_id}>{p.principle_name.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 350px', gap: '24px', alignItems: 'start' }}>
        <div style={styles.heatmapContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th></th>
                {filteredPrinciples.map(p => (
                  <th key={p.principle_id} style={styles.headerCell}>{p.principle_name.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mechanisms.map(m => (
                <tr key={m.mechanism_id}>
                  <td style={styles.rowLabel}>{m.mechanism_name.replace(/_/g, ' ')}</td>
                  {filteredPrinciples.map(p => {
                    const score = getScore(p.principle_id, m.mechanism_name)
                    const isSelected = selectedCell?.pId === p.principle_id && selectedCell?.mId === m.mechanism_name
                    return (
                      <td key={p.principle_id}>
                        <div
                          style={styles.cell(score, isSelected)}
                          onClick={() => setSelectedCell({ pId: p.principle_id, pName: p.principle_name, mId: m.mechanism_name, mName: m.mechanism_name, score })}
                        >
                          {score}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedCell && (
          <div style={styles.implicationCard(isMobile)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={styles.badge(selectedCell.score)}>{getScoreLabel(selectedCell.score)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedCell.score}.0</div>
                {isMobile && <button onClick={() => setSelectedCell(null)} style={{ padding: '4px', background: '#f1f5f9', border: 'none', borderRadius: '4px' }}><X size={20} /></button>}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0ea5e9', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                <Target size={14} /> {selectedCell.pId}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{selectedCell.pName.replace(/_/g, ' ')}</h3>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                <Settings size={14} /> Mechanism
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#334155' }}>{selectedCell.mName.replace(/_/g, ' ')}</h4>
            </div>

            {currentExplainer ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <strong>Interpretation:</strong> {currentExplainer.plain_language_interpretation}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#b45309' }}>
                  <strong>Why not higher?</strong> {currentExplainer.why_not_higher}
                </div>
              </div>
            ) : (() => {
              const matrixEntry = matrix.find(e => e.country === countryName && e.principle_id === selectedCell.pId && e.mechanism_id === selectedCell.mId)
              return matrixEntry ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {matrixEntry.gap_type && matrixEntry.gap_type !== 'none' && (
                    <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2', fontSize: '0.82rem', color: '#991b1b' }}>
                      <strong>Gap Type:</strong> {matrixEntry.gap_type.replace(/_/g, ' ')}
                    </div>
                  )}
                  {matrixEntry.corpus_coverage_note && (
                    <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#475569' }}>
                      <strong>Corpus Coverage:</strong> {matrixEntry.corpus_coverage_note.replace(/_/g, ' ')}
                    </div>
                  )}
                  {matrixEntry.implementation_readiness_score !== undefined && (
                    <div style={{ padding: '10px 14px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #e0f2fe', fontSize: '0.82rem', color: '#0369a1' }}>
                      <strong>Implementation Readiness:</strong> {matrixEntry.implementation_readiness_score} / 5
                    </div>
                  )}
                  {matrixEntry.notes && (
                    <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.82rem', color: '#78350f' }}>
                      <strong>Notes:</strong> {matrixEntry.notes}
                    </div>
                  )}
                  {!matrixEntry.gap_type && !matrixEntry.corpus_coverage_note && !matrixEntry.notes && (
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                      No specific diagnostic explainer available for this cell.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                  No specific diagnostic explainer available for this cell.
                </div>
              )
            })()}

            <button
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => openEvidence({
                type: 'principle_mechanism',
                data: { principle_id: selectedCell.pId, mechanism_id: selectedCell.mId },
                title: `${selectedCell.pName.replace(/_/g, ' ')} / ${selectedCell.mName.replace(/_/g, ' ')}`
              })}
            >
              View Evidence <ExternalLink size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
