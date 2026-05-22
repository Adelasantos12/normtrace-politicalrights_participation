import React, { useState } from 'react'
import { countryMatches } from '../utils'
import { AlertCircle, FileText, ChevronRight, Filter } from 'lucide-react'

export default function GapMap({ data, country, setSelectedEvidence }) {
  if (!data) return null
  const {
    traceability_matrix = { matrix: [] },
    principle_explainer = { explainer: [] },
    mechanism_map = [],
    principle_definitions = { principles: [] }
  } = data

  const [filterScore, setFilterScore] = useState('all')
  const [selectedCell, setSelectedCell] = useState(null)

  const countryName = countryMatches(country, 'mexico') ? 'Mexico' : 'Costa Rica'
  const matrixArray = traceability_matrix.matrix || []
  const explainerArray = principle_explainer.explainer || principle_explainer || []

  const countryTraceability = matrixArray.filter(t => countryMatches(t.country, country))
  const countryExplainer = Array.isArray(explainerArray) ? explainerArray.filter(e => countryMatches(e.country, country)) : []

  const mechanisms = Array.from(new Set(countryTraceability.map(t => t.mechanism_id || t.mechanism))).sort()
  const principles = principle_definitions.principles || []

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return '#f1f5f9'
    if (score === 0) return '#f1f5f9'
    if (score < 2) return '#fee2e2' // Weak
    if (score < 3) return '#fef3c7' // Partial
    if (score < 4) return '#dcfce7' // Functional
    return '#bbf7d0' // Strong
  }

  const getCellData = (pId, mId) => {
    return countryTraceability.find(t => t.principle_id === pId && (t.mechanism_id === mId || t.mechanism === mId))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Anchoring / Gap Map</h2>
        <p style={{ color: '#64748b' }}>Heatmap of principle anchoring strength across political participation mechanisms.</p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <Filter size={16} color="#64748b" />
            <span style={{ color: '#64748b', fontWeight: 500 }}>Filter Score:</span>
            <select
              value={filterScore}
              onChange={e => setFilterScore(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
            >
              <option value="all">All Scores</option>
              <option value="0">0 - Absent</option>
              <option value="low">1-2 Weak/Partial</option>
              <option value="high">3-5 Functional+</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        {/* Heatmap Grid */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: '4px' }}>
            <thead>
              <tr>
                <th style={{ width: '200px' }}></th>
                {principles.map(p => (
                  <th key={p.principle_id} title={p.short_label || p.principle_name} style={{ width: '40px', height: '120px', verticalAlign: 'bottom', padding: '8px' }}>
                    <div style={{ transform: 'rotate(-45deg)', transformOrigin: 'left bottom', whiteSpace: 'nowrap', fontSize: '0.7rem', color: '#64748b', width: '30px' }}>
                      {p.short_label || p.principle_name.replace(/_/g, ' ')}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mechanisms.map(m => (
                <tr key={m}>
                  <td style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', padding: '4px 8px' }}>{m.replace(/_/g, ' ')}</td>
                  {principles.map(p => {
                    const cell = getCellData(p.principle_id, m)
                    const score = Number(cell?.max_anchor_strength || cell?.anchor_strength || 0)

                    // Filter logic
                    let visible = true
                    if (filterScore === '0') visible = score === 0
                    if (filterScore === 'low') visible = score > 0 && score < 3
                    if (filterScore === 'high') visible = score >= 3

                    return (
                      <td
                        key={p.principle_id}
                        onClick={() => setSelectedCell(cell)}
                        style={{
                          width: '40px',
                          height: '40px',
                          background: getScoreColor(score),
                          opacity: visible ? 1 : 0.2,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: score > 3 ? '#166534' : '#991b1b',
                          border: selectedCell === cell ? '2px solid #2563eb' : 'none'
                        }}
                      >
                        {score > 0 ? score.toFixed(0) : ''}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          {selectedCell ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Selected Matrix Cell</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{(selectedCell.mechanism_id || selectedCell.mechanism).replace(/_/g, ' ')}</h3>
                <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>{selectedCell.principle_id}</div>
              </div>

              <div style={{ background: getScoreColor(selectedCell.max_anchor_strength || selectedCell.anchor_strength), padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>DIAGNOSTIC SCORE: {Number(selectedCell.max_anchor_strength || selectedCell.anchor_strength || 0).toFixed(1)}</div>
                <div style={{ fontSize: '0.9rem', color: '#14532d', fontWeight: 600 }}>{selectedCell.score_label || selectedCell.anchor_label || 'Status Mapped'}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <AlertCircle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>Implication</div>
                    <p style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '2px' }}>
                      {countryExplainer.find(e => e.principle_id === selectedCell.principle_id && (e.mechanism_id === selectedCell.mechanism_id || e.mechanism === selectedCell.mechanism))?.plain_language_interpretation || 'General gap detected.'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <FileText size={18} color="#64748b" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Evidence</div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                      Diagnostic evidence shows {Number(selectedCell.max_anchor_strength || selectedCell.anchor_strength) < 3 ? 'declaratory' : 'operational'} anchoring in {selectedCell.matched_provision_count || selectedCell.source_count || 0} provisions.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvidence({ ...selectedCell, type: 'cell' })}
                style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                View Full Evidence <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <div style={{ marginBottom: '12px' }}><FileText size={48} color="#e2e8f0" style={{ margin: '0 auto' }} /></div>
              <p>Select a cell in the heatmap to view detailed diagnostic implications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
