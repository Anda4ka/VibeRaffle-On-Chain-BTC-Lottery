import { shortAddr } from '../config';

interface Props {
  account: string | null;
  onConnect: () => void;
  loading: boolean;
}

export default function Header({ account, onConnect, loading }: Props) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      height: 68,
      borderBottom: '1px solid rgba(124,58,237,0.15)',
      backdropFilter: 'blur(20px)',
      background: 'rgba(8,10,20,0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: 'white',
          boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
          flexShrink: 0,
        }}>V</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>
            <span style={{ color: 'white' }}>Vibe</span>
            <span style={{ color: '#a855f7' }}>Raffle</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', letterSpacing: '0.12em' }}>
            BITCOIN L1 LOTTERY
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 20, padding: '5px 12px',
          fontSize: 12, fontWeight: 600, color: '#10b981',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
            animation: 'pulse 2s infinite',
            display: 'inline-block',
          }} />
          OPNet Testnet
        </div>

        {account ? (
          <div style={{
            padding: '8px 16px',
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            color: '#a855f7', fontFamily: 'monospace',
          }}>
            {shortAddr(account)}
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              border: 'none', borderRadius: 10, padding: '9px 20px',
              fontSize: 14, fontWeight: 700, color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  );
}
