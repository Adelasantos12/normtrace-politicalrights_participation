import React, { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronRight, AlertTriangle, BookOpen, Shield, Info, Calendar, Hash } from 'lucide-react'
import { countryMatches } from '../utils'

// Corpus dates keyed by source_id (DOF reform date or publication date of the version analysed)
const CORPUS_DATES = {
  'MEX-CPEUM':   '23 Apr 2026',
  'MEX-LGIPE':   '14 Oct 2024',
  'MEX-LGPP':    '2 Mar 2023',
  'MEX-LGDE':    '20 May 2021',
  'MEX-LGSMIME': '2 Mar 2023 (restored text)',
  'MEX-LGRA':    '15 Dec 2025',
  'MEX-LGTAIP':  '2025',
  'MEX-LFCP':    '19 May 2021',
  'MEX-LFRM':    '26 Sep 2022',
  'MEX-LFPA':    '14 Nov 2025',
  'MEX-LFPRH':   '2026',
  'MEX-LOAPF':   '16 Jul 2025',
  'MEX-LPLAN':   '2026',
  'MEX-REGCD':   '7 May 2025',
  'MEX-REGSN':   '6 Dec 2024',
  'MEX-REGCONG': '24 Dec 2010',
  'MEX-INECP':   '1 Aug 2021 (INE/CG572/2021)',
  'MEX-INERM':   '2022',
  'MEX-REGINE':  '2025',
  'CRC-CPOL':    '1949, with amendments',
  'CRC-LOTSRC':  '1965, with amendments',
  'CRC-CE':      '2009 (Law 8765)',
  'CRC-LREF':    '2006 (Law 8492)',
  'CRC-LIP':     '2006 (Law 8491)',
  'CRC-LJC':     '1989 (Law 7135)',
  'CRC-LCPREF':  '2021',
  'CRC-REGREF':  'TSE regulation',
  'CRC-REGIP':   '2007 (Decree 04-2007)',
  'CRC-RATSRE':  'TSE internal',
  'CRC-RAL':     '2014 compilation',
  'CRC-LGAP':    'Excluded — image-based',
}

// Human-readable type labels and normative rank metadata
const TYPE_META = {
  constitution:               { label: 'Constitution',                    rank: 1, rankColor: '#1e40af', rankBg: '#dbeafe' },
  organic_law:                { label: 'Organic Laws',                    rank: 2, rankColor: '#166534', rankBg: '#dcfce7' },
  general_law:                { label: 'General Laws',                    rank: 2, rankColor: '#166534', rankBg: '#dcfce7' },
  codigo_ley:                 { label: 'Electoral Code',                  rank: 3, rankColor: '#0f766e', rankBg: '#ccfbf1' },
  federal_law:                { label: 'Federal Laws',                    rank: 3, rankColor: '#0f766e', rankBg: '#ccfbf1' },
  statutory_law:              { label: 'Statutory Laws',                  rank: 4, rankColor: '#854d0e', rankBg: '#fef9c3' },
  parliamentary_regulation:   { label: 'Parliamentary Regulations',       rank: 4, rankColor: '#854d0e', rankBg: '#fef9c3' },
  tse_reglamento:             { label: 'TSE Regulations',                 rank: 5, rankColor: '#6b21a8', rankBg: '#f3e8ff' },
  electoral_administrative:   { label: 'Electoral Administrative Instruments', rank: 5, rankColor: '#6b21a8', rankBg: '#f3e8ff' },
  legislative_reglamento:     { label: 'Legislative Regulations',         rank: 6, rankColor: '#475569', rankBg: '#f1f5f9' },
  administrative_reglamento:  { label: 'Administrative Regulations',      rank: 7, rankColor: '#64748b', rankBg: '#f8fafc' },
  excluded_image_based:       { label: 'Excluded Sources',                rank: 99, rankColor: '#94a3b8', rankBg: '#f8fafc' },
  jurisprudential_interpretive: { label: 'Jurisprudential Instruments',   rank: 6, rankColor: '#64748b', rankBg: '#f8fafc' },
}

