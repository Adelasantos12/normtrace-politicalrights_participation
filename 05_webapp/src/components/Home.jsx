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
  ExternalLink,
  Target
} from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '32px' },
  header: { marginBottom: '8px' },
  branding: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  title: { fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.025em' },
  summaryText: { fontSize: '1.25rem', color: '#475569', lineHeight: 1.6, maxWidth: '900px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px'
  },
  card: {
    background: '#fff',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  cardIcon: (color) => ({
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: `${color}10`,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  cardLabel: { fontSize: '0.9rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em' },
  cardValue: { fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' },
  insightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px'
  },
  insightCard: {
    background: '#fff',
    padding: '28px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    borderLeft: '6px solid #3b82f6',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  insightTitle: { fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' },
  insightFinding: { fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 },
  insightMeta: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' },
  badge: (bg, fg) => ({
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    background: bg,
    color: fg,
  }),
  priorityBadge: (level) => {
    const colors = {
      high: { bg: '#fee2e2', fg: '#b91c1c' },
      medium: { bg: '#fef3c7', fg: '#92400e' },
      low: { bg: '#dcfce7', fg: '#15803d' }
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
    traceability_matrix = { matrix: [] },
    admin_dependence = []
  } = data

  const currentMatrix = traceability_matrix.matrix.filter(m => m.country.toLowerCase() === country.toLowerCase())

  const stats = {
    provisions: legal_provisions.length,
    instruments: source_hierarchy.length,
    mechanisms: mechanism_map.length || [...new Set(currentMatrix.map(m => m.mechanism_id))].length,
    principles: principle_definitions.principles.length,
    actors: Array.isArray(actor_map) ? actor_map.length : (actor_map ? Object.keys(actor_map).length : 0),
    manualReview: validation_notes.filter(n => n.manual_review_required === "true").length,
    edges: edges.length,
    diagnosticRows: currentMatrix.length
  }

  const countryName = country === 'mexico' ? 'Mexico' : 'Costa Rica'

  const generateInsights = () => {
    const insights = []

    // Insight 1: General Anchoring finding
    const avgScore = currentMatrix.length > 0
      ? currentMatrix.reduce((a, b) => a + (b.max_anchor_strength || 0), 0) / currentMatrix.length
      : 0

    if (avgScore > 3) {
      insights.push({
        title: "Strong statutory anchoring with operational caveats",
        finding: `The framework for ${countryName} shows an average anchoring score of ${avgScore.toFixed(1)}/5, indicating functional basis across major mechanisms, but specific operational dimensions require manual review.`,
        mechanism: "Multiple",
        source: "principle_traceability_matrix.json",
        implication: "High legal stability but potential 'declaratory gap' in administrative implementation.",
        priority: "medium",
        type: "insight"
      })
    } else {
      insights.push({
        title: "Partial anchoring detected across core mechanisms",
        finding: `Significant mechanisms in ${countryName} show partial legal basis (score 1-2), suggesting a need for stronger statutory development beyond declaratory language.`,
        mechanism: "Multiple",
        source: "principle_traceability_matrix.json",
        implication: "Lower institutional stability; reliance on administrative discretion.",
        priority: "high",
        type: "insight"
      })
    }

    // Insight 2: Accessibility (PRIN-003)
    const accessRows = currentMatrix.filter(m => m.principle_name === 'accessibility_and_reasonable_accommodation')
    const lowAccess = accessRows.filter(m => (m.max_anchor_strength || 0) < 3)

    if (accessRows.length > 0) {
      insights.push({
        title: "Accessibility requires specific manual review",
        finding: `${lowAccess.length > 0 ? 'Gaps' : 'General language'} detected in accessibility anchoring. Generic access language often fails to satisfy CRPD Article 29 specificities for reasonable accommodation.`,
        mechanism: "Accessibility",
        source: "principle_traceability_matrix.json",
        implication: "Potential exclusion of persons with disabilities from political participation processes.",
        priority: "high",
        principle_id: "PRIN-003",
        type: "insight"
      })
    }

    // Insight 3: Administrative Dependence
    const highDep = admin_dependence.filter(d => (d.dependence_score || 0) > 0.6)
    if (highDep.length > 0) {
      insights.push({
        title: "High administrative dependence detected",
        finding: `Key mechanisms (e.g., ${highDep[0].mechanism_id}) depend heavily on flexible administrative instruments rather than primary statutes.`,
        mechanism: highDep[0].mechanism_id,
        source: "administrative_dependence_metrics_v2.json",
        implication: "Legal preparedness is vulnerable to regulatory changes without legislative oversight.",
        priority: "medium",
        type: "insight"
      })
    }

    // Insight 4: Manual Review Area
    const topGap = validation_notes.find(n => n.severity === "high")
    if (topGap) {
      insights.push({
        title: `Priority Manual Review: ${topGap.note_type.replace(/_/g, ' ')}`,
        finding: topGap.description,
        mechanism: topGap.affected_mechanism || "All",
        source: "validation_notes.json",
        implication: "Significant diagnostic gap that requires expert legal interpretation.",
        priority: "high",
        type: "insight"
      })
    }

    // Insight 5: Jurisprudence Support
    insights.push({
      title: "Jurisprudence layer available as interpretive support",
      finding: "The interpretive layer refines diagnostic tests but does not increase domestic statutory anchor strength scores.",
      mechanism: "Interpretive",
      source: "jurisprudence_index.json",
      implication: "Provides essential guidance for rights-based implementation of existing statutes.",
      priority: "low",
      type: "insight"
    })

    return insights
  }

  const insights = generateInsights()

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.branding}>
          <Target size={32} color="#38bdf8" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            NormTrace Political Rights
          </span>
        </div>
        <h1 style={styles.title}>Executive Analytical Summary: {countryName}</h1>
        <p style={styles.summaryText}>
          Diagnostic legal preparedness mapping for political participation rights.
          This pilot maps <strong>{stats.provisions}</strong> provisions,
          <strong> {stats.instruments}</strong> instruments,
          <strong> {stats.mechanisms}</strong> mechanisms and
          <strong> {stats.diagnosticRows}</strong> principle-mechanism diagnostic rows.
        </p>
      </div>

      <div style={styles.grid}>
        <SummaryCard icon={FileText} label="Legal Provisions" value={stats.provisions} color="#3b82f6" />
        <SummaryCard icon={Book} label="Instruments" value={stats.instruments} color="#10b981" />
        <SummaryCard icon={Settings} label="Mechanisms" value={stats.mechanisms} color="#8b5cf6" />
        <SummaryCard icon={Shield} label="Principles" value={stats.principles} color="#f59e0b" />
        <SummaryCard icon={Users} label="Actors" value={stats.actors} color="#ec4899" />
        <SummaryCard icon={AlertTriangle} label="Manual Review Flags" value={stats.manualReview} color="#ef4444" />
        <SummaryCard icon={Share2} label="Network Edges" value={stats.edges} color="#06b6d4" />
      </div>

      <section style={{ marginTop: '20px' }}>
        <div style={styles.sectionTitle}>
          <ArrowRight size={28} color="#3b82f6" />
          Analytical Insights
        </div>
        <div style={styles.insightGrid}>
          {insights.map((insight, idx) => (
            <div key={idx} style={styles.insightCard}>
              <div style={styles.insightTitle}>{insight.title}</div>
              <div style={styles.insightFinding}>{insight.finding}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <strong>Implication:</strong> {insight.implication}
              </div>
              <div style={styles.insightMeta}>
                <span style={styles.badge('#f1f5f9', '#475569')}>{insight.mechanism}</span>
                <span style={styles.badge('#f1f5f9', '#475569')}>{insight.source}</span>
                <span style={styles.priorityBadge(insight.priority)}>Priority: {insight.priority}</span>
              </div>
              <button
                onClick={() => setSelectedEvidence(insight)}
                style={{
                  marginTop: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#2563eb',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  width: 'fit-content',
                  transition: 'background 0.2s'
                }}
              >
                View evidence <ExternalLink size={16} />
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
        <Icon size={24} />
      </div>
      <div>
        <div style={styles.cardLabel}>{label}</div>
        <div style={styles.cardValue}>{value}</div>
      </div>
    </div>
  )
}
