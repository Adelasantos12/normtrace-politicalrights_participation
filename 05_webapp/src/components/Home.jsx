import React from 'react'
import {
  FileText,
  Book,
  Settings,
  Shield,
  Users,
  AlertTriangle,
  Share2,
  Info,
  ArrowRight,
  ExternalLink
} from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '32px' },
  header: { marginBottom: '8px' },
  title: { fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' },
  summaryText: { fontSize: '1.125rem', color: '#475569', lineHeight: 1.6 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px'
  },
  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardIcon: (color) => ({
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: `${color}10`,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  cardLabel: { fontSize: '0.875rem', fontWeight: 500, color: '#64748b' },
  cardValue: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  insightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '20px'
  },
  insightCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    borderLeft: '4px solid #3b82f6',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  insightTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e293b' },
  insightFinding: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 },
  insightMeta: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' },
  badge: (bg, fg) => ({
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: bg,
    color: fg,
  }),
  priorityBadge: (level) => {
    const colors = {
      high: { bg: '#fee2e2', fg: '#991b1b' },
      medium: { bg: '#fef3c7', fg: '#92400e' },
      low: { bg: '#dcfce7', fg: '#166534' }
    }
    const c = colors[level] || colors.medium
    return styles.badge(c.bg, c.fg)
  }
}

