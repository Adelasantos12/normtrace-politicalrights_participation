import React from 'react'
import { ShieldCheck, Info, ExternalLink, Target, Bookmark, Layers } from 'lucide-react'
import { getScoreColor, getScoreLabel } from '../utils'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  headerCard: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))', gap: '20px' },
  card: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  scoreBar: { height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' },
  scoreFill: (score) => ({ height: '100%', width: `${(score / 5) * 100}%`, background: getScoreColor(score) }),
  badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' },
  stat: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }
}

export default function Principles({ data, country, openEvidence }) {
  if (!data) return null

  const {
    principle_definitions = { principles: [] },
    principle_summary_by_country = { principle_summary: [] },
    traceability_matrix = { matrix: [] }
  } = data

  const countryName = country === 'Mexico' ? 'Mexico' : 'Costa Rica'
  const principles = principle_definitions.principles || []
  const summaryArray = principle_summary_by_country.principle_summary || []
  const matrix = traceability_matrix.matrix || []

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Principles & Anchoring</h2>
        <p style={{ color: '#64748b', marginTop: '8px', maxWidth: '800px', lineHeight: '1.5' }}>
          NormTrace Political Rights evaluates legal preparedness across 12 core principles. Each principle is traced back to specific domestic instruments to determine its anchoring strength.
        </p>
      </div>

      <div style={styles.grid}>
        {principles.map((prin, i) => {
          const summary = summaryArray.find(s => s.principle_id === prin.principle_id)
          const score = summary ? parseFloat(country === 'Mexico' ? summary.mexico_avg_score : summary.costa_rica_avg_score) : 0
          const mechanismsCount = matrix.filter(m => m.country === countryName && m.principle_id === prin.principle_id).length

          return (
            <div key={i} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <div style={{ padding: '10px', background: '#f0f9ff', borderRadius: '10px', color: '#0ea5e9' }}>
                    <Target size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{prin.principle_id}</div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>{prin.principle_name.replace(/_/g, ' ')}</h3>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                {prin.description}
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={styles.stat}>
                  <span style={{ fontWeight: 600, color: '#64748b' }}>Diagnostic Score</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{score.toFixed(1)} / 5.0</span>
                </div>
                <div style={styles.scoreBar}>
                  <div style={styles.scoreFill(score)} />
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: 700, color: getScoreColor(score), display: 'flex', justifyContent: 'space-between' }}>
                  <span>{getScoreLabel(score)}</span>
                  <span>{mechanismsCount} Mechanisms Mapped</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Why it matters</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                  {prin.legal_preparedness_relevance || prin.legal_preparedness_question || 'Crucial for ensuring the legal basis and operational functionality of political participation mechanisms.'}
                </p>
              </div>

              <button
                style={{ ...styles.stat, width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#334155' }}
                onClick={() => openEvidence({ type: 'principle', data: prin, title: prin.principle_name.replace(/_/g, ' ') })}
              >
                View Legal Evidence <ExternalLink size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
