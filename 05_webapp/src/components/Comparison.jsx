import React from 'react'
import { Columns, ArrowRight, Shield, AlertTriangle, Target, CheckCircle } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '32px' },
  header: { background: '#0f172a', color: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '12px' },
  card: { background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  countryTitle: { fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.025em' },
  principleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f1f5f9' },
  principleName: { fontSize: '0.95rem', fontWeight: 700, color: '#334155' },
  scoreBadge: (score) => ({
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 800,
    background: score > 4 ? '#dcfce7' : score > 3 ? '#eff6ff' : '#fff7ed',
    color: score > 4 ? '#166534' : score > 3 ? '#1e40af' : '#9a3412',
    minWidth: '50px',
    textAlign: 'center'
  }),
  heatmap: { display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: '10px', background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' },
  heatCell: (score) => ({
    height: '48px',
    borderRadius: '10px',
    background: getScoreColor(Math.round(score)),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 800,
    color: score > 2 ? '#fff' : '#1e293b',
    border: '1px solid rgba(0,0,0,0.05)'
  }),
  labelCell: { fontSize: '0.85rem', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }
}

function getScoreColor(score) {
  const colors = ['#f1f5f9', '#fee2e2', '#fde68a', '#93c5fd', '#3b82f6', '#1e40af']
  return colors[score] || '#f1f5f9'
}

export default function Comparison({ data }) {
  if (!data) return null

  const {
    principle_definitions = { principles: [] },
    traceability_matrix = { matrix: [] }
  } = data

  const getAvgScore = (countryName, principleName) => {
    const rows = traceability_matrix.matrix.filter(m =>
      m.country.toLowerCase() === countryName.toLowerCase() &&
      m.principle_name === principleName
    )
    if (rows.length === 0) return 0
    return rows.reduce((a, b) => a + (b.max_anchor_strength || 0), 0) / rows.length
  }

  const mexData = principle_definitions.principles.map(p => ({
    name: p.short_label,
    score: getAvgScore('mexico', p.principle_name)
  }))

  const crcData = principle_definitions.principles.map(p => ({
    name: p.short_label,
    score: getAvgScore('costa_rica', p.principle_name)
  }))

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Columns size={32} color="#38bdf8" />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            NormTrace Comparative Layer
          </span>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.025em' }}>Comparative Diagnostic Contrast</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '800px', lineHeight: 1.6 }}>
          Side-by-side diagnostic contrast of principle anchoring. This framework identifies institutional variations in legal preparedness, not a competitive ranking of performance.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.countryTitle}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }} />
            Mexico Pilot
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
            Diagnostic mapping focused on the Federal Constitution (CPEUM) and General Laws.
          </div>
          <div style={{ marginTop: '12px' }}>
            {mexData.map((p, i) => (
              <div key={i} style={styles.principleRow}>
                <span style={styles.principleName}>{p.name}</span>
                <span style={styles.scoreBadge(p.score)}>{p.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.countryTitle}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
            Costa Rica Pilot
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
            Diagnostic mapping focused on the 1949 Constitution and specialized TSE jurisdiction.
          </div>
          <div style={{ marginTop: '12px' }}>
            {crcData.map((p, i) => (
              <div key={i} style={styles.principleRow}>
                <span style={styles.principleName}>{p.name}</span>
                <span style={styles.scoreBadge(p.score)}>{p.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Target size={28} color="#3b82f6" />
          Comparative Heatmap Contrast
        </h3>
        <div style={styles.heatmap}>
          <div />
          <div style={{ ...styles.labelCell, justifyContent: 'center', fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>Mexico</div>
          <div style={{ ...styles.labelCell, justifyContent: 'center', fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>Costa Rica</div>

          {principle_definitions.principles.map((p, i) => {
            const mScore = getAvgScore('mexico', p.principle_name)
            const cScore = getAvgScore('costa_rica', p.principle_name)
            return (
              <React.Fragment key={i}>
                <div style={styles.labelCell}>{p.short_label}</div>
                <div style={styles.heatCell(mScore)}>{mScore.toFixed(1)}</div>
                <div style={styles.heatCell(cScore)}>{cScore.toFixed(1)}</div>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div style={{ ...styles.card, background: '#f8fafc', borderLeft: '8px solid #f59e0b' }}>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#92400e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={24} />
          Comparative Diagnostic Caveats
        </div>
        <ul style={{ fontSize: '1rem', color: '#475569', margin: 0, paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px', lineHeight: 1.6 }}>
          <li><strong>Mexico:</strong> Statutory complexity is high, but anchoring strength is often moderated by administrative dependencies and corpus-level manual review flags.</li>
          <li><strong>Costa Rica:</strong> Unitary structure and the specialized constitutional rank of the Electoral Tribunal (TSE) result in more integrated anchoring for several principles.</li>
          <li><strong>Shared Patterns:</strong> Both countries exhibit diagnostic gaps in "Territorial Implementation" and "Administrative Capacity," suggesting cross-pilot challenges in operationalising participation at multilevel scales.</li>
        </ul>
      </div>
    </div>
  )
}
