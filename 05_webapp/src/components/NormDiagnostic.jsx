import React, { useState, useEffect } from 'react'
import {
  GitMerge, AlertTriangle, CheckCircle, XCircle,
  MinusCircle, Info, ChevronDown, ChevronRight,
  Globe, Scale, BookOpen, Layers, ArrowRight,
  ExternalLink, AlertCircle, Activity
} from 'lucide-react'

// ── Coupling status config ──────────────────────────────────────────────────
const COUPLING_CONFIG = {
  coupled:       { color: '#10b981', bg: '#d1fae5', border: '#6ee7b7', label: 'Acoplado',            icon: CheckCircle },
  partial:       { color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d', label: 'Parcial',              icon: MinusCircle },
  decoupled:     { color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', label: 'Desacoplado',          icon: XCircle },
  tension:       { color: '#8b5cf6', bg: '#ede9fe', border: '#c4b5fd', label: 'Tensión',              icon: AlertTriangle },
  potential_gap: { color: '#6366f1', bg: '#e0e7ff', border: '#a5b4fc', label: 'Posible brecha',       icon: AlertCircle },
}

const GAP_SEVERITY = {
  critical:      { color: '#ef4444', bg: '#fee2e2', label: 'Crítico' },
  significant:   { color: '#f97316', bg: '#ffedd5', label: 'Significativo' },
  moderate:      { color: '#f59e0b', bg: '#fef3c7', label: 'Moderado' },
  low:           { color: '#10b981', bg: '#d1fae5', label: 'Bajo' },
}

const REFORM_URGENCY = {
  high:     { color: '#ef4444', label: 'Urgente' },
  moderate: { color: '#f59e0b', label: 'Moderada' },
  low:      { color: '#10b981', label: 'Baja' },
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function Badge({ text, color, bg, small }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: small ? '2px 8px' : '3px 10px',
      borderRadius: '9999px',
      fontSize: small ? '0.65rem' : '0.7rem',
      fontWeight: 700,
      color,
      background: bg,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  )
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      {Icon && <Icon size={20} color="#0ea5e9" />}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{children}</h3>
    </div>
  )
}

// ── TAB 1: Normative System Architecture ────────────────────────────────────
function SystemArchitecture({ systemCtx, country }) {
  const profile = systemCtx?.countries?.[country]
  if (!profile) return <p style={{ color: '#64748b' }}>No hay datos de sistema para {country}.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header card */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '28px', borderRadius: '16px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', color: '#38bdf8' }}>
              {profile.name_es || profile.name}
            </h2>
            <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '0.85rem' }}>{profile.system_type_es}</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>{profile.territory_label}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
            <Badge text={profile.legal_tradition} color="#38bdf8" bg="#0c4a6e" />
            <Badge text={profile.government_form} color="#a78bfa" bg="#2e1065" />
          </div>
        </div>
        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', borderLeft: '3px solid #38bdf8' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase' }}>
            Incorporación del derecho internacional
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>{profile.intl_law_incorporation}</p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>{profile.intl_law_article}</p>
        </div>
      </div>

      {/* Constitutional pyramid */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <SectionTitle icon={Layers}>Jerarquía Normativa</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(profile.constitutional_pyramid || []).map((tier, idx) => {
            const width = Math.max(40, 100 - (idx * 12))
            const shade = idx === 0 ? '#0f172a' : idx === 1 ? '#1e3a5f' : idx === 2 ? '#1e4d80' : idx === 3 ? '#1a6699' : '#0e7490'
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: `${width}%`, background: shade, borderRadius: '8px',
                  padding: '10px 20px', color: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      {idx + 1}. {tier.label}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(tier.instruments || []).map((inst, i) => (
                        <span key={i} style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }}>
                          {inst}
                        </span>
                      ))}
                    </div>
                  </div>
                  {tier.note && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>{tier.note}</p>
                  )}
                </div>
                {idx < (profile.constitutional_pyramid.length - 1) && (
                  <div style={{ width: '2px', height: '8px', background: '#e2e8f0' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Treaty ratification table */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <SectionTitle icon={Globe}>Estado de Tratados Relevantes</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Tratado', 'Ratificado', 'Fecha', 'Protocolo Facultativo', 'Notas'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(profile.treaty_ratification || []).map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1e293b' }}>{t.treaty}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {t.ratified ? (
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Sí</span>
                    ) : t.endorsed ? (
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>~ Respaldado</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>✗ No</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{t.date || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>
                    {t.optional_protocol_1 || t.optional_protocol ? (
                      <span style={{ color: '#10b981' }}>✓</span>
                    ) : t.binding === false ? (
                      <span style={{ color: '#94a3b8' }}>N/A</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.75rem' }}>{t.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key structural tensions */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <SectionTitle icon={AlertTriangle}>Tensiones Estructurales del Sistema</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(profile.key_tensions || []).map((t, i) => {
            const cfg = GAP_SEVERITY[t.severity] || GAP_SEVERITY.moderate
            return (
              <div key={i} style={{ padding: '16px', borderRadius: '10px', background: '#f8fafc', borderLeft: `4px solid ${cfg.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{t.label}</span>
                  <Badge text={cfg.label} color={cfg.color} bg={cfg.bg} small />
                </div>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.8rem', lineHeight: 1.6 }}>{t.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Federal note */}
      {profile.federal_complication && (
        <div style={{ background: '#fefce8', padding: '16px 20px', borderRadius: '10px', border: '1px solid #fde047', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Info size={16} color="#ca8a04" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '0.8rem', color: '#713f12' }}>Implicación del tipo de Estado</p>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#854d0e' }}>{profile.federal_complication}</p>
          </div>
        </div>
      )}

    </div>
  )
}

// ── TAB 2: Norm Comparison ──────────────────────────────────────────────────
function NormComparisonPanel({ comparisons, country }) {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const countryComparisons = (comparisons || []).filter(c =>
    c.country === country || c.country === 'Both'
  )

  const gapTypes = ['all', ...new Set(countryComparisons.map(c => c.gap_type))]

  const filtered = filter === 'all'
    ? countryComparisons
    : countryComparisons.filter(c => c.gap_type === filter)

  const sel = selected ? countryComparisons.find(c => c.comparison_id === selected) : null

  const sufficiencyColor = (text) => {
    if (!text) return '#64748b'
    const t = text.toUpperCase()
    if (t.startsWith('INSUFFICIENT')) return '#ef4444'
    if (t.startsWith('PARTIALLY')) return '#f59e0b'
    if (t.startsWith('COMPLIANT') || t.startsWith('SUFFICIENT')) return '#10b981'
    if (t.startsWith('QUESTIONABLE') || t.startsWith('UNCERTAIN') || t.startsWith('RISK')) return '#8b5cf6'
    if (t.startsWith('GAP')) return '#f97316'
    return '#64748b'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Filter bar */}
      <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Filtrar por brecha:</span>
        {gapTypes.map(g => (
          <button key={g} onClick={() => setFilter(g)} style={{
            padding: '4px 12px', borderRadius: '6px', border: '1px solid',
            borderColor: filter === g ? '#0ea5e9' : '#e2e8f0',
            background: filter === g ? '#e0f2fe' : '#fff',
            color: filter === g ? '#0369a1' : '#64748b',
            cursor: 'pointer', fontSize: '0.72rem', fontWeight: filter === g ? 700 : 400
          }}>
            {g === 'all' ? 'Todas' : g.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 1fr' : '1fr', gap: '24px' }}>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(c => {
            const sev = c.gap_severity || 'moderate'
            const cfg = GAP_SEVERITY[sev] || GAP_SEVERITY.moderate
            const isSelected = selected === c.comparison_id
            return (
              <button
                key={c.comparison_id}
                onClick={() => setSelected(isSelected ? null : c.comparison_id)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '6px',
                  padding: '16px 18px', borderRadius: '10px', textAlign: 'left',
                  border: `2px solid ${isSelected ? '#0ea5e9' : '#e2e8f0'}`,
                  background: isSelected ? '#f0f9ff' : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{c.mechanism_label}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Badge text={cfg.label} color={cfg.color} bg={cfg.bg} small />
                    {c.country === 'Both' && <Badge text="Ambos países" color="#6366f1" bg="#e0e7ff" small />}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{c.topic}</p>
                <div style={{ marginTop: '4px', padding: '6px 10px', borderRadius: '6px', background: '#f8fafc', borderLeft: `3px solid ${sufficiencyColor(c.sufficiency_assessment)}` }}>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: sufficiencyColor(c.sufficiency_assessment), fontWeight: 700 }}>
                    {(c.sufficiency_assessment || '').split(' — ')[0]}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Detail panel */}
        {sel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px', alignSelf: 'flex-start', maxHeight: '85vh', overflowY: 'auto' }}>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{sel.mechanism_label}</h4>
                <Badge text={GAP_SEVERITY[sel.gap_severity]?.label || sel.gap_severity} color={GAP_SEVERITY[sel.gap_severity]?.color || '#64748b'} bg={GAP_SEVERITY[sel.gap_severity]?.bg || '#f8fafc'} />
              </div>
              <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: '#475569', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>{sel.topic}</p>

              {/* International standard */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Globe size={14} color="#0ea5e9" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase' }}>
                    Estándar Internacional
                  </span>
                  <Badge text={sel.international.authority_level.replace(/_/g, ' ')} color="#0ea5e9" bg="#e0f2fe" small />
                </div>
                <div style={{ background: '#f0f9ff', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>
                    {sel.international.instrument} — {sel.international.article}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#0c4a6e', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{sel.international.text}"
                  </p>
                </div>
              </div>

              {/* Interpretive authority */}
              {sel.interpretive_authority && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>
                    Autoridad interpretativa
                  </p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', fontWeight: 700, color: '#312e81' }}>
                    {sel.interpretive_authority.instrument}
                  </p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', color: '#6b7280' }}>{sel.interpretive_authority.citation}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#374151', lineHeight: 1.5 }}>{sel.interpretive_authority.key_holding}</p>
                </div>
              )}

              {/* Domestic law */}
              {sel.domestic && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <BookOpen size={14} color="#64748b" />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Derecho Doméstico — {sel.country === 'Both' ? 'Ver detalle por país' : sel.country}
                    </span>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid #94a3b8' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                      {sel.domestic.instrument} — {sel.domestic.article}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{sel.domestic.text}"
                    </p>
                  </div>
                  {/* Both-country domestics */}
                  {sel.domestic_mexico && (
                    <div style={{ marginTop: '10px', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid #16a34a' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>México</p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{sel.domestic_mexico.instrument} — {sel.domestic_mexico.article}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>"{sel.domestic_mexico.text}"</p>
                    </div>
                  )}
                  {sel.domestic_costa_rica && (
                    <div style={{ marginTop: '10px', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid #0369a1' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>Costa Rica</p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{sel.domestic_costa_rica.instrument} — {sel.domestic_costa_rica.article}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>"{sel.domestic_costa_rica.text}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Gap reasoning */}
              <div style={{ marginBottom: '14px', padding: '14px', background: '#fffbeb', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.72rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Razonamiento de la brecha</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#78350f', lineHeight: 1.65 }}>{sel.gap_reasoning}</p>
              </div>

              {/* Sufficiency */}
              <div style={{ marginBottom: '14px', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', borderLeft: `4px solid ${sufficiencyColor(sel.sufficiency_assessment)}` }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: 700, color: sufficiencyColor(sel.sufficiency_assessment), textTransform: 'uppercase' }}>
                  Evaluación de suficiencia
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.5 }}>{sel.sufficiency_assessment}</p>
              </div>

              {/* Jurisprudence */}
              {sel.applicable_jurisprudence?.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Jurisprudencia aplicable</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {sel.applicable_jurisprudence.map((j, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <Scale size={12} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '0.75rem', color: '#374151' }}>{j}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended action */}
              {sel.recommended_action && (
                <div style={{ padding: '12px 14px', background: '#f0fdf4', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.72rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>Acción recomendada</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#064e3b', lineHeight: 1.6 }}>{sel.recommended_action}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── TAB 3: Instrument Coupling (the "pipe puzzle") ──────────────────────────
function InstrumentCoupling({ couplings, country }) {
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const countryCouplings = (couplings || []).filter(c => c.country === country)
  const statuses = ['all', 'decoupled', 'tension', 'potential_gap', 'partial', 'coupled']
  const filtered = filterStatus === 'all' ? countryCouplings : countryCouplings.filter(c => c.coupling_status === filterStatus)
  const sel = selected ? countryCouplings.find(c => c.coupling_id === selected) : null

  const getCfg = (status) => COUPLING_CONFIG[status] || COUPLING_CONFIG.partial

  const layerColors = {
    constitutional_block: '#4338ca',
    constitutional: '#1d4ed8',
    statutory: '#0369a1',
    statutory_plus_administrative: '#0e7490',
    treaty: '#4338ca',
    ordinary_law: '#0891b2',
    ordinary: '#0891b2',
    administrative: '#0f766e',
    constitutional_gap: '#ef4444',
    statutory_gap: '#dc2626',
    implementer_absent: '#dc2626',
  }

  const getLayerColor = (layer) => layerColors[layer] || '#475569'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Summary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {Object.entries(COUPLING_CONFIG).map(([key, cfg]) => {
          const count = countryCouplings.filter(c => c.coupling_status === key).length
          if (count === 0) return null
          const Icon = cfg.icon
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
              style={{
                padding: '14px 16px', borderRadius: '10px', textAlign: 'left',
                background: filterStatus === key ? cfg.bg : '#fff',
                border: `2px solid ${filterStatus === key ? cfg.color : '#e2e8f0'}`,
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Icon size={16} color={cfg.color} />
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: cfg.color }}>{count}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ background: '#fff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Lectura del diagnóstico: analogía "sistema de tuberías"
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[
            { status: 'coupled', desc: 'Tubería completa — el derecho fluye' },
            { status: 'partial', desc: 'Tubería parcial — el flujo es limitado' },
            { status: 'decoupled', desc: 'Tubería rota o bloqueada' },
            { status: 'tension', desc: 'Tubería bajo presión interna' },
            { status: 'potential_gap', desc: 'Válvula cuestionable' },
          ].map(({ status, desc }) => {
            const cfg = getCfg(status)
            const Icon = cfg.icon
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={13} color={cfg.color} />
                <span style={{ fontSize: '0.72rem', color: '#475569' }}>{desc}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 1fr' : '1fr', gap: '20px' }}>

        {/* Coupling list as visual pipeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(c => {
            const cfg = getCfg(c.coupling_status)
            const Icon = cfg.icon
            const isSelected = selected === c.coupling_id
            const urgCfg = REFORM_URGENCY[c.reform_urgency] || REFORM_URGENCY.moderate
            return (
              <button
                key={c.coupling_id}
                onClick={() => setSelected(isSelected ? null : c.coupling_id)}
                style={{
                  padding: '16px', borderRadius: '12px', textAlign: 'left',
                  border: `2px solid ${isSelected ? cfg.color : '#e2e8f0'}`,
                  background: isSelected ? cfg.bg : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={16} color={cfg.color} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{c.coupling_label}</span>
                  </div>
                  <Badge text={`Reforma: ${urgCfg.label}`} color={urgCfg.color} bg="#f8fafc" small />
                </div>

                {/* Pipe visualization */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {/* Layer A */}
                  <div style={{
                    padding: '5px 10px', borderRadius: '6px',
                    background: getLayerColor(c.layer_a?.layer),
                    color: '#fff', fontSize: '0.68rem', fontWeight: 700, maxWidth: '180px'
                  }}>
                    <div style={{ opacity: 0.8, fontSize: '0.6rem', marginBottom: '2px' }}>{c.layer_a?.layer_label}</div>
                    {c.layer_a?.label}
                  </div>

                  {/* Pipe connector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                    <div style={{ width: '12px', height: '3px', background: cfg.color }} />
                    {c.coupling_status === 'decoupled' || c.coupling_status === 'tension' ? (
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: cfg.bg, border: `2px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={8} color={cfg.color} />
                      </div>
                    ) : (
                      <ArrowRight size={14} color={cfg.color} />
                    )}
                    <div style={{ width: '12px', height: '3px', background: cfg.color }} />
                  </div>

                  {/* Layer B */}
                  <div style={{
                    padding: '5px 10px', borderRadius: '6px',
                    background: getLayerColor(c.layer_b?.layer),
                    color: '#fff', fontSize: '0.68rem', fontWeight: 700, maxWidth: '180px'
                  }}>
                    <div style={{ opacity: 0.8, fontSize: '0.6rem', marginBottom: '2px' }}>{c.layer_b?.layer_label}</div>
                    {c.layer_b?.label}
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>{c.bottleneck_description}</p>

                {c.diagnosis && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', background: `${cfg.bg}`, borderRadius: '6px', borderLeft: `3px solid ${cfg.color}` }}>
                    <p style={{ margin: 0, fontSize: '0.73rem', color: cfg.color, fontWeight: 700 }}>{c.diagnosis}</p>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Detail panel */}
        {sel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px', alignSelf: 'flex-start', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', maxWidth: '280px' }}>{sel.title}</h4>
                <Badge text={getCfg(sel.coupling_status).label} color={getCfg(sel.coupling_status).color} bg={getCfg(sel.coupling_status).bg} />
              </div>

              {/* Instrument A */}
              <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Instrumento A — Creador de derechos</p>
                <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: '8px', borderLeft: `3px solid ${getLayerColor(sel.layer_a?.layer)}` }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.72rem', fontWeight: 700, color: '#1e40af' }}>[{sel.layer_a?.layer_label}] {sel.layer_a?.label}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#1e3a8a', lineHeight: 1.5 }}>{sel.layer_a?.key_provision}</p>
                </div>
              </div>

              {/* Instrument B */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Instrumento B — Implementador</p>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: `3px solid ${getLayerColor(sel.layer_b?.layer)}` }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>[{sel.layer_b?.layer_label}] {sel.layer_b?.label}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>{sel.layer_b?.key_provision}</p>
                </div>
              </div>

              {/* Expected vs actual */}
              <div style={{ marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>Conexión esperada</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#064e3b', lineHeight: 1.5 }}>{sel.connection_expected}</p>
                </div>
                <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Conexión real</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#7f1d1d', lineHeight: 1.5 }}>{sel.connection_actual}</p>
                </div>
              </div>

              {/* Practical consequence */}
              <div style={{ marginBottom: '14px', padding: '12px', background: '#fffbeb', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Consecuencia práctica</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#78350f', lineHeight: 1.6 }}>{sel.practical_consequence}</p>
              </div>

              {/* Reform */}
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Reforma requerida</p>
                  <Badge
                    text={`Urgencia: ${REFORM_URGENCY[sel.reform_urgency]?.label || sel.reform_urgency}`}
                    color={REFORM_URGENCY[sel.reform_urgency]?.color || '#64748b'}
                    bg="#f8fafc"
                    small
                  />
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#374151', fontWeight: 600 }}>
                  {sel.reform_requirement?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function NormDiagnostic({ country, isMobile }) {
  const [activeTab, setActiveTab] = useState('system')
  const [systemCtx, setSystemCtx] = useState(null)
  const [comparisons, setComparisons] = useState(null)
  const [couplings, setCouplings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/data/system_context.json').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/data/norm_comparison.json').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/data/instrument_coupling.json').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([sys, comp, coup]) => {
      setSystemCtx(sys)
      setComparisons(comp)
      setCouplings(coup)
      setLoading(false)
    })
  }, [])

  const tabs = [
    { id: 'system', label: 'Sistema Normativo', icon: Layers, desc: 'Arquitectura jurídica del país' },
    { id: 'comparison', label: 'Comparación de Normas', icon: Scale, desc: 'Estándar internacional vs. ley doméstica' },
    { id: 'coupling', label: 'Acoplamiento Jurídico', icon: GitMerge, desc: 'Mapa de flujos y desconexiones' },
  ]

  const countryComparisons = (comparisons || []).filter(c => c.country === country || c.country === 'Both')
  const countryCouplings = (couplings || []).filter(c => c.country === country)
  const decoupledCount = countryCouplings.filter(c => c.coupling_status === 'decoupled' || c.coupling_status === 'tension').length
  const criticalComparisons = countryComparisons.filter(c => c.gap_severity === 'significant' || c.gap_severity === 'critical').length

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#64748b' }}>
        <Activity className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Tab header */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(to right, #f8fafc, #fff)' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
            Diagnóstico Normativo — {country}
          </h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
            Sistema político, razonamiento jurídico comparado, y mapa de acoplamiento institucional
          </p>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#fee2e2', borderRadius: '8px' }}>
              <XCircle size={13} color="#ef4444" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991b1b' }}>
                {decoupledCount} desacopl./tensiones
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#ffedd5', borderRadius: '8px' }}>
              <AlertTriangle size={13} color="#f97316" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9a3412' }}>
                {criticalComparisons} brechas significativas/críticas
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#e0f2fe', borderRadius: '8px' }}>
              <Scale size={13} color="#0369a1" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#075985' }}>
                {countryComparisons.length} comparaciones normas
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', overflowX: 'auto' }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px',
                  padding: '14px 20px',
                  background: isActive ? '#f0f9ff' : 'transparent',
                  border: 'none', borderBottom: `3px solid ${isActive ? '#0ea5e9' : 'transparent'}`,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} color={isActive ? '#0ea5e9' : '#94a3b8'} />
                  <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#0369a1' : '#64748b' }}>
                    {tab.label}
                  </span>
                </div>
                {!isMobile && (
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', paddingLeft: '24px' }}>{tab.desc}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'system' && <SystemArchitecture systemCtx={systemCtx} country={country} />}
      {activeTab === 'comparison' && <NormComparisonPanel comparisons={comparisons} country={country} />}
      {activeTab === 'coupling' && <InstrumentCoupling couplings={couplings} country={country} />}

    </div>
  )
}
