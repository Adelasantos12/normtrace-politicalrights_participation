import React from 'react'
import { FileText, Book, Settings, Shield, Users, AlertTriangle, Share2, Info, ArrowRight, Target, CheckCircle, Database, Layers } from 'lucide-react'
import { countryMatches } from '../utils'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '32px' },
  header: { marginBottom: '8px' },
  summaryText: { fontSize: '1.1rem', color: '#475569', borderLeft: '4px solid #38bdf8', paddingLeft: '16px' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' },
  statCard: { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' },
  statLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' },
  statValue: { fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' },
  insightGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' },
  insightCard: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' },
  priorityBadge: (p) => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    background: p === 'high' ? '#fee2e2' : p === 'med' ? '#fef9c3' : '#f1f5f9',
    color: p === 'high' ? '#991b1b' : p === 'med' ? '#854d0e' : '#475569',
  }),
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginTop: 'auto',
    transition: 'all 0.2s',
  },
  archGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' },
  archItem: { padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }
}

export default function Home({ data, country, setSelectedEvidence }) {
  if (!data) return null

  const {
    legal_provisions = [],
    source_hierarchy = [],
    nodes = [],
    validation_notes = [],
    edges = [],
    traceability_matrix = { matrix: [] },
    system_architecture = [],
    system_level_insights = [],
    system_gap_implications = []
  } = data

  const currentMatrix = traceability_matrix.matrix?.filter(m => countryMatches(m.country, country)) || []
  const countryName = country === 'mexico' ? 'Mexico' : 'Costa Rica'
  const currentArch = system_architecture.find(a => countryMatches(a.country, country))
  const currentSystemInsights = system_level_insights.filter(i => countryMatches(i.country, country))
  const currentSystemGaps = system_gap_implications.filter(g => countryMatches(g.country, country))

  const stats = {
    provisions: legal_provisions.length,
    instruments: source_hierarchy.length,
    mechanisms: [...new Set(currentMatrix.map(m => m.mechanism_id))].length,
    principles: 12,
    actors: nodes.filter(n => countryMatches(n.country, country)).length,
    manualReview: validation_notes.filter(n => n.manual_review_required === "true").length,
    edges: edges.filter(e => countryMatches(e.country, country)).length,
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
          Executive Analytical Summary: {countryName}
        </h1>
        <p style={styles.summaryText}>
          {currentArch?.system_profile || `This pilot maps ${stats.provisions} legal provisions for ${countryName}.`}
        </p>
      </header>

      <div style={styles.statGrid}>
        <StatCard label="Provisions" value={stats.provisions} icon={FileText} />
        <StatCard label="Instruments" value={stats.instruments} icon={Book} />
        <StatCard label="Mechanisms" value={stats.mechanisms} icon={Settings} />
        <StatCard label="Review Flags" value={stats.manualReview} icon={AlertTriangle} color="#f59e0b" />
        <StatCard label="Network Edges" value={stats.edges} icon={Share2} />
      </div>

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={20} color="#38bdf8" /> System Architecture
        </h2>
        {currentArch && (
          <div style={styles.archGrid}>
            <div style={styles.archItem}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>DOMINANT ANCHOR TYPE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{currentArch.dominant_anchor_type}</div>
            </div>
            <div style={styles.archItem}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>CONSTITUTIONAL SOURCES</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{currentArch.constitutional_sources}</div>
            </div>
            <div style={styles.archItem}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>STATUTORY SOURCES</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{currentArch.statutory_sources}</div>
            </div>
            <div style={styles.archItem}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>ADMINISTRATIVE SOURCES</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{currentArch.administrative_sources}</div>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target size={20} color="#38bdf8" /> System-Level Insights
        </h2>
        <div style={styles.insightGrid}>
          {currentSystemInsights.map((insight, idx) => (
            <div key={idx} style={styles.insightCard}>
              <div style={styles.priorityBadge(insight.review_priority === 'High' ? 'high' : 'med')}>
                {insight.insight_type.replace(/_/g, ' ').toUpperCase()}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginTop: '12px' }}>{insight.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>{insight.finding}</p>
              <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <strong>Evidence Basis:</strong> {insight.evidence_basis}
              </div>
              <div style={{ fontSize: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <strong>Implication:</strong> {insight.legal_preparedness_implication}
              </div>
            </div>
          ))}
          {currentSystemGaps.map((gap, idx) => (
            <div key={`gap-${idx}`} style={{ ...styles.insightCard, borderLeft: '4px solid #ef4444' }}>
              <div style={styles.priorityBadge('high')}>CRITICAL GAP</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginTop: '12px' }}>{gap.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>{gap.description}</p>
              <div style={{ fontSize: '0.8rem', color: '#991b1b' }}>
                <strong>Recommended:</strong> {gap.recommended_action}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ ...styles.statCard, background: '#f8fafc', alignItems: 'center', padding: '16px' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} /> Diagnostic legal preparedness mapping. Not legal advice or compliance assessment.
        </p>
      </footer>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color = '#38bdf8' }) {
  return (
    <div style={styles.statCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={styles.statLabel}>{label}</span>
        <Icon size={16} color={color} />
      </div>
      <div style={styles.statValue}>{value}</div>
    </div>
  )
}
