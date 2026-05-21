import React from 'react'
import { Info, Shield, Scale, AlertTriangle, List } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '32px' },
  section: { display: 'flex', flexDirection: 'column', gap: '16px' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' },
  card: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  h3: { fontSize: '1.125rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '8px' },
  text: { fontSize: '0.9375rem', color: '#475569', lineHeight: 1.6 },
  scoreList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  scoreItem: { display: 'flex', gap: '16px' },
  scoreBox: (score) => ({
    minWidth: '24px',
    height: '24px',
    borderRadius: '4px',
    background: getScoreColor(score),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: score > 2 ? '#fff' : '#1e293b'
  })
}

function getScoreColor(score) {
  const colors = ['#f1f5f9', '#fee2e2', '#fde68a', '#93c5fd', '#3b82f6', '#1e40af']
  return colors[score] || '#f1f5f9'
}

export default function Methodology() {
  return (
    <div style={styles.container}>
      <section style={styles.section}>
        <h2 style={styles.title}>Core Methodological Framing</h2>
        <div style={styles.card}>
          <div style={{ ...styles.text, fontWeight: 500, fontSize: '1rem', color: '#1e3a8a', marginBottom: '16px' }}>
            NormTrace Political Rights maps diagnostic legal preparedness. It evaluates whether political participation mechanisms
            are legally anchored and operationalised through actors, procedures, timelines, remedies, safeguards,
            transparency/accountability and functional institutional relationships.
          </div>
          <div style={styles.grid}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700, marginBottom: '8px', color: '#475569' }}>What it IS</div>
              <ul style={{ ...styles.text, paddingLeft: '20px', margin: 0 }}>
                <li>Diagnostic legal preparedness mapping</li>
                <li>Statutory anchoring evaluation</li>
                <li>Functional institutional network analysis</li>
                <li>Evidence-based gap detection</li>
              </ul>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700, marginBottom: '8px', color: '#475569' }}>What it IS NOT</div>
              <ul style={{ ...styles.text, paddingLeft: '20px', margin: 0 }}>
                <li>Legal advice or opinion</li>
                <li>Compliance assessment</li>
                <li>Country ranking or performance index</li>
                <li>Real-world administrative behavior audit</li>
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
              { s: 0, l: "Absent", d: "The mechanism is not detected in the current legal corpus with functional anchoring." },
              { s: 1, l: "Declaratory Only", d: "Recognition of the right or mechanism exists in a non-binding or purely aspirational provision." },
              { s: 2, l: "Partial Basis", d: "Explicit mention in binding law but lacks clear operational dimensions (actors, procedures)." },
              { s: 3, l: "Functional Basis", d: "Binding statutory basis with at least one core operational dimension (e.g. procedure or actor) defined." },
              { s: 4, l: "Strong Basis", d: "High-rank statutory anchoring with multiple operational dimensions and remedies identified." },
              { s: 5, l: "Integrated Basis", d: "Complete statutory and regulatory coverage across all 7 operational dimensions defined in the framework." }
            ].map(item => (
              <div key={item.s} style={styles.scoreItem}>
                <div style={styles.scoreBox(item.s)}>{item.s}</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.l}</div>
                  <div style={styles.text}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.title}>Key Concepts</h2>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.h3}>Administrative Dependence</h3>
            <div style={styles.text}>
              Measures the extent to which a mechanism's operation depends on flexible administrative instruments (regulations, guidelines)
              rather than primary statutes. High dependence can indicate lower legal stability.
            </div>
          </div>
          <div style={styles.card}>
            <h3 style={styles.h3}>Interpretive Support</h3>
            <div style={styles.text}>
              Jurisprudence and international standards provide the "interpretive layer."
              They guide the application of the law but do not replace the requirement for domestic statutory anchoring.
            </div>
          </div>
          <div style={styles.card}>
            <h3 style={styles.h3}>Manual Review Flags</h3>
            <div style={styles.text}>
              Automated mapping identifies potential gaps or areas where the corpus might be incomplete.
              These flags prioritize expert legal review for specific mechanisms or principles.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