export default function Home({ data, country, setSelectedEvidence }) {
  if (!data) return null

  const {
    legal_provisions = [],
    source_hierarchy = [],
    mechanism_map = [],
    principle_definitions = { principles: [] },
    actor_map = [],
    validation_notes = [],
    edges = [],
    traceability_matrix = { matrix: [] }
  } = data

  const stats = {
    provisions: legal_provisions.length,
    instruments: source_hierarchy.length,
    mechanisms: mechanism_map.length,
    principles: principle_definitions.principles.length,
    actors: Array.isArray(actor_map) ? actor_map.length : Object.keys(actor_map).length,
    manualReview: validation_notes.filter(n => n.manual_review_required === "true").length,
    edges: edges.length,
    diagnosticRows: traceability_matrix.matrix.filter(m => m.country.toLowerCase() === country.toLowerCase()).length
  }

  const countryName = country.charAt(0).toUpperCase() + country.slice(1).replace('_', ' ')

  const generateInsights = () => {
    const insights = []

    // Insight: Strong anchoring but caveats
    const strongAnchors = traceability_matrix.matrix.filter(
      m => m.country.toLowerCase() === country.toLowerCase() && m.max_anchor_strength >= 4
    )
    if (strongAnchors.length > 0) {
      insights.push({
        title: "Strong statutory anchoring with operational caveats",
        finding: `${strongAnchors.length} mechanisms show strong or integrated basis (score 4-5), yet manual review flags indicate implementation dependencies.`,
        mechanism: strongAnchors[0].mechanism_name,
        source: "principle_traceability_matrix.json",
        implication: "High legal stability but requires verification of administrative operationalisation.",
        priority: "medium"
      })
    }

    // Insight: Accessibility manual review
    const accessibilityIssues = traceability_matrix.matrix.filter(
      m => m.country.toLowerCase() === country.toLowerCase() && m.principle_name === "accessibility_and_reasonable_accommodation" && m.max_anchor_strength < 3
    )
    if (accessibilityIssues.length > 0) {
      insights.push({
        title: "Accessibility requires manual review",
        finding: "Generic access language detected in multiple instruments does not necessarily satisfy specific international standards (e.g. CRPD Art 29).",
        mechanism: "Multiple",
        source: "validation_notes.json",
        implication: "Potential gap in reasonable accommodation for political participation.",
        priority: "high"
      })
    }

    // Insight: Administrative dependence
    if (data.admin_dependence && data.admin_dependence.length > 0) {
      insights.push({
        title: "Administrative dependence concentrated in selected mechanisms",
        finding: "Core operations for several mechanisms depend on flexible administrative instruments rather than primary statutes.",
        mechanism: "Referendum / Citizen Initiative",
        source: "administrative_dependence_metrics_v2.json",
        implication: "Lower stability of anchoring; susceptible to regulatory change without legislative oversight.",
        priority: "medium"
      })
    }

    // Insight: Actor modelling caveat (Mexico specific)
    if (country === 'mexico') {
      insights.push({
        title: "Actor modelling caveat: Senate patch integrated",
        finding: "Mexico's institutional network includes a specific patch for Senate functional relationships to reflect recent constitutional reforms.",
        mechanism: "Legislative Oversight",
        source: "mexico_senado_edges_patch.csv",
        implication: "Network centrality metrics reflect the latest statutory hierarchy.",
        priority: "low"
      })
    }

    // Insight: Mechanism absent
    const absentMechs = traceability_matrix.matrix.filter(
      m => m.country.toLowerCase() === country.toLowerCase() && m.max_anchor_strength === 0
    )
    if (absentMechs.length > 0) {
      insights.push({
        title: "Mechanism absent or vocabulary mismatch",
        finding: `The mechanism '${absentMechs[0].mechanism_name}' was not detected in the current corpus with functional anchoring.`,
        mechanism: absentMechs[0].mechanism_name,
        source: "mechanism_map.json",
        implication: "Genuine absence, vocabulary mismatch, or missing source coverage in the current pilot.",
        priority: "high"
      })
    }

    return insights
  }

  const insights = generateInsights()

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Executive Analytical Summary: {countryName}</h1>
        <p style={styles.summaryText}>
          This pilot maps <strong>{stats.provisions}</strong> legal provisions,
          <strong> {stats.instruments}</strong> instruments,
          <strong> {stats.mechanisms}</strong> mechanisms and
          <strong> {stats.diagnosticRows}</strong> principle-mechanism diagnostic rows for {countryName}.
        </p>
      </div>

      <div style={styles.grid}>
        <SummaryCard icon={FileText} label="Legal Provisions" value={stats.provisions} color="#3b82f6" />
        <SummaryCard icon={Book} label="Instruments Reviewed" value={stats.instruments} color="#10b981" />
        <SummaryCard icon={Settings} label="Mechanisms Mapped" value={stats.mechanisms} color="#8b5cf6" />
        <SummaryCard icon={Shield} label="Principles Traced" value={stats.principles} color="#f59e0b" />
        <SummaryCard icon={Users} label="Actors Identified" value={stats.actors} color="#ec4899" />
        <SummaryCard icon={AlertTriangle} label="Manual Review Flags" value={stats.manualReview} color="#ef4444" />
        <SummaryCard icon={Share2} label="Functional Network Edges" value={stats.edges} color="#06b6d4" />
        <SummaryCard icon={Info} label="High/Med Caveats" value={validation_notes.length} color="#64748b" />
      </div>

      <section>
        <div style={styles.sectionTitle}>
          <ArrowRight size={20} />
          Analytical Insights
        </div>
        <div style={styles.insightGrid}>
          {insights.map((insight, idx) => (
            <div key={idx} style={styles.insightCard}>
              <div style={styles.insightTitle}>{insight.title}</div>
              <div style={styles.insightFinding}>{insight.finding}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <strong>Implication:</strong> {insight.implication}
              </div>
              <div style={styles.insightMeta}>
                <span style={styles.badge('#f1f5f9', '#475569')}>{insight.mechanism}</span>
                <span style={styles.badge('#f1f5f9', '#475569')}>{insight.source}</span>
                <span style={styles.priorityBadge(insight.priority)}>Priority: {insight.priority}</span>
              </div>
              <button
                onClick={() => setSelectedEvidence({ type: 'insight', ...insight })}
                style={{
                  marginTop: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                View evidence <ExternalLink size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardIcon(color)}>
        <Icon size={20} />
      </div>
      <div>
        <div style={styles.cardLabel}>{label}</div>
        <div style={styles.cardValue}>{value}</div>
      </div>
    </div>
  )
}
