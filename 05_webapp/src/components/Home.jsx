import React, { useState, useEffect, useMemo } from 'react'
import {
  Shield, Target, Users, BookOpen, TrendingUp, AlertTriangle, Info,
  XCircle, AlertCircle, MinusCircle, Layers, Map, Network, Scale, FileSearch, GitMerge
} from 'lucide-react'
import { countryMatches } from '../utils'

const SCORE_META = [
  { label: 'Absent',           color: '#94a3b8' },
  { label: 'Declaratory only', color: '#f87171' },
  { label: 'Partial basis',    color: '#fb923c' },
  { label: 'Functional basis', color: '#fbbf24' },
  { label: 'Strong basis',     color: '#34d399' },
  { label: 'Integrated',       color: '#10b981' },
]

const COUPLING_META = {
  decoupled:     { label: 'Decoupled',     color: '#dc2626', bg: '#fef2f2', border: '#fecaca', Icon: XCircle,     desc: 'Normative chain broken — obligation exists but is structurally blocked or absent at the domestic level.' },
  partial:       { label: 'Partial',       color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: AlertCircle,  desc: 'Chain exists but coverage is incomplete or anchored at insufficient normative depth.' },
  tension:       { label: 'Tension',       color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', Icon: AlertTriangle,desc: 'Two or more provisions pull in opposing directions within the same normative layer.' },
  potential_gap: { label: 'Potential Gap', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', Icon: MinusCircle,  desc: 'Identified structural risk — likely to become a breach if current interpretation is not clarified.' },
}

const SECTION_GUIDE = [
  { icon: Layers,     label: 'Norm Diagnostic',      desc: 'Constitutional architecture, treaty pyramid, and key structural tensions.' },
  { icon: BookOpen,   label: 'Instruments Reviewed',  desc: 'Complete corpus of legal instruments grouped by normative type and layer.' },
  { icon: Target,     label: 'Principles & Anchoring',desc: 'Anchoring of each ICCPR/ACHR/CRPD principle to domestic provisions, scored 0–5.' },
  { icon: Map,        label: 'Anchoring / Gap Map',   desc: 'Heatmap of implementation-readiness scores across all principle–mechanism intersections.' },
  { icon: Network,    label: 'Actors & Network',      desc: 'Institutional network showing legally encoded relationships and centrality metrics.' },
  { icon: GitMerge,   label: 'Norm Coupling',         desc: 'Coupling status of each normative chain from international obligation to domestic implementation.' },
]

export default function Home({ data, country, isMobile }) {
  const [coupling, setCoupling] = useState([])
  const [systemCtx, setSystemCtx] = useState(null)

  useEffect(() => {
    fetch('/data/instrument_coupling.json')
      .then(r => r.json()).then(setCoupling).catch(() => {})
    fetch('/data/system_context.json')
      .then(r => r.json())
      .then(d => setSystemCtx((d.countries || {})[country] || null))
      .catch(() => {})
  }, [country])

  if (!data) return null

  const countryName = country === 'Mexico' ? 'Mexico' : 'Costa Rica'

  const provisionCount = Array.isArray(data.legal_provisions) ? data.legal_provisions.length : 0
  const mechanismCount = (Array.isArray(data.mechanism_map) ? data.mechanism_map : [])
    .filter(m => countryMatches(m.country, countryName)).length
  const sourceCount = (Array.isArray(data.source_hierarchy) ? data.source_hierarchy : []).length

  const scoreDistribution = useMemo(() => {
    const matrix = data.traceability_matrix?.matrix || []
    const rows = matrix.filter(r => countryMatches(r.country, countryName))
    const counts = [0, 0, 0, 0, 0, 0]
    rows.forEach(r => {
      const score = Math.round(parseFloat(r.implementation_readiness_score) || 0)
      if (score >= 0 && score <= 5) counts[score]++
    })
    return counts
  }, [data, countryName])

  const totalRows = scoreDistribution.reduce((a, b) => a + b, 0)
  const avgScore = totalRows > 0
    ? scoreDistribution.reduce((s, c, i) => s + c * i, 0) / totalRows : 0

  const countryCoupling = coupling.filter(c => c.country === countryName)
  const couplingCounts = Object.fromEntries(
    ['decoupled', 'partial', 'tension', 'potential_gap'].map(s => [
      s, countryCoupling.filter(c => c.coupling_status === s).length
    ])
  )
  const topCritical = countryCoupling.filter(c => c.reform_urgency === 'high').slice(0, 2)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0c2a4a 60%, #1e3a5f 100%)',
        padding: isMobile ? '28px 20px' : '48px',
        borderRadius: '20px',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>NormTrace · Diagnostic Pilot</span>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#334155', display: 'inline-block' }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Political Rights</span>
        </div>

        <h1 style={{ fontSize: isMobile ? '1.55rem' : '2.2rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
          {country} — Normative Internalization Diagnostic
        </h1>

        <p style={{ fontSize: isMobile ? '0.88rem' : '0.98rem', color: '#94a3b8', maxWidth: '720px', lineHeight: '1.7', margin: 0 }}>
          NormTrace traces the legal chain from international standard to operational implementation — identifying where the normative cascade breaks: rights guaranteed by treaty but anchored at insufficient domestic depth, mechanisms enacted at the wrong normative layer, and implementation gaps structurally embedded in the system's architecture.
        </p>

        {systemCtx && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {[
              systemCtx.system_type,
              systemCtx.territory_label_en || systemCtx.territory_label,
              `Constitution ${systemCtx.constitution_year}`,
              systemCtx.legal_tradition
            ].filter(Boolean).map((tag, i) => (
              <span key={i} style={{
                padding: '3px 10px', borderRadius: '20px',
                background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.22)',
                fontSize: '0.7rem', color: '#7dd3fc', fontWeight: 500
              }}>{tag}</span>
            ))}
          </div>
        )}

        {systemCtx?.treaty_ratification && (
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Treaty Status</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {systemCtx.treaty_ratification.map((t, i) => (
                <span key={i} style={{
                  padding: '2px 9px', borderRadius: '4px',
                  background: t.ratified ? 'rgba(16,185,129,0.18)' : 'rgba(148,163,184,0.12)',
                  border: `1px solid ${t.ratified ? 'rgba(16,185,129,0.35)' : 'rgba(148,163,184,0.25)'}`,
                  fontSize: '0.65rem', fontWeight: 700, fontFamily: 'monospace',
                  color: t.ratified ? '#6ee7b7' : '#64748b'
                }}>
                  {t.treaty} {t.ratified ? '✓' : '~'}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Key metrics ── */}
      <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '14px' }}>
        {[
          { label: 'Legal Provisions Analysed', value: provisionCount.toLocaleString(), Icon: Shield,    color: '#0ea5e9', sub: 'Corpus provisions' },
          { label: 'Participation Mechanisms',  value: mechanismCount,                 Icon: Target,    color: '#8b5cf6', sub: 'Mechanisms mapped' },
          { label: 'Instruments Reviewed',      value: sourceCount,                    Icon: BookOpen,  color: '#10b981', sub: 'Legal instruments' },
          { label: 'Avg. Anchoring Score',      value: avgScore.toFixed(2) + ' / 5',  Icon: TrendingUp, color: '#f59e0b', sub: `Across ${totalRows} intersections` },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <s.Icon size={18} color={s.color} />
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{s.label}</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{s.sub}</div>
          </div>
        ))}
      </section>

      {/* ── Anchoring score distribution ── */}
      <section style={{ background: '#fff', padding: isMobile ? '20px' : '28px 32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '0 0 6px 0' }}>Anchoring Score Distribution</h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.55' }}>
          Distribution of implementation-readiness scores across all principle–mechanism intersections.
          Score 0 = no statutory evidence; Score 5 = fully operationalised with mandatory enforcement mechanism.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {SCORE_META.map(({ label, color }, score) => {
            const count = scoreDistribution[score] || 0
            const pct = totalRows > 0 ? (count / totalRows) * 100 : 0
            return (
              <div key={score} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: isMobile ? '70px' : '90px', fontSize: '0.72rem', color: '#64748b', textAlign: 'right', flexShrink: 0 }}>
                  <strong style={{ color: '#1e293b' }}>{score}</strong> — {label}
                </div>
                <div style={{ flex: 1, height: '22px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '6px', minWidth: count > 0 ? '4px' : '0' }} />
                </div>
                <div style={{ width: '60px', fontSize: '0.72rem', color: '#64748b', flexShrink: 0 }}>
                  {count} <span style={{ color: '#94a3b8' }}>({pct.toFixed(0)}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Coupling status ── */}
      {countryCoupling.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Normative Coupling Diagnostics</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Status of the normative chain connecting international obligation to domestic implementation across {countryCoupling.length} analysed coupling pairs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {Object.entries(COUPLING_META).map(([status, meta]) => {
              const count = couplingCounts[status] || 0
              return (
                <div key={status} style={{
                  padding: '16px', background: meta.bg,
                  border: `1px solid ${meta.border}`,
                  borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <meta.Icon size={16} color={meta.color} />
                    <span style={{ fontSize: '1.45rem', fontWeight: 800, color: meta.color }}>{count}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: meta.color }}>{meta.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#475569', lineHeight: '1.4' }}>{meta.desc}</div>
                </div>
              )
            })}
          </div>

          {topCritical.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>High-Priority Coupling Issues</div>
              {topCritical.map((c, i) => (
                <div key={i} style={{
                  padding: '16px 20px', background: '#fff',
                  border: '1px solid #e2e8f0', borderLeft: '4px solid #dc2626',
                  borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{c.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.55' }}>{c.bottleneck_description}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#fee2e2', color: '#dc2626', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      {c.coupling_status?.replace(/_/g, ' ')}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#fef9c3', color: '#854d0e', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Reform: {c.reform_requirement?.replace(/_/g, ' ')}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#ffe4e6', color: '#9f1239', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Urgency: {c.reform_urgency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Section guide ── */}
      <section>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '0 0 14px 0' }}>Explore the Diagnostic</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px' }}>
          {SECTION_GUIDE.map((sec, i) => (
            <div key={i} style={{
              padding: '14px 16px', background: '#f8fafc',
              border: '1px solid #e2e8f0', borderRadius: '10px',
              display: 'flex', gap: '12px', alignItems: 'flex-start'
            }}>
              <div style={{ padding: '7px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '7px', flexShrink: 0 }}>
                <sec.icon size={15} color='#0ea5e9' />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>{sec.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4' }}>{sec.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scope note ── */}
      <section style={{ padding: '18px 22px', background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '12px', display: 'flex', gap: '12px' }}>
        <Info size={18} color='#0369a1' style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>Scope and Limitations</div>
          <p style={{ fontSize: '0.78rem', color: '#0c4a6e', lineHeight: '1.6', margin: 0 }}>
            NormTrace analyses whether political participation mechanisms are legally anchored and operationalised at the appropriate normative layer. It does not assess compliance, predict outcomes, or constitute legal advice. Scores reflect the presence, depth, and enforceability of legal provisions — not observable behaviour or judicial enforcement practice.
          </p>
        </div>
      </section>

    </div>
  )
}
