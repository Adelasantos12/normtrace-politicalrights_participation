import React from 'react'
import { X, FileText, ExternalLink, Shield, AlertTriangle, Scale } from 'lucide-react'

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 100,
    backdropFilter: 'blur(4px)'
  },
  drawer: {
    width: '100%',
    maxWidth: '600px',
    background: '#fff',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.1)'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' },
  content: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' },
  section: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  provisionCard: {
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  excerpt: {
    fontSize: '0.875rem',
    color: '#334155',
    lineHeight: 1.6,
    fontStyle: 'italic',
    paddingLeft: '16px',
    borderLeft: '4px solid #cbd5e1'
  },
  meta: { fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '12px', flexWrap: 'wrap' },
  badge: (bg, fg) => ({
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: bg,
    color: fg,
  }),
}

export default function EvidenceDrawer({ evidence, onClose, data }) {
  if (!evidence || !data) return null

  const { legal_provisions = [] } = data

  const getFilteredProvisions = () => {
    if (evidence.type === 'gap') {
      return legal_provisions.filter(p =>
        p.mechanism_id === evidence.mechanism_id ||
        (p.text && p.text.toLowerCase().includes(evidence.mechanism_name.toLowerCase()))
      ).slice(0, 5)
    }
    return []
  }

  const provisions = getFilteredProvisions()

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={e => e.stopPropagation()}>
        <header style={styles.header}>
          <div style={styles.title}>Evidence: {evidence.title || evidence.mechanism_name || 'Details'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </header>

        <div style={styles.content}>
          {evidence.finding && (
            <div style={styles.section}>
              <div style={styles.label}>Analytical Finding</div>
              <div style={{ fontSize: '1rem', color: '#1e3a8a', lineHeight: 1.5 }}>{evidence.finding}</div>
            </div>
          )}

          {evidence.description && (
            <div style={styles.section}>
              <div style={styles.label}>Principle Definition</div>
              <div style={{ fontSize: '0.9375rem', color: '#475569', lineHeight: 1.6 }}>{evidence.description}</div>
            </div>
          )}

          {provisions.length > 0 ? (
            <div style={styles.section}>
              <div style={styles.label}>Supporting Provisions ({provisions.length})</div>
              {provisions.map((p, idx) => (
                <div key={idx} style={styles.provisionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.source_id} - {p.article || 'N/A'}</div>
                    {p.manual_review_required === "true" && (
                      <span style={styles.badge('#fef3c7', '#92400e')}>Review Required</span>
                    )}
                  </div>
                  <div style={styles.excerpt}>{p.provision_text || p.text}</div>
                  <div style={styles.meta}>
                    <span>Principle: {p.principle_id || 'N/A'}</span>
                    <span>Mechanism: {p.mechanism_id || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            evidence.type === 'gap' && (
              <div style={{ padding: '24px', textAlign: 'center', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px' }}>
                <AlertTriangle size={32} color="#d97706" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                  No specific provisions detected in the current pilot for this exact intersection.
                  This may be due to the scope of the current corpus or vocabulary mapping.
                </div>
              </div>
            )
          )}

          <div style={styles.section}>
            <div style={styles.label}>Diagnostic Caveat</div>
            <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', fontSize: '0.875rem', color: '#475569' }}>
              <Info size={16} style={{ marginBottom: '8px', color: '#3b82f6' }} />
              This evidence is extracted automatically from the pilot corpus and recalibrated for legal preparedness.
              It represents statutory anchoring, not observed institutional behavior or legal advice.
            </div>
          </div>
        </div>

        <footer style={{ padding: '24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            style={{
              width: '100%',
              padding: '12px',
              background: '#1e293b',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={onClose}
          >
            Close Drawer
          </button>
        </footer>
      </div>
    </div>
  )
}
