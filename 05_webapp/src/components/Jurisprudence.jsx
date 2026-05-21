import React from 'react'
import { Scale, ExternalLink, Book, Shield, AlertCircle } from 'lucide-react'

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  title: { fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  tableContainer: { border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 },
  td: { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#1e293b' },
  badge: (bg, fg) => ({ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: bg, color: fg }),
  caveat: { padding: '16px', background: '#fefce8', borderRadius: '8px', fontSize: '0.875rem', color: '#854d0e', border: '1px solid #fef08a' }
}

export default function Jurisprudence({ data, country }) {
  if (!data) return null

  const { jurisprudence_index = [] } = data

  return (
    <div style={styles.container}>
      <div style={styles.caveat}>
        <AlertCircle size={18} style={{ float: 'left', marginRight: '12px' }} />
        <strong>Interpretive Layer:</strong> This layer refines interpretive tests and acquisition priorities. It does not increase domestic anchor_strength, which is reserved for statutory and constitutional instruments.
      </div>

      <div style={styles.card}>
        <div style={styles.title}><Scale size={20} /> Jurisprudence & Interpretive Support</div>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Court / Body</th>
                <th style={styles.th}>Case / Document</th>
                <th style={styles.th}>Binding Status</th>
                <th style={styles.th}>Principles</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jurisprudence_index.length > 0 ? jurisprudence_index.map((j, i) => (
                <tr key={i}>
                  <td style={styles.td}>{j.court || j.body}</td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>{j.case || j.document}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{j.source_type}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badge(j.binding_status === 'binding' ? '#dcfce7' : '#f1f5f9', j.binding_status === 'binding' ? '#166534' : '#475569')}>
                      {j.binding_status}
                    </span>
                  </td>
                  <td style={styles.td}>{j.mapped_principles || 'Multiple'}</td>
                  <td style={styles.td}>
                    <button style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No jurisprudence records available in the current pilot corpus for this country.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.title}><Book size={20} /> Interpretive Weight Methodology</div>
        <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
          Jurisprudence is categorized by its interpretive weight (Highest, High, Medium, Supporting).
          While it provides essential guidance on how statutory provisions should be applied in accordance with international standards,
          the NormTrace methodology maintains a distinction between the "anchor strength" of the primary law and its interpretive development by courts.
        </div>
      </div>
    </div>
  )
}
