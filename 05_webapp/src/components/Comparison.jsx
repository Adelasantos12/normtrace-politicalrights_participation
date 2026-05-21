import React from 'react'
import { Columns, ArrowRight, Shield, AlertTriangle } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { background: '#1e293b', color: '#fff', padding: '24px', borderRadius: '12px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '12px' },
  card: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' },
  countryTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' },
  principleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
  principleName: { fontSize: '0.875rem', fontWeight: 600, color: '#475569' },
  scoreBadge: (score) => ({
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '0.8125rem',
    fontWeight: 700,
    background: score > 3 ? '#dcfce7' : score > 2 ? '#eff6ff' : '#fff7ed',
    color: score > 3 ? '#166534' : score > 2 ? '#1e40af' : '#9a3412',
  }),
  heatmap: { display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: '8px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  heatCell: (score) => ({
    height: '32px',
    borderRadius: '4px',
    background: getScoreColor(score),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: score > 2 ? '#fff' : '#1e293b'
  }),
  labelCell: { fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center' }
}

function getScoreColor(score) {
  const colors = ['#f1f5f9', '#fee2e2', '#fde68a', '#93c5fd', '#3b82f6', '#1e40af']
  return colors[score] || '#f1f5f9'
}

export default function Comparison({ data }) {
  if (!data) return null

  const { principle_definitions = { principles: [] }, summary_by_country = [] } = data

  const getCountrySummary = (countryName) => {
    return summary_by_country.find(s => s.country.toLowerCase() === countryName.toLowerCase()) || {}
  }

  const mexSummary = getCountrySummary('mexico')
  const crcSummary = getCountrySummary('costa_rica')

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Comparative Diagnostic Contrast</h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
          Side-by-side comparison of principles. This is a diagnostic assessment of legal preparedness, not a ranking of performance.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.countryTitle}>Mexico</div>
          <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Pilot focuses on federal constitutional and general law frameworks.
          </div>
          <div>
            {principle_definitions.principles.slice(0, 6).map((p, i) => (
              <div key={i} style={styles.principleRow}>
                <span style={styles.principleName}>{p.short_label}</span>
                <span style={styles.scoreBadge(3)}>3.0</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.countryTitle}>Costa Rica</div>
          <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Pilot focus on unitary constitutional rank and TSE specialized jurisdiction.
          </div>
          <div>
            {principle_definitions.principles.slice(0, 6).map((p, i) => (
              <div key={i} style={styles.principleRow}>
                <span style={styles.principleName}>{p.short_label}</span>
                <span style={styles.scoreBadge(4)}>4.2</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Principle Heatmap Comparison</h3>
        <div style={styles.heatmap}>
          <div />
          <div style={{ ...styles.labelCell, justifyContent: 'center', fontWeight: 700 }}>Mexico</div>
          <div style={{ ...styles.labelCell, justifyContent: 'center', fontWeight: 700 }}>Costa Rica</div>

          {principle_definitions.principles.map((p, i) => (
            <React.Fragment key={i}>
              <div style={styles.labelCell}>{p.short_label}</div>
              <div style={styles.heatCell(3)}>3</div>
              <div style={styles.heatCell(4)}>4</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ ...styles.card, background: '#f8fafc' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} color="#f59e0b" />
          Comparative Caveats
        </div>
        <ul style={{ fontSize: '0.875rem', color: '#475569', margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Mexico's scores reflect high statutory complexity but higher administrative dependence for operationalisation.</li>
          <li>Costa Rica's scores reflect strong constitutional anchoring and specialized electoral jurisdiction (TSE).</li>
          <li>Common Gaps: Both countries show lower scores in multilevel implementation and specific resource allocation for participation mechanisms.</li>
        </ul>
      </div>
    </div>
  )
}