export default function Instruments({ data, country, isMobile }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedTypes, setExpandedTypes] = useState(new Set())

  if (!data) return null

  const { source_hierarchy = [], mechanism_sources = [], validation_notes = [], instrument_insights = [] } = data

  const toggleType = (type) => {
    setExpandedTypes(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  // Build deduplicated source list from mechanism_sources (has titles and types)
  const individualSources = useMemo(() => {
    const seen = {}
    const sources = Array.isArray(mechanism_sources) ? mechanism_sources : []
    sources.forEach(s => {
      if (s.source_id && !seen[s.source_id]) {
        seen[s.source_id] = {
          source_id:    s.source_id,
          source_title: s.source_title || s.source_id,
          source_type:  s.source_type || 'unknown',
          normative_rank: parseInt(s.normative_rank) || 99,
          notes:        s.notes || '',
        }
      }
    })

    // For Costa Rica, if mechanism_sources lacks titles, supplement from source_hierarchy
    if (!Object.values(seen).some(s => s.source_title && s.source_title !== s.source_id)) {
      const sh = Array.isArray(source_hierarchy) ? source_hierarchy : []
      sh.forEach(s => {
        if (s.source_id) {
          seen[s.source_id] = {
            source_id:     s.source_id,
            source_title:  (s.notes || '').split('.')[0].trim() || s.source_id,
            source_type:   s.source_type || 'unknown',
            normative_rank: s.normative_rank || 99,
            notes:         s.notes || '',
          }
        }
      })
    }

    return Object.values(seen)
  }, [mechanism_sources, source_hierarchy])

  // Get source_hierarchy type descriptions (Mexico-style; one entry per type)
  const typeDescriptions = useMemo(() => {
    const desc = {}
    const sh = Array.isArray(source_hierarchy) ? source_hierarchy : []
    sh.forEach(s => {
      if (s.source_type && !s.source_id) {
        desc[s.source_type] = { function: s.function, caution: s.caution }
      }
    })
    return desc
  }, [source_hierarchy])

  // Get insight for a source type or source_id
  const getInsight = (sourceId) => {
    if (!sourceId) return null
    const insights = Array.isArray(instrument_insights) ? instrument_insights : []
    return insights.find(i =>
      (i.source_id === sourceId || i.source_type === sourceId) && countryMatches(i.country, country)
    )
  }

  // Get manual review flag
  const hasManualReview = (sourceId) => {
    const notes = Array.isArray(validation_notes) ? validation_notes : []
    return notes.some(n =>
      (n.source_id === sourceId) && n.manual_review_required === 'true'
    )
  }

  // Group sources by type
  const groupedSources = useMemo(() => {
    const groups = {}
    individualSources.forEach(s => {
      const t = s.source_type
      if (!groups[t]) groups[t] = []
      groups[t].push(s)
    })
    // Sort within each group by rank then title
    Object.values(groups).forEach(grp => grp.sort((a, b) => a.normative_rank - b.normative_rank || a.source_title.localeCompare(b.source_title)))
    return groups
  }, [individualSources])

  // Filter groups and sources by search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupedSources
    const q = searchTerm.toLowerCase()
    const result = {}
    Object.entries(groupedSources).forEach(([type, srcs]) => {
      const matched = srcs.filter(s =>
        s.source_title.toLowerCase().includes(q) || s.source_id.toLowerCase().includes(q)
      )
      if (matched.length > 0) result[type] = matched
    })
    return result
  }, [groupedSources, searchTerm])

  // Sort groups by normative rank
  const sortedTypes = Object.keys(filteredGroups).sort((a, b) => {
    const ra = TYPE_META[a]?.rank ?? 99
    const rb = TYPE_META[b]?.rank ?? 99
    return ra - rb
  })

  const totalInstruments = individualSources.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: isMobile ? '16px' : '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Instruments Reviewed</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
            {totalInstruments} normative sources in the diagnostic corpus for {country}, grouped by hierarchical tier.
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by law name or identifier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Type groups */}
      {sortedTypes.map(type => {
        const meta = TYPE_META[type] || { label: type.replace(/_/g, ' '), rank: 99, rankColor: '#64748b', rankBg: '#f8fafc' }
        const sources = filteredGroups[type] || []
        const typeDesc = typeDescriptions[type] || {}
        const isExpanded = expandedTypes.has(type) || searchTerm.length > 0
        const insight = getInsight(type)

        return (
          <div key={type} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Type header — clickable to expand */}
            <button
              onClick={() => toggleType(type)}
              style={{
                width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px',
                background: isExpanded ? '#f8fafc' : '#fff', border: 'none', cursor: 'pointer',
                textAlign: 'left', borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none', transition: 'background 0.15s'
              }}
            >
              {/* Rank badge */}
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', background: meta.rankBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.85rem', color: meta.rankColor, flexShrink: 0
              }}>
                {meta.rank === 99 ? '—' : meta.rank}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{meta.label}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700,
                    background: '#e2e8f0', color: '#475569'
                  }}>
                    {sources.length} {sources.length === 1 ? 'instrument' : 'instruments'}
                  </span>
                </div>
                {typeDesc.function && (
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                    {typeDesc.function}
                  </p>
                )}
              </div>

              {isExpanded ? <ChevronDown size={18} color="#64748b" /> : <ChevronRight size={18} color="#64748b" />}
            </button>

            {/* Expanded instrument list */}
            {isExpanded && (
              <div style={{ padding: '4px 0 8px 0' }}>
                {/* Caution notice */}
                {typeDesc.caution && (
                  <div style={{ margin: '8px 16px', padding: '10px 14px', background: '#fffbeb', borderRadius: '8px', borderLeft: '3px solid #f59e0b', display: 'flex', gap: '10px' }}>
                    <AlertTriangle size={14} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.78rem', color: '#78350f' }}>{typeDesc.caution}</span>
                  </div>
                )}

                {/* Analytical insight */}
                {insight && (
                  <div style={{ margin: '8px 16px', padding: '12px 14px', background: '#f0f9ff', borderRadius: '8px', borderLeft: '3px solid #0ea5e9' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={12} /> Analytical Assessment
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#0c4a6e', lineHeight: 1.5 }}>{insight.analytical_insight}</p>
                  </div>
                )}

                {/* Individual instruments */}
                {sources.map((s, idx) => {
                  const corpusDate = CORPUS_DATES[s.source_id]
                  const manualReview = hasManualReview(s.source_id)

                  return (
                    <div key={s.source_id} style={{
                      margin: '0 12px 6px 12px', padding: '12px 16px', borderRadius: '8px',
                      background: idx % 2 === 0 ? '#f8fafc' : '#fff',
                      border: '1px solid #f1f5f9',
                      display: 'flex', flexDirection: 'column', gap: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', lineHeight: 1.4 }}>
                            {s.source_title}
                          </div>
                        </div>
                        {manualReview && (
                          <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '3px' }} title="Manual review required" />
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#64748b' }}>
                          <Hash size={11} />
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>{s.source_id}</span>
                        </span>
                        {corpusDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#64748b' }}>
                            <Calendar size={11} />
                            {corpusDate}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {sortedTypes.length === 0 && (
        <div style={{ padding: '60px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          No instruments match your search.
        </div>
      )}

      {/* Corpus note */}
      <div style={{ padding: '14px 18px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
        <Info size={15} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>
          Corpus dates reflect the version of each instrument analysed — either the date of the most recent DOF reform in the text used or the document publication date. State-level legislation and jurisprudence are not included in the corpus.
        </p>
      </div>
    </div>
  )
}
