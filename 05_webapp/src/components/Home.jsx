import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import {
  TrendingUp,
  AlertTriangle,
  Shield,
  Activity,
  Zap,
  ExternalLink,
  ChevronRight,
  Target,
  Users,
  BookOpen
} from 'lucide-react'
import { countryMatches } from '../utils'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '32px' },
  hero: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '48px',
    borderRadius: '24px',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  statGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: '20px'
  }),
  statCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  insightGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '24px'
  }),
  insightCard: {
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s'
  }
}

export default function Home({ data, country, openEvidence, isMobile }) {
  if (!data) return null

  const {
    system_level_insights = [],
    source_hierarchy = [],
    mechanism_map = [],
    nodes = [],
    traceability_matrix = []
  } = data

  const countryName = country === 'Mexico' ? 'Mexico' : 'Costa Rica'

  // Calculate Stats
  const provisionCount = (Array.isArray(data.legal_provisions) ? data.legal_provisions : []).length
  const mechanismCount = (Array.isArray(mechanism_map) ? mechanism_map : []).filter(m => countryMatches(m.country, countryName)).length
  const actorCount = (Array.isArray(nodes) ? nodes : []).filter(n => countryMatches(n.country, countryName)).length
  const sourceCount = (Array.isArray(source_hierarchy) ? source_hierarchy : []).length

  const filteredInsights = (Array.isArray(system_level_insights) ? system_level_insights : []).filter(i => countryMatches(i.country, countryName))

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Diagnostic Pilot</div>
        <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: 800, margin: 0 }}>{country} Diagnostic Summary</h1>
        <p style={{ fontSize: isMobile ? '1rem' : '1.15rem', color: '#94a3b8', maxWidth: '800px', lineHeight: '1.6' }}>
          This pilot maps {provisionCount} legal provisions, {mechanismCount} mechanisms, {actorCount} actors and 12 principle-mechanism diagnostic rows for {country}.
        </p>
      </section>

      <section style={styles.statGrid(isMobile)}>
        {[
          { label: 'Instruments', value: sourceCount, icon: BookOpen, color: '#0ea5e9' },
          { label: 'Mechanisms', value: mechanismCount, icon: Target, color: '#8b5cf6' },
          { label: 'Actors', value: actorCount, icon: Users, color: '#10b981' },
          { label: 'Provisions', value: provisionCount, icon: Shield, color: '#f59e0b' }
        ].map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <TrendingUp size={24} color="#0ea5e9" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Analytical Insights</h2>
        </div>

        <div style={styles.insightGrid(isMobile)}>
          {filteredInsights.map((insight, idx) => (
            <div key={idx} style={styles.insightCard}>
              <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ padding: '4px 10px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {insight.review_priority || 'Standard'} Review
                  </div>
                  <Zap size={18} color="#0ea5e9" />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', margin: '0 0 12px 0', lineHeight: '1.4' }}>{insight.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>{insight.analytical_finding}</p>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Shield size={14} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Implication</div>
                    <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>{insight.implication}</div>
                  </div>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Source: {insight.evidence_source || 'Core Corpus'}</div>
                   <button
                    onClick={() => openEvidence({ type: 'insight', data: insight, title: insight.title })}
                    style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                   >
                     View Evidence <ExternalLink size={14} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...styles.statCard, padding: '32px', background: '#f0f9ff', border: '1px solid #e0f2fe' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <AlertTriangle size={32} color="#0369a1" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0369a1', margin: '0 0 8px 0' }}>Methodological Framing</h3>
            <p style={{ fontSize: '0.95rem', color: '#0c4a6e', lineHeight: '1.6', margin: 0 }}>
              NormTrace Political Rights evaluates whether political participation mechanisms are legally anchored and operationalised.
              It does not assess compliance, provide legal advice, or rank countries. This mapping reflects legally encoded functional relationships, not observed behavior.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
