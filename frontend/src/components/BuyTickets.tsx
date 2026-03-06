import { useState } from 'react';
import confetti from 'canvas-confetti';
import type { RoundInfo } from '../useRaffle';

interface Props {
  round: RoundInfo;
  account: string | null;
  busy: boolean;
  myTickets: number;
  onBuy: (count: number, price: bigint) => Promise<unknown>;
  onConnect: () => void;
}

const S = {
  card: {
    background: 'rgba(16,19,42,0.9)',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: 24,
    padding: '32px 28px',
    backdropFilter: 'blur(20px)',
  } as React.CSSProperties,
  stepBtn: {
    width: 44, height: 44,
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: 12, fontSize: 22,
    fontWeight: 700, color: '#a855f7',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  } as React.CSSProperties,
};

export default function BuyTickets({ round, account, busy, myTickets, onBuy, onConnect }: Props) {
  const [count, setCount]   = useState(1);
  const [buying, setBuying] = useState(false);

  const price     = round.ticketPrice;
  const totalSats = Number(price * BigInt(count));

  const totalTickets  = Number(round.totalTickets);
  const afterBuy      = myTickets + count;
  const afterTotal    = totalTickets + count;
  const winChance     = afterTotal > 0 ? (afterBuy / afterTotal) * 100 : 0;
  const currentChance = totalTickets > 0 && myTickets > 0
    ? (myTickets / totalTickets) * 100
    : 0;

  const handleBuy = async () => {
    if (!account) { onConnect(); return; }
    setBuying(true);
    try {
      await onBuy(count, price);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#10b981', '#ec4899', '#F7931A'],
      });
    } catch (e: unknown) {
      alert((e as Error)?.message ?? String(e));
    } finally {
      setBuying(false);
    }
  };

  if (round.isDrawn || price === 0n) return null;

  return (
    <section style={{ maxWidth: 460, margin: '0 auto 60px', padding: '0 24px' }}>
      <div style={S.card}>
        <h2 style={{
          fontSize: 22, fontWeight: 800,
          textAlign: 'center', marginBottom: 8, color: 'white',
        }}>Buy Tickets</h2>
        <p style={{
          fontSize: 12, color: '#64748b',
          textAlign: 'center', marginBottom: 28,
        }}>
          More tickets = higher chance to win
        </p>

        {/* My tickets — current state */}
        {account && myTickets > 0 && (
          <div style={{
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 12, padding: '14px 16px',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: '#94a3b8' }}>Your tickets</span>
              <span style={{ fontWeight: 700, color: '#a855f7' }}>{myTickets} / {totalTickets}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#94a3b8' }}>Win chance</span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>{currentChance.toFixed(1)}%</span>
            </div>
            <div style={{
              marginTop: 10, height: 4, borderRadius: 4,
              background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: 'linear-gradient(90deg, #7c3aed, #10b981)',
                width: `${Math.min(currentChance, 100)}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        )}

        {/* Stepper */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 16,
          marginBottom: 20,
        }}>
          <button
            style={S.stepBtn}
            onClick={() => setCount(c => Math.max(1, c - 1))}
          >−</button>

          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: 'white', lineHeight: 1 }}>{count}</div>
            <div style={{
              fontSize: 11, color: '#64748b',
              fontWeight: 600, letterSpacing: '0.1em', marginTop: 2,
            }}>
              TICKET{count !== 1 ? 'S' : ''}
            </div>
          </div>

          <button
            style={S.stepBtn}
            onClick={() => setCount(c => c + 1)}
          >+</button>
        </div>

        {/* Price summary */}
        <div style={{
          background: 'rgba(124,58,237,0.06)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: 14, padding: '16px 20px',
          marginBottom: 16, textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
            {count} × {Number(price).toLocaleString()} sats
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
            {totalSats.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
            SATS · ~{(totalSats / 100_000_000).toFixed(6)} BTC
          </div>
        </div>

        {/* After-buy win chance preview */}
        {account && afterTotal > 0 && (
          <p style={{
            fontSize: 12, textAlign: 'center',
            color: '#475569', marginBottom: 20,
          }}>
            After buying:{' '}
            <span style={{ color: '#a855f7', fontWeight: 700 }}>{afterBuy}</span> tickets →{' '}
            <span style={{ color: '#10b981', fontWeight: 700 }}>{winChance.toFixed(1)}%</span> win chance
          </p>
        )}

        {/* Buy button */}
        <button
          onClick={handleBuy}
          disabled={busy || buying}
          style={{
            width: '100%', padding: '14px 0',
            borderRadius: 14, border: 'none',
            fontSize: 16, fontWeight: 800, color: 'black',
            background: busy || buying
              ? 'rgba(16,185,129,0.4)'
              : 'linear-gradient(135deg, #10b981, #34d399)',
            cursor: busy || buying ? 'not-allowed' : 'pointer',
            boxShadow: busy || buying ? 'none' : '0 4px 24px rgba(16,185,129,0.35)',
            transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
          onMouseEnter={e => { if (!busy && !buying) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {buying ? (
            <>
              <span style={{
                width: 18, height: 18,
                border: '2px solid rgba(0,0,0,0.4)',
                borderTopColor: 'black',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }} />
              Processing...
            </>
          ) : account ? (
            `Buy ${count} Ticket${count !== 1 ? 's' : ''} Now`
          ) : (
            'Connect Wallet to Buy'
          )}
        </button>
      </div>
    </section>
  );
}
