import React from 'react'
import { X, FileText, Shield, AlertCircle, Bookmark, Link as LinkIcon, Info } from 'lucide-react'

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(15, 23, 42, 0.4)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 9999,
    backdropFilter: 'blur(4px)'
  },
  drawer: {
    width: '100%',
    maxWidth: '650px',
    background: '#fff',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff'
  },
  content: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  provisionCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  provisionHeader: {
    padding: '12px 16px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tag: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase'
  }
}

export default function EvidenceDrawer({ isOpen, onClose, context, country, data }) {
  if (!isOpen || !data) return null

  const { legal_provisions = [] } = data

  const getFilteredProvisions = () => {
    if (!context) return []

    if (context.type === 'insight') {
      const insight = context.data
      const mechanisms = (insight.affected_mechanisms || '').split(',').map(m => m.trim().toLowerCase())
      const principles = (insight.affected_principles || '').split(',').map(p => p.trim().toLowerCase())

      return legal_provisions.filter(p => {
        const pm = (p.mechanism || '').toLowerCase()
        const pp = (p.principle || '').toLowerCase()
        return mechanisms.some(m => pm.includes(m)) || principles.some(p => pp.includes(p))
      })
    }

    if (context.type === 'instrument') {
      return legal_provisions.filter(p => p.source_id === context.data.source_id)
    }

    if (context.type === 'principle_mechanism') {
      const { principle_id, mechanism_id } = context.data
      return legal_provisions.filter(p =>
        (p.principle || '').includes(principle_id) &&
        (p.mechanism || '').includes(mechanism_id)
      )
    }

    if (context.type === 'mechanism') {
      return legal_provisions.filter(p => (p.mechanism || '').includes(context.data.mechanism_id))
    }

    if (context.type === 'principle') {
      return legal_provisions.filter(p => (p.principle || '').includes(context.data.principle_id))
    }

    return []
  }

  const filtered = getFilteredProvisions().slice(0, 50)

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Evidence Drawer</h2>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
              {context?.title || 'Supporting legal provisions'} for {country}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: '#f1f5f9', padding: '10px', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {context?.type === 'insight' && (
            <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Info size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 700, color: '#1e40af' }}>Diagnostic Finding</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af', lineHeight: '1.5' }}>{context.data.finding}</p>
                </div>
              </div>
            </div>
          )}

          {filtered.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Displaying {filtered.length} relevant provisions
              </div>
              {filtered.map((p, i) => (
                <div key={i} style={styles.provisionCard}>
                  <div style={styles.provisionHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                      <Bookmark size={14} color="#38bdf8" />
                      {p.source_id} {p.article ? `Art. ${p.article}` : ''}
                    </div>
                    <div style={styles.tag}>{p.source_type || 'Provision'}</div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: '#334155', fontStyle: 'italic' }}>
                      "{p.provision_text || p.text}"
                    </p>
                  </div>
                  <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {p.mechanism && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <strong style={{ color: '#475569' }}>Mechanism:</strong> {p.mechanism}
                      </div>
                    )}
                    {p.principle && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <strong style={{ color: '#475569' }}>Principle:</strong> {p.principle}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '80px 40px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
              <AlertCircle size={48} color="#94a3b8" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#475569', margin: '0 0 8px 0' }}>No explicit provisions found</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                The current diagnostic corpus does not contain direct statutory evidence for this specific selection.
                This may indicate a genuine legal gap or an administrative/interpretive basis not captured in the primary text.
              </p>
            </div>
          )}
        </div>

        <footer style={{ padding: '20px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
          Diagnostic legal preparedness mapping. Not legal advice.
        </footer>
      </div>
    </div>
  )
}
