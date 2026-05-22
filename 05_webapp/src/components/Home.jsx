import React from 'react'
import { FileText, Book, Settings, Shield, Users, AlertTriangle, Share2, Info, ArrowRight, Target, CheckCircle, Database, Layers, ExternalLink } from 'lucide-react'
import { countryMatches } from '../utils'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '32px' },
  header: { marginBottom: '8px' },
  summaryText: { fontSize: '1.1rem', color: '#475569', borderLeft: '4px solid #38bdf8', paddingLeft: '16px', lineHeight: '1.6' },
  statGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px'
  }),
  statCard: { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' },
  statLabel: { fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em' },
  statValue: { fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' },
  insightGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px'
  }),
  insightCard: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  priorityBadge: (p) => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '0.65rem',
    fontWeight: 700,
    background: p === 'High' ? '#fee2e2' : p === 'Med' ? '#fef9c3' : '#f1f5f9',
    color: p === 'High' ? '#991b1b' : p === 'Med' ? '#854d0e' : '#475569',
    textTransform: 'uppercase'
  }),
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginTop: 'auto',
    color: '#334155',
  },
  archGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  }),
  archItem: { padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  implication: { fontSize: '0.85rem', borderTop: '1px solid #f1f5f9', paddingTop: '12px', color: '#334155', marginTop: '4px' }
}

export default function Home({ data, country, openEvidence, isMobile }) {
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

  const countryName = countryMatches(country, 'mexico') ? 'Mexico' : 'Costa Rica'
  const currentMatrix = traceability_matrix.matrix?.filter(m => countryMatches(m.country, country)) || []
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
    caveats: currentSystemInsights.filter(i => i.insight_type.includes('caveat')).length
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.025em' }}>
          Executive Analytical Summary: {countryName}
        </h1>
        <p style={{ ...styles.summaryText, fontSize: isMobile ? '0.95rem' : '1.1rem' }}>
          This pilot maps <strong>{stats.provisions}</strong> legal provisions, <strong>{stats.mechanisms}</strong> mechanisms, <strong>{stats.actors}</strong> actors and <strong>{currentMatrix.length}</strong> principle-mechanism diagnostic rows for {countryName}.
        </p>
      </header>

      <div style={styles.statGrid(isMobile)}>
        <StatCard label="Legal Provisions" value={stats.provisions} icon={FileText} />
        <StatCard label="Instruments" value={stats.instruments} icon={Book} />
        <StatCard label="Mechanisms" value={stats.mechanisms} icon={Settings} />
        <StatCard label="Principles" value={stats.principles} icon={Target} />
        <StatCard label="Actors" value={stats.actors} icon={Users} />
        <StatCard label="Review Flags" value={stats.manualReview} icon={AlertTriangle} color="#f59e0b" />
        {!isMobile && <StatCard label="Network Edges" value={stats.edges} icon={Share2} />}
        {!isMobile && <StatCard label="Insights" value={stats.caveats + currentSystemInsights.length} icon={Shield} />}
      </div>

      <section>
        <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b' }}>
          <Layers size={24} color="#38bdf8" /> Analytical Insights
        </h2>
        <div style={styles.insightGrid(isMobile)}>
          {currentSystemInsights.map((insight, idx) => (
            <div key={idx} style={styles.insightCard}>
              <div style={styles.priorityBadge(insight.review_priority)}>
                {insight.review_priority}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                {insight.insight_type.replace(/_/g, ' ')}
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{insight.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>{insight.finding}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <div><strong>Mechanism/Principle:</strong> {insight.affected_mechanisms || insight.affected_principles}</div>
              </div>

              <div style={styles.implication}>
                <strong>Implication:</strong> {insight.legal_preparedness_implication}
              </div>

              <button
                style={styles.button}
                onClick={() => openEvidence({
                  title: insight.title,
                  type: 'insight',
                  data: insight
                })}
              >
                View Evidence <ExternalLink size={14} />
              </button>
            </div>
          ))}

          {currentSystemGaps.map((gap, idx) => (
            <div key={`gap-${idx}`} style={{ ...styles.insightCard, borderLeft: '4px solid #ef4444' }}>
              <div style={styles.priorityBadge('High')}>High Priority</div>
              <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>Critical Gap</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{gap.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>{gap.description}</p>
              <div style={{ fontSize: '0.85rem', color: '#991b1b', background: '#fee2e2', padding: '12px', borderRadius: '8px' }}>
                <strong>Recommendation:</strong> {gap.recommended_action}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b' }}>
          <Database size={24} color="#38bdf8" /> Legal Architecture Summary
        </h2>
        {currentArch && (
          <div style={styles.archGrid(isMobile)}>
            <ArchItem label="Dominant Anchor" value={currentArch.dominant_anchor_type} />
            <ArchItem label="Constitutional" value={currentArch.constitutional_sources} />
            <ArchItem label="Statutory" value={currentArch.statutory_sources} />
            <ArchItem label="Administrative" value={currentArch.administrative_sources} />
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color = '#38bdf8' }) {
  return (
    <div style={styles.statCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={styles.statLabel}>{label}</span>
        <Icon size={18} color={color} />
      </div>
      <div style={styles.statValue}>{value}</div>
    </div>
  )
}

function ArchItem({ label, value }) {
  return (
    <div style={styles.archItem}>
      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{value}</div>
    </div>
  )
}
