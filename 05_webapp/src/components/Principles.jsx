import React from 'react'
import { Shield, CheckCircle, Info, ExternalLink } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px'
  },
  card: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative',
    overflow: 'hidden'
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: '#3b82f6'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' },
  id: { fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px' },
  description: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 },
  subTitle: { fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  question: { fontSize: '0.875rem', color: '#1e3a8a', fontStyle: 'italic', background: '#eff6ff', padding: '12px', borderRadius: '8px' },
  meta: { display: 'flex', flexDirection: 'column', gap: '8px' },
  dimensionList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  badge: (bg, fg) => ({
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 500,
    background: bg,
    color: fg,
  }),
}

export default function Principles({ data, country, setSelectedEvidence }) {
  if (!data) return null

  const { principle_definitions = { principles: [] }, traceability_matrix = { matrix: [] } } = data

  const getScoreDistribution = (principleName) => {
    const scores = traceability_matrix.matrix
      .filter(m => m.country.toLowerCase() === country.toLowerCase() && m.principle_name === principleName)
      .map(m => m.max_anchor_strength)

    if (scores.length === 0) return "No data"
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    return `Avg Score: ${avg.toFixed(1)} / 5`
  }

  return (
    <div style={styles.container}>
      <div style={{ background: '#1e293b', color: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Normative Principles</h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.8, maxWidth: '800px' }}>
          The NormTrace framework evaluates legal preparedness against 12 core international principles for political participation.
          Each principle is operationalised through specific diagnostic questions and dimensions.
        </p>
      </div>

      <div style={styles.grid}>
        {principle_definitions.principles.map((p, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.cardAccent} />
            <div style={styles.header}>
              <div style={styles.title}>{p.short_label || p.principle_name.replace(/_/g, ' ')}</div>
              <div style={styles.id}>{p.principle_id}</div>
            </div>

            <div style={styles.description}>{p.description}</div>

            <div>
              <div style={styles.subTitle}>Diagnostic Question</div>
              <div style={styles.question}>“{p.legal_preparedness_question}”</div>
            </div>

            <div style={styles.meta}>
              <div style={styles.subTitle}>Operational Dimensions</div>
              <div style={styles.dimensionList}>
                {p.operational_dimensions.split('|').map((dim, dIdx) => (
                  <span key={dIdx} style={styles.badge('#f1f5f9', '#475569')}>{dim.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
                {getScoreDistribution(p.principle_name)}
              </div>
              <button
                onClick={() => setSelectedEvidence({ type: 'principle', ...p })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                View evidence <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
