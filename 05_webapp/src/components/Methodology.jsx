import React from 'react'
import { Info, HelpCircle, Scale, AlertTriangle, Network, ShieldCheck, Bookmark, Database } from 'lucide-react'

const styles = {
  container: (isMobile) => ({ display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '32px', maxWidth: '900px' }),
  section: { display: 'flex', flexDirection: 'column', gap: '16px' },
  h2: (isMobile) => ({ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }),
  card: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' },
  p: (isMobile) => ({ fontSize: isMobile ? '0.9rem' : '1rem', color: '#475569', lineHeight: '1.6', margin: 0 }),
  scoreBox: { display: 'grid', gridTemplateColumns: '60px 1fr', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' },
  scoreNum: { fontSize: '1.25rem', fontWeight: 800, color: '#0ea5e9', textAlign: 'center' }
}

export default function Methodology({ isMobile }) {
  return (
    <div style={styles.container(isMobile)}>
      <header>
        <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Methodology</h1>
        <p style={{ ...styles.p(isMobile), fontSize: isMobile ? '1rem' : '1.1rem', borderLeft: '4px solid #38bdf8', paddingLeft: '20px' }}>
          NormTrace Political Rights maps <strong>diagnostic legal preparedness</strong>.
        </p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.h2(isMobile)}><Scale size={24} color="#0ea5e9" /> Diagnostic vs. Compliance</h2>
        <div style={styles.card}>
          <p style={styles.p(isMobile)}>
            This webapp <strong>does not assess legal compliance</strong>. It evaluates whether the necessary legal architecture exists to support a given principle.
          </p>
          <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', display: 'flex', gap: '12px' }}>
            <AlertTriangle size={20} color="#991b1b" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.8rem', color: '#991b1b', margin: 0 }}>
              <strong>Disclaimer:</strong> Pilot diagnostic mapping based on statutory text. Not real-world behavior.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2(isMobile)}><ShieldCheck size={24} color="#10b981" /> Scoring Matrix (0–5)</h2>
        <div style={styles.card}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ScoreRow num="0" label="Absent" desc="No mention detected." />
            <ScoreRow num="1" label="Declaratory" desc="Mentioned but lacks operational procedures." />
            <ScoreRow num="2" label="Partial Basis" desc="Lacks statutory anchoring; relies on administrative instruments." />
            <ScoreRow num="3" label="Functional Basis" desc="Statutory basis and procedures, but lacks specific safeguards." />
            <ScoreRow num="4" label="Strong Basis" desc="Comprehensive statutory coverage." />
            <ScoreRow num="5" label="Integrated Basis" desc="All 5 core dimensions present." />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2(isMobile)}><Network size={24} color="#8b5cf6" /> Institutional Network</h2>
        <div style={styles.card}>
          <p style={styles.p(isMobile)}>
            Maps <strong>legally encoded relationships</strong>. An "edge" exists only if mandated by a legal instrument.
          </p>
        </div>
      </section>
    </div>
  )
}

function ScoreRow({ num, label, desc }) {
  return (
    <div style={styles.scoreBox}>
      <div style={styles.scoreNum}>{num}</div>
      <div>
        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{label}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{desc}</div>
      </div>
    </div>
  )
}
