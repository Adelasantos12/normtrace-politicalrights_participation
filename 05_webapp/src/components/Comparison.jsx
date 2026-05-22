import React from 'react'
import { countryMatches } from '../utils'
import { Columns, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ComparisonView({ data }) {
  if (!data) return null
  const {
    principle_definitions = { principles: [] },
    traceability_matrix = { matrix: [] },
    gap_comparison = []
  } = data

  const principles = principle_definitions.principles || []
  const matrixArray = traceability_matrix.matrix || []

  const getCountryStats = (cName) => {
    const cData = matrixArray.filter(t => countryMatches(t.country, cName))
    const avg = cData.reduce((acc, curr) => acc + (curr.max_anchor_strength || curr.anchor_strength || 0), 0) / (cData.length || 1)
    const reviews = cData.filter(t => t.manual_review_required === 'true').length
    return { avg, reviews, count: cData.length }
  }

  const mexStats = getCountryStats('mexico')
  const crcStats = getCountryStats('costa_rica')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Country Comparison</h2>
        <p style={{ color: '#64748b' }}>Comparative diagnostic contrast by principle (Mexico vs Costa Rica).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Mexico Summary */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🇲🇽</span> Mexico
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Avg Anchor Strength</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{mexStats.avg.toFixed(2)}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Manual Review Flags</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626' }}>{mexStats.reviews}</div>
            </div>
          </div>
        </div>

        {/* Costa Rica Summary */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🇨🇷</span> Costa Rica
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Avg Anchor Strength</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{crcStats.avg.toFixed(2)}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Manual Review Flags</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626' }}>{crcStats.reviews}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>Principle-Level Contrast</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Principle</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Mexico</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Diff</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Costa Rica</th>
            </tr>
          </thead>
          <tbody>
            {principles.map((prin, i) => {
              const mexData = matrixArray.filter(t => countryMatches(t.country, 'mexico') && t.principle_id === prin.principle_id)
              const mexScore = mexData.reduce((acc, curr) => acc + (curr.max_anchor_strength || curr.anchor_strength || 0), 0) / (mexData.length || 1)

              const crcData = matrixArray.filter(t => countryMatches(t.country, 'costa_rica') && t.principle_id === prin.principle_id)
              const crcScore = crcData.reduce((acc, curr) => acc + (curr.max_anchor_strength || curr.anchor_strength || 0), 0) / (crcData.length || 1)

              const diff = mexScore - crcScore

              return (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{prin.short_label || prin.principle_name.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prin.principle_id}</div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: mexScore >= 3 ? '#dcfce7' : '#fee2e2', fontWeight: 700 }}>{mexScore.toFixed(1)}</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: diff === 0 ? '#64748b' : (diff > 0 ? '#16a34a' : '#dc2626'), fontWeight: 600 }}>
                    {diff === 0 ? '=' : (diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1))}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: crcScore >= 3 ? '#dcfce7' : '#fee2e2', fontWeight: 700 }}>{crcScore.toFixed(1)}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
