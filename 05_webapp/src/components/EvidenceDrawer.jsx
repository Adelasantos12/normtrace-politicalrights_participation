import React from 'react'
import { X, FileText, ExternalLink, Shield, AlertTriangle, Scale, Info, CheckCircle, Target } from 'lucide-react'

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
    zIndex: 100,
    backdropFilter: 'blur(8px)'
  },
  drawer: {
    width: '100%',
    maxWidth: '640px',
    background: '#fff',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
    animation: 'slideIn 0.3s ease-out'
  },
  header: {
    padding: '32px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f8fafc'
  },
  title: { fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' },
  content: { flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' },
  section: { display: 'flex', flexDirection: 'column', gap: '16px' },
  label: { fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' },
  provisionCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  excerpt: {
    fontSize: '1rem',
    color: '#334155',
    lineHeight: 1.6,
    fontStyle: 'italic',
    paddingLeft: '20px',
    borderLeft: '4px solid #cbd5e1',
    background: '#f8fafc',
    padding: '16px 20px',
    borderRadius: '0 12px 12px 0'
  },
  meta: { fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '16px', flexWrap: 'wrap' },
  badge: (bg, fg) => ({
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    background: bg,
    color: fg,
  }),
  infoBox: (color) => ({
    padding: '20px',
    background: `${color}08`,
    border: `1px solid ${color}20`,
    borderRadius: '12px',
    fontSize: '0.95rem',
    color: '#334155',
    lineHeight: 1.6,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  })
}

export default function EvidenceDrawer({ evidence, onClose, data, country }) {
  if (!evidence || !data) return null

  const {
    legal_provisions = [],
    traceability_matrix = { matrix: [] },
    traceability_explainer = []
  } = data

  const mechanismId = evidence.mechanism_id || evidence.mechanism
  const principleId = evidence.principle_id

  // 1. Find the specific traceability row
  const traceRow = (traceability_matrix.matrix || []).find(m =>
    m.country.toLowerCase() === country.toLowerCase() &&
    (m.mechanism_id === mechanismId || m.mechanism_name === mechanismId) &&
    (m.principle_id === principleId || m.principle_name === principleId)
  )

  // 2. Find filtered provisions
  const provisions = legal_provisions.filter(p => {
    const matchMech = mechanismId ? (p.mechanism_id === mechanismId || (p.mechanism_name && p.mechanism_name.toLowerCase().includes(mechanismId.toLowerCase()))) : true
    const matchPrin = principleId ? (p.principle_id === principleId || (p.principle_name && p.principle_name.toLowerCase().includes(principleId.toLowerCase()))) : true
    return matchMech && matchPrin
  }).slice(0, 10)

  // 3. Find explainer if principle is present
  const explainer = traceability_explainer.find(e => e.principle_id === principleId)

  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
      <div style={styles.drawer} onClick={e => e.stopPropagation()}>
        <header style={styles.header}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '4px' }}>
              Diagnostic Evidence Source
            </div>
            <div style={styles.title}>
              {evidence.mechanism_name || mechanismId || 'Diagnostic Detail'}
              {principleId && ` · ${principleId}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '50%' }}>
            <X size={28} />
          </button>
        </header>

        <div style={styles.content}>
          {/* Finding / Interpretation */}
          <div style={styles.section}>
            <div style={styles.label}>Diagnostic Interpretation</div>
            <div style={styles.infoBox('#3b82f6')}>
              <div style={{ fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} /> Implementation Readiness
              </div>
              <div>{evidence.finding || traceRow?.diagnostic_interpretation || "Functional legal basis detected for this mechanism-principle intersection."}</div>
              {traceRow && (
                <div style={{ marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '0.85rem' }}>
                  <strong>Score {traceRow.max_anchor_strength}:</strong> {traceRow.why_not_higher || "Meets primary statutory requirements for functional anchoring."}
                </div>
              )}
            </div>
          </div>

          {/* Principle Context */}
          {explainer && (
            <div style={styles.section}>
              <div style={styles.label}>Principle Relevance</div>
              <div style={styles.infoBox('#10b981')}>
                <div style={{ fontWeight: 700, color: '#065f46' }}>{explainer.principle_name?.replace(/_/g, ' ')}</div>
                <div>{explainer.legal_preparedness_implication || explainer.implication}</div>
              </div>
            </div>
          )}

          {/* Manual Review Alert */}
          {(traceRow?.manual_review_required === "true" || evidence.priority === 'high') && (
            <div style={styles.section}>
              <div style={styles.label}>Review Priority</div>
              <div style={styles.infoBox('#ef4444')}>
                <div style={{ fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} /> Manual Review Required
                </div>
                <div>This diagnostic row has been flagged for expert legal review due to potential vocabulary mismatches or complex statutory hierarchy.</div>
              </div>
            </div>
          )}

          {/* Provisions List */}
          <div style={styles.section}>
            <div style={styles.label}>Supporting Provisions ({provisions.length})</div>
            {provisions.length > 0 ? (
              provisions.map((p, idx) => (
                <div key={idx} style={styles.provisionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{p.source_title || p.source_id}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{p.article || p.citation || 'Provision detail'}</div>
                    </div>
                    {p.manual_review_required === "true" && (
                      <span style={styles.badge('#fef3c7', '#92400e')}>Review Flag</span>
                    )}
                  </div>
                  <div style={styles.excerpt}>{p.provision_text || p.text}</div>
                  <div style={styles.meta}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={14} /> {p.principle_id || 'Global'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> {p.normative_rank || p.rank || 'Statutory'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
                <Info size={40} color="#94a3b8" style={{ marginBottom: '16px', margin: '0 auto' }} />
                <div style={{ fontWeight: 700, color: '#475569', marginBottom: '8px' }}>No direct provision-level evidence linked</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                  The diagnostic score is derived from mechanism-level evidence in the current corpus. No specific text excerpts are mapped to this intersection.
                </div>
              </div>
            )}
          </div>

          <div style={styles.section}>
            <div style={styles.label}>Methodological Caveat</div>
            <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px', fontSize: '0.875rem', color: '#475569', border: '1px solid #e2e8f0' }}>
              <Info size={18} style={{ marginBottom: '8px', color: '#3b82f6' }} />
              Diagnostic evidence is extracted automatically from the pilot corpus and recalibrated for legal preparedness.
              It represents legally encoded functional anchoring, not observed institutional behavior.
            </div>
          </div>
        </div>

        <footer style={{ padding: '32px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '12px' }}>
          <button
            style={{
              flex: 1,
              padding: '14px',
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onClick={onClose}
          >
            Close Evidence Drawer
          </button>
        </footer>
      </div>
    </div>
  )
}
