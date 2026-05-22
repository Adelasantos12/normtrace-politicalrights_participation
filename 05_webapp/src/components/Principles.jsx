import React from 'react'
import { countryMatches } from '../utils'
import { ShieldCheck, Info, ExternalLink } from 'lucide-react'

export default function PrinciplesView({ data, country, setSelectedEvidence }) {
  if (!data) return null
  const {
    principle_definitions = { principles: [] },
    principle_explainer = { explainer: [] },
    traceability_matrix = { matrix: [] }
  } = data

  const countryName = countryMatches(country, 'mexico') ? 'Mexico' : 'Costa Rica'
  const matrixArray = traceability_matrix.matrix || []
  const explainerArray = principle_explainer.explainer || principle_explainer || []

  const countryTraceability = matrixArray.filter(t => countryMatches(t.country, country))
  const countryExplainer = Array.isArray(explainerArray) ? explainerArray.filter(e => countryMatches(e.country, country)) : []
  const principles = principle_definitions.principles || []

  const getScoreColor = (score) => {
    if (score === 0) return '#f1f5f9'
    if (score < 2) return '#fee2e2'
    if (score < 3) return '#fef3c7'
    if (score < 4) return '#dcfce7'
    return '#bbf7d0'
  }

  const getScoreLabel = (score) => {
    const labels = ['Absent', 'Declaratory', 'Partial', 'Functional', 'Strong', 'Integrated']
    return labels[Math.floor(score)] || 'Unknown'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Principles & Anchoring</h2>
        <p style={{ color: '#64748b' }}>Diagnostic tracing of 12 core principles across {countryName}'s legal framework.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
        {principles.map((prin, i) => {
          const explainer = countryExplainer.find(e => e.principle_id === prin.principle_id)
          const principleScores = countryTraceability.filter(t => t.principle_id === prin.principle_id)
          const avgScore = principleScores.reduce((acc, curr) => acc + Number(curr.max_anchor_strength || curr.anchor_strength || 0), 0) / (principleScores.length || 1)

          return (
            <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px' }}>
                    <ShieldCheck size={20} color="#2563eb" />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{prin.short_label || prin.principle_name.replace(/_/g, ' ')}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{prin.principle_id}</div>
                  </div>
                </div>
                <div style={{ background: getScoreColor(avgScore), padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
                  {avgScore.toFixed(1)} - {getScoreLabel(avgScore)}
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>{prin.description}</p>

              {explainer && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>WHY IT MATTERS</div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>{explainer.plain_language_interpretation || explainer.preparedness_implication}</div>
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {explainer?.manual_review_required === 'true' ? <span style={{ color: '#d97706' }}>⚠️ Manual review flag</span> : 'Automated diagnostic'}
                </div>
                <button
                  onClick={() => setSelectedEvidence({ principle_id: prin.principle_id, country, type: 'principle' })}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  View Evidence <ExternalLink size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
