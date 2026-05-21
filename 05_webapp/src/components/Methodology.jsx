import React from 'react'
import { Info, Shield, Scale, AlertTriangle, List, CheckCircle, Database, FileX } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '32px' },
  section: { display: 'flex', flexDirection: 'column', gap: '20px' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', letterSpacing: '-0.025em' },
  card: { background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' },
  h3: { fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '12px' },
  text: { fontSize: '1rem', color: '#475569', lineHeight: 1.6 },
  scoreList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  scoreItem: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  scoreBox: (score) => ({
    minWidth: '32px',
    height: '32px',
    borderRadius: '8px',
    background: getScoreColor(score),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: 800,
    color: score > 2 ? '#fff' : '#1e293b',
    border: '1px solid rgba(0,0,0,0.05)'
  }),
  diagGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' },
  diagItem: (success) => ({
    padding: '12px 16px',
    borderRadius: '12px',
    background: success ? '#f0fdf4' : '#fff1f2',
    border: `1px solid ${success ? '#bbf7d0' : '#fecdd3'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.8rem'
  })
}

function getScoreColor(score) {
  const colors = ['#f1f5f9', '#fee2e2', '#fde68a', '#93c5fd', '#3b82f6', '#1e40af']
  return colors[score] || '#f1f5f9'
}

export default function Methodology({ data, loadStats }) {
  return (
    <div style={styles.container}>
      <section style={styles.section}>
        <h2 style={styles.title}>Core Methodological Framing</h2>
        <div style={styles.card}>
          <div style={{ ...styles.text, fontWeight: 600, fontSize: '1.1rem', color: '#1e3a8a', marginBottom: '24px', lineHeight: 1.5 }}>
            NormTrace Political Rights maps diagnostic legal preparedness for political participation. It evaluates whether mechanisms are legally anchored and operationalised through 7 core dimensions.
          </div>
          <div style={styles.grid}>
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, marginBottom: '12px', color: '#475569', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>What it IS</div>
              <ul style={{ ...styles.text, paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Diagnostic legal preparedness mapping</li>
                <li>Statutory and Constitutional anchoring audit</li>
                <li>Functional institutional network mapping</li>
                <li>Evidence-based structural gap detection</li>
              </ul>
            </div>
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, marginBottom: '12px', color: '#475569', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>What it IS NOT</div>
              <ul style={{ ...styles.text, paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Legal advice or individual opinion</li>
                <li>Performance or compliance assessment</li>
                <li>Political ranking of governments</li>
                <li>Observed behavior or implementation audit</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.title}>Scoring & Anchoring Scale</h2>
        <div style={styles.card}>
          <div style={styles.scoreList}>
            {[
              { s: 0, l: "Absent", d: "Mechanism or right not detected in the current legal corpus." },
              { s: 1, l: "Declaratory Only", d: "Purely aspirational or non-binding mention without specific obligations." },
              { s: 2, l: "Partial Basis", d: "Explicit mention in binding law but lacks clear operational dimensions (actors, procedures)." },
              { s: 3, l: "Functional Basis", d: "Binding statutory basis with at least one core operational dimension (e.g., procedure or actor) identified." },
              { s: 4, l: "Strong Basis", d: "High-rank statutory anchoring with multiple operational dimensions and remedies clearly defined." },
              { s: 5, l: "Integrated Basis", d: "Complete statutory and regulatory coverage across all operational dimensions defined in the framework." }
            ].map(item => (
              <div key={item.s} style={styles.scoreItem}>
                <div style={styles.scoreBox(item.s)}>{item.s}</div>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>{item.l}</div>
                  <div style={styles.text}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.title}>Pilot Diagnostic Panel</h2>
        <div style={styles.card}>
          <div style={{ ...styles.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="#3b82f6" />
            <span>Dataset loading status for the current session. All analysis is derived from these precomputed JSON layers.</span>
          </div>

          <div style={styles.diagGrid}>
            {loadStats && [...loadStats.loaded, ...loadStats.missing].map((url, i) => {
              const success = loadStats.loaded.includes(url)
              const name = url.split('/').pop()
              return (
                <div key={i} style={styles.diagItem(success)}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>{name}</div>
                  {success ? <CheckCircle size={16} color="#16a34a" /> : <FileX size={16} color="#dc2626" />}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
