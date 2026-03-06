import { useState } from 'react';
import type { RoundInfo } from '../useRaffle';
import { OWNER_P2TR } from '../config';

interface Props {
  round: RoundInfo;
  account: string | null;
  busy: boolean;
  onDraw: () => Promise<unknown>;
  onClaim: () => Promise<unknown>;
  onWithdrawFee: () => Promise<unknown>;
  onCreateRound: (price: bigint, duration: bigint) => Promise<unknown>;
}

function ActionBtn({
  label, onClick, disabled, color,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  color: 'violet' | 'green' | 'pink';
}) {
  const [pending, setPending] = useState(false);

  const gradients = {
    violet: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    green:  'linear-gradient(135deg, #10b981, #34d399)',
    pink:   'linear-gradient(135deg, #ec4899, #f472b6)',
  };
  const shadows = {
    violet: '0 4px 20px rgba(124,58,237,0.35)',
    green:  '0 4px 20px rgba(16,185,129,0.35)',
    pink:   '0 4px 20px rgba(236,72,153,0.35)',
  };
  const textColor = color === 'green' ? 'black' : 'white';

  const handleClick = async () => {
    setPending(true);
    try { await onClick(); }
    catch (e: unknown) { alert((e as Error)?.message ?? String(e)); }
    finally { setPending(false); }
  };

  const isDisabled = disabled || pending;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      style={{
        width: '100%', padding: '13px 0',
        borderRadius: 12, border: 'none',
        fontSize: 15, fontWeight: 700, color: textColor,
        background: isDisabled ? 'rgba(255,255,255,0.08)' : gradients[color],
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        boxShadow: isDisabled ? 'none' : shadows[color],
        transition: 'all 0.2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: isDisabled && !pending ? 0.4 : 1,
      }}
      onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {pending ? (
        <>
          <span style={{
            width: 16, height: 16,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            display: 'inline-block',
          }} />
          Sending...
        </>
      ) : label}
    </button>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(16,19,42,0.9)',
  border: '1px solid rgba(124,58,237,0.2)',
  borderRadius: 20,
  padding: '24px 24px',
  backdropFilter: 'blur(20px)',
};

const inputStyle: React.CSSProperties = {
  width: '100%', marginTop: 6, padding: '10px 12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(124,58,237,0.2)',
  borderRadius: 10, color: 'white', fontSize: 14,
  outline: 'none', transition: 'border-color 0.2s',
};

export default function Actions({ round, account, busy, onDraw, onClaim, onWithdrawFee, onCreateRound }: Props) {
  const [price, setPrice]       = useState('10000');
  const [duration, setDuration] = useState('144');

  const isOwner = !!(account && OWNER_P2TR &&
    OWNER_P2TR.toLowerCase() === account.toLowerCase());

  const roundEnded  = round.endBlock > 0n && round.totalTickets > 0n && !round.isDrawn;
  const canDraw     = roundEnded;
  const canClaim    = round.isDrawn && !round.prizeClaimed;
  const canWithdraw = round.prizeClaimed && !round.feeClaimed && isOwner;
  const canCreate   = isOwner;

  const hasAnyButton = canDraw || canClaim || canWithdraw || canCreate;

  if (!hasAnyButton && round.isDrawn && round.prizeClaimed && round.feeClaimed) {
    return (
      <section style={{ maxWidth: 460, margin: '0 auto 40px', padding: '0 24px' }}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Round complete. Waiting for the next round.
          </p>
          {!account && (
            <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>
              Connect the owner wallet to start a new round.
            </p>
          )}
        </div>
      </section>
    );
  }

  if (!hasAnyButton) return null;

  return (
    <section style={{
      maxWidth: 460, margin: '0 auto 60px',
      padding: '0 24px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>

      {/* Draw Winner */}
      {canDraw && (
        <div style={cardStyle}>
          <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 14 }}>
            Round has ended — trigger the provably fair draw
          </p>
          <ActionBtn
            label="🎲 Draw Winner"
            onClick={onDraw}
            disabled={busy || !account}
            color="violet"
          />
          {!account && (
            <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
              Connect wallet to draw
            </p>
          )}
        </div>
      )}

      {/* Claim Prize */}
      {canClaim && (
        <div style={cardStyle}>
          <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 14 }}>
            Winner can claim their prize on-chain
          </p>
          <ActionBtn
            label="🏆 Claim Prize"
            onClick={onClaim}
            disabled={busy || !account}
            color="green"
          />
          {!account && (
            <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
              Connect wallet to claim
            </p>
          )}
        </div>
      )}

      {/* Withdraw Fee */}
      {canWithdraw && (
        <div style={cardStyle}>
          <ActionBtn
            label="💸 Withdraw Fee (Owner)"
            onClick={onWithdrawFee}
            disabled={busy}
            color="pink"
          />
        </div>
      )}

      {/* Admin: Create New Round */}
      {canCreate && (
        <div style={cardStyle}>
          <h4 style={{
            fontSize: 14, fontWeight: 700, color: '#a855f7',
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ⚙️ Admin: Create New Round
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Ticket Price (sats)
              </label>
              <input
                type="number"
                min="1"
                value={price}
                onChange={e => setPrice(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; }}
                onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'; }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Duration (blocks)
              </label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; }}
                onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'; }}
              />
            </div>
          </div>
          <ActionBtn
            label="🚀 Create New Round"
            onClick={() => onCreateRound(BigInt(price), BigInt(duration))}
            disabled={busy}
            color="violet"
          />
        </div>
      )}
    </section>
  );
}
