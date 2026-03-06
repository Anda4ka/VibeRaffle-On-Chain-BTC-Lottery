import { CONTRACT_ADDR, shortAddr } from '../config';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(124,58,237,0.12)',
      marginTop: 40, padding: '32px 24px',
    }}>
      <div style={{
        maxWidth: 960, margin: '0 auto',
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {[
            { label: 'OPNet', href: 'https://opnet.org' },
            { label: 'GitHub', href: 'https://github.com/Anda4ka/VibeRaffle-On-Chain-BTC-Lottery' },
            { label: 'Twitter', href: 'https://x.com/AiAndark' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13, color: '#475569',
                textDecoration: 'none', fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#a855f7'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Center */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#475569' }}>
            Provably fair · No custody · Events-based payouts
          </p>
          {CONTRACT_ADDR && (
            <p style={{ fontSize: 11, color: '#334155', marginTop: 4, fontFamily: 'monospace' }}>
              {shortAddr(CONTRACT_ADDR)}
            </p>
          )}
        </div>

        {/* Right */}
        <p style={{ fontSize: 12, color: '#334155' }}>
          Built with VibeCode on OP_NET
        </p>
      </div>
    </footer>
  );
}
