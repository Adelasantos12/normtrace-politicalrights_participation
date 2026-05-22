import React, { useState } from 'react'
import { countryMatches } from '../utils'
import { Scale, Search, Download, ExternalLink, Shield } from 'lucide-react'

export default function JurisprudenceView({ data, country }) {
  if (!data) return null

  // Handle wrapper: jurisprudence_index
  const jurisprudence = data.jurisprudence?.jurisprudence_index || data.jurisprudence || []
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCases = Array.isArray(jurisprudence) ? jurisprudence.filter(c => {
    const matchesCountry = countryMatches(c.country_or_system || c.country, country) ||
                          c.country_or_system === 'international' ||
                          c.country_or_system === 'Inter-American'
    const matchesSearch = (c.case_or_document_title || c.case_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.rights_or_mechanisms_covered || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCountry && matchesSearch
  }) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Jurisprudence & Interpretive Layer</h2>
            <p style={{ color: '#64748b' }}>Searchable database of court cases and legal interpretations that support principle application.</p>
          </div>
          <Scale size={40} color="#e2e8f0" />
        </div>

        <div style={{ marginTop: '24px', position: 'relative' }}>
          <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search cases by name, principle, or summary..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
        {filteredCases.map((c, i) => (
          <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                {c.court_or_body || c.court || 'Constitutional Court'}
              </div>
              {(c.binding_status || '').includes('binding') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Shield size={14} /> BINDING
                </div>
              )}
            </div>

            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b', marginBottom: '4px' }}>{c.case_or_document_title || c.case_name || c.document_title}</h3>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Case Ref: {c.case_or_document_number || c.case_id || 'N/A'} • {c.year || '2023'}</div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
              {c.summary || c.notes || 'Summary of interpretive weight and diagnostic relevance for the selected country.'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(c.rights_or_mechanisms_covered || '').split('|').map((p, j) => (
                <span key={j} style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {p}
                </span>
              ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>
                <Download size={14} /> Download PDF
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                View Interpretation <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}

        {filteredCases.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <Scale size={60} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p>No jurisprudence found matching your filters for {countryMatches(country, 'mexico') ? 'Mexico' : 'Costa Rica'}.</p>
          </div>
        )}
      </div>

      <div style={{ background: '#fefce8', padding: '16px', borderRadius: '8px', border: '1px solid #fef08a', fontSize: '0.85rem', color: '#854d0e', display: 'flex', gap: '12px' }}>
        <Shield size={20} />
        <div>
          <strong>Interpretive Layer Caveat:</strong> Jurisprudence refines interpretive tests and acquisition priorities. It provides diagnostic support but does not automatically increase the domestic statutory anchor_strength score.
        </div>
      </div>
    </div>
  )
}
