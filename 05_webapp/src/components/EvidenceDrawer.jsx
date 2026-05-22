import React from 'react'
import { X } from 'lucide-react'

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
    zIndex: 9999, // Ensure it's above everything
    backdropFilter: 'blur(4px)'
  },
  drawer: {
    width: '100%',
    maxWidth: '500px',
    background: '#fff',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
    padding: '32px',
    overflowY: 'auto'
  }
}

export default function EvidenceDrawer({ evidence, onClose, data, country }) {
  if (!evidence || !data) return null
  const { legal_provisions = [] } = data

  const mechanismId = evidence.mechanism_id || evidence.mechanism || evidence.node_id
  const principleId = evidence.principle_id

  const provisions = legal_provisions.filter(p => {
    if (evidence.type === 'actor') {
      return (p.text && p.text.includes(evidence.label)) || (p.provision_text && p.provision_text.includes(evidence.label))
    }
    // Match against both _id, _name and the base 'mechanism'/'principle' fields found in some datasets
    // Also handle pipe-separated mechanisms in legal_provisions.json
    const matchMech = mechanismId ? (
      p.mechanism_id === mechanismId ||
      p.mechanism_name === mechanismId ||
      p.mechanism === mechanismId ||
      (p.mechanism && p.mechanism.split('|').includes(mechanismId))
    ) : true

    const matchPrin = principleId ? (
      p.principle_id === principleId ||
      p.principle_name === principleId ||
      p.principle === principleId ||
      (p.principle && p.principle.split('|').includes(principleId))
    ) : true

    return matchMech && matchPrin
  }).slice(0, 20)

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Evidence Detail</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Analytical Finding</div>
          <p style={{ lineHeight: 1.5 }}>{evidence.finding || evidence.diagnostic_interpretation || 'Functional legal basis detected.'}</p>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Supporting Provisions</div>
          {provisions.length > 0 ? provisions.map((p, i) => (
            <div key={i} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.source_id} - {p.article || 'N/A'}</div>
              <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#334155' }}>{p.provision_text || p.text}</p>
            </div>
          )) : (
            <div style={{ padding: '20px', textAlign: 'center', background: '#fffbeb', borderRadius: '12px' }}>
              No direct provisions linked for this view ({mechanismId || 'N/A'} x {principleId || 'N/A'}).
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
