import type { RoundInfo } from '../useRaffle';

interface Props {
  round: RoundInfo | null;
}

export default function StatsCards({ round }: Props) {
  if (!round) return null;

  const price = Number(round.ticketPrice);
  const pool  = Number(round.prizePool);
  const fee   = Number(round.feePercent);
  const winnerPct = 100 - fee;

  const cards = [
    { label: 'TICKET PRICE', value: price > 0 ? price.toLocaleString() : '—', sub: 'sats', color: '#7c3aed' },
    { label: 'TICKETS SOLD', value: round.totalTickets.toLocaleString(), sub: `${round.totalTickets} participant${round.totalTickets !== 1n ? 's' : ''}`, color: '#a855f7' },
    { label: 'PRIZE POOL',   value: pool > 0 ? pool.toLocaleString() : '0', sub: 'sats', color: '#10b981' },
    { label: 'WINNER GETS',  value: `${winnerPct}%`, sub: 'of pool', color: '#ec4899' },
  ];

  return (
    <section style={{ maxWidth: 900, margin: '0 auto 40px', padding: '0 24px' }}>
      <div className="stats-grid">
        {cards.map(({ label, value, sub, color }) => (
          <div
            key={label}
            style={{
              background: 'rgba(16,19,42,0.8)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: 16, padding: '20px 16px',
              textAlign: 'center',
              transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              fontSize: 10, fontWeight: 600,
              color: '#475569', letterSpacing: '0.12em',
              marginBottom: 10, textTransform: 'uppercase',
            }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 6, fontWeight: 500 }}>{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
