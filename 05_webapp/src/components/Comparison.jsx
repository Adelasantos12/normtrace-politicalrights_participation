import React from 'react'
import { Scale, Target, AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react'
import { getScoreColor, getScoreLabel } from '../utils'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  headerCard: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  comparisonGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '24px'
  }),
  countryCard: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' },
  principleRow: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 60px 60px' : '1fr 100px 100px',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  }),
  scoreBadge: (score, isMobile) => ({
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: isMobile ? '0.65rem' : '0.75rem',
    fontWeight: 700,
    background: getScoreColor(score),
    color: score > 3 ? '#065f46' : '#92400e',
    textAlign: 'center'
  })
}

export default function Comparison({ data, isMobile }) {
  if (!data) return null

  const {
    principle_definitions = { principles: [] },
    principle_summary_by_country = { principle_summary: [] }
  } = data

  const principles = principle_definitions.principles || []
  const summaryArray = principle_summary_by_country.principle_summary || []

  const getScore = (country, pId) => {
    const summary = summaryArray.find(s => s.principle_id === pId)
    if (!summary) return 0
    return parseFloat(country === 'Mexico' ? summary.mexico_avg_score : summary.costa_rica_avg_score)
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Scale size={24} color="#0ea5e9" />
          <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Country Comparison</h2>
        </div>
        <p style={{ color: '#64748b', margin: 0, maxWidth: '800px', lineHeight: '1.5', fontSize: isMobile ? '0.85rem' : '1rem' }}>
          Comparative diagnostic contrast by principle. Side-by-side view of Mexico and Costa Rica scores.
        </p>
      </div>

      <div style={{ background: '#fff', padding: isMobile ? '12px' : '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 60px 60px' : '1fr 100px 100px', gap: '12px', padding: '0 12px 12px 12px', borderBottom: '2px solid #f1f5f9', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          <span>Principle</span>
          <span style={{ textAlign: 'center' }}>MEX</span>
          <span style={{ textAlign: 'center' }}>CRC</span>
        </div>
        {principles.map(p => {
          const scoreMX = getScore('Mexico', p.principle_id)
          const scoreCR = getScore('Costa Rica', p.principle_id)
          return (
            <div key={p.principle_id} style={styles.principleRow(isMobile)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <Target size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'nowrap' : 'normal' }}>
                  {p.principle_name.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={styles.scoreBadge(scoreMX, isMobile)}>{scoreMX.toFixed(1)}</div>
              <div style={styles.scoreBadge(scoreCR, isMobile)}>{scoreCR.toFixed(1)}</div>
            </div>
          )
        })}
      </div>

      <div style={styles.comparisonGrid(isMobile)}>
        <div style={styles.countryCard}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
            <ArrowRight size={18} color="#0ea5e9" /> Mexico
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
            Federal electoral focus with strong statutory anchoring.
          </p>
        </div>
        <div style={styles.countryCard}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
            <ArrowRight size={18} color="#0ea5e9" /> Costa Rica
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
            High diagnostic strength in direct participatory mechanisms.
          </p>
        </div>
      </div>
    </div>
  )
}
