import React, { useState } from 'react'
import { FileSearch, Scale, ExternalLink, Search, Filter, AlertCircle, Bookmark } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  headerCard: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  card: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' },
  badge: (weight) => ({
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    background: weight === 'high' ? '#eff6ff' : '#f8fafc',
    color: weight === 'high' ? '#1e40af' : '#64748b',
    textTransform: 'uppercase'
  }),
  bindingBadge: (status) => ({
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: 700,
    background: status.includes('binding') ? '#f0fdf4' : '#f1f5f9',
    color: status.includes('binding') ? '#166534' : '#475569',
    border: `1px solid ${status.includes('binding') ? '#bbf7d0' : '#e2e8f0'}`
  })
}

export default function Jurisprudence({ data, country }) {
  const [searchTerm, setSearchTerm] = useState('')

  if (!data) return null

  const { jurisprudence_index = { jurisprudence_index: [] } } = data
  const cases = jurisprudence_index.jurisprudence_index || []

  const filteredCases = cases.filter(c => {
    const term = searchTerm.toLowerCase()
    return (
      c.case_or_document_title.toLowerCase().includes(term) ||
      c.court_or_body.toLowerCase().includes(term) ||
      c.rights_or_mechanisms_covered.toLowerCase().includes(term)
    )
  })

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Jurisprudence / Interpretive Layer</h2>
        <p style={{ color: '#64748b', marginTop: '8px', maxWidth: '800px' }}>
          This layer refines interpretive tests and acquisition priorities. While these cases provide essential context for understanding how rights are applied, they do not automatically increase domestic statutory anchor strength.
        </p>
        <div style={{ marginTop: '20px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search cases by title, body, or mechanism..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      <div style={styles.grid}>
        {filteredCases.map((c, idx) => (
          <div key={idx} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={styles.badge(c.interpretive_weight)}>Weight: {c.interpretive_weight}</div>
              <div style={styles.bindingBadge(c.binding_status)}>{c.binding_status.replace(/_/g, ' ')}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase' }}>{c.court_or_body}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>{c.case_or_document_title}</h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.case_or_document_number}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                <strong>Rights/Mechanisms:</strong> {c.rights_or_mechanisms_covered.split('|').join(', ')}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.5', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                {c.notes}
              </p>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: c.full_text_available === 'true' ? '#166534' : '#94a3b8' }}>
                <Bookmark size={14} /> {c.full_text_available === 'true' ? 'Full Text Ready' : 'Metadata Only'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div style={{ padding: '80px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <AlertCircle size={48} color="#94a3b8" style={{ margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#475569' }}>No matching cases found</h3>
          <p style={{ color: '#64748b' }}>Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  )
}
