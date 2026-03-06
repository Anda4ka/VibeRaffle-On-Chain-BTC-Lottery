import { useState, useEffect } from 'react';
import type { RoundInfo } from '../useRaffle';

interface Props {
  round: RoundInfo | null;
  currentBlock: bigint;
}

function useCountdown(endBlock: bigint, currentBlock: bigint) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (endBlock === 0n || currentBlock === 0n) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };

  const blocksLeft = endBlock > currentBlock ? Number(endBlock - currentBlock) : 0;
  if (blocksLeft === 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };

  void now;
  const secondsLeft = blocksLeft * 300;
  const days    = Math.floor(secondsLeft / 86400);
  const hours   = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = Math.floor(secondsLeft % 60);

  return { days, hours, minutes, seconds, ended: false };
}

function TimerBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="timer-box" style={{
      background: 'rgba(124,58,237,0.12)',
      border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: 14, padding: '14px 20px',
      minWidth: 72, textAlign: 'center',
    }}>
      <div className="timer-box-num" style={{
        fontSize: 36, fontWeight: 800,
        color: '#a855f7', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{
        fontSize: 9, fontWeight: 600,
        color: '#64748b', letterSpacing: '0.1em',
        marginTop: 6, textTransform: 'uppercase',
      }}>{label}</div>
    </div>
  );
}

export default function Hero({ round, currentBlock }: Props) {
  const prizePool = round?.prizePool ?? 0n;
  const sats = Number(prizePool);
  const { days, hours, minutes, seconds, ended } = useCountdown(round?.endBlock ?? 0n, currentBlock);
  const roundNum = round?.roundNumber !== undefined ? Number(round.roundNumber) : 1;

  return (
    <section style={{
      textAlign: 'center',
      padding: '60px 24px 40px',
      maxWidth: 700,
      margin: '0 auto',
    }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(124,58,237,0.1)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: 20, padding: '4px 14px',
        fontSize: 11, fontWeight: 600,
        color: '#a855f7', letterSpacing: '0.1em',
        marginBottom: 24,
      }}>
        🎰 ROUND #{roundNum} · {round?.isDrawn ? 'COMPLETE' : round ? 'LIVE NOW' : 'LOADING...'}
      </div>

      {/* Label */}
      <div style={{
        fontSize: 12, fontWeight: 600,
        color: '#64748b', letterSpacing: '0.15em',
        marginBottom: 12,
      }}>
        CURRENT PRIZE POOL
      </div>

      {/* Prize number */}
      <div style={{
        fontSize: 80, fontWeight: 900, lineHeight: 1,
        color: '#10b981',
        animation: 'prizeGlow 3s ease-in-out infinite',
      }}>
        {sats > 0 ? sats.toLocaleString() : '0'}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 600,
        color: '#10b981', opacity: 0.7,
        marginTop: 6, marginBottom: 36,
        letterSpacing: '0.2em',
      }}>
        SATS
      </div>

      {/* Countdown */}
      {round && !round.isDrawn && !ended && (
        <>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: '#64748b', letterSpacing: '0.15em',
            marginBottom: 16,
          }}>
            ROUND ENDS IN
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <TimerBox value={days} label="Days" />
            <TimerBox value={hours} label="Hours" />
            <TimerBox value={minutes} label="Mins" />
            <TimerBox value={seconds} label="Secs" />
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: '#475569', fontWeight: 500 }}>
            Block{' '}
            <span style={{ color: '#7c3aed', fontWeight: 700 }}>
              {currentBlock.toLocaleString()}
            </span>
            {' / '}
            <span style={{ color: '#64748b' }}>
              {round.endBlock.toLocaleString()}
            </span>
          </div>
        </>
      )}

      {/* Round ended — ready to draw */}
      {round && !round.isDrawn && ended && round.totalTickets > 0n && (
        <div style={{
          marginTop: 24,
          background: 'rgba(236,72,153,0.1)',
          border: '1px solid rgba(236,72,153,0.3)',
          borderRadius: 16, padding: '20px 28px',
          display: 'inline-block',
        }}>
          <p style={{ color: '#ec4899', fontWeight: 700, fontSize: 18 }}>
            Round Ended — Ready to Draw!
          </p>
          <p style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>
            Anyone can trigger the draw after block {(round.endBlock + 2n).toLocaleString()}
          </p>
        </div>
      )}

      {/* Winner selected */}
      {round?.isDrawn && (
        <div style={{
          marginTop: 24,
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 16, padding: '20px 28px',
          display: 'inline-block',
          maxWidth: 480,
          margin: '24px auto 0',
        }}>
          <p style={{ color: '#10b981', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            🏆 Winner Selected!
          </p>
          <p style={{
            color: '#94a3b8', fontSize: 11, fontFamily: 'monospace',
            wordBreak: 'break-all',
          }}>{round.winner}</p>
          {!round.prizeClaimed && (
            <p style={{ color: '#ec4899', fontSize: 12, marginTop: 8, fontWeight: 600 }}>
              Prize awaiting claim...
            </p>
          )}
          {round.prizeClaimed && round.feeClaimed && (
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>Round complete ✓</p>
          )}
        </div>
      )}
    </section>
  );
}
