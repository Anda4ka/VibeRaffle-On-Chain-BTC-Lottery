const steps = [
  {
    num: '01',
    title: 'Connect',
    desc: 'Link your OP_WALLET to the dApp. No sign-up, no KYC.',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  },
  {
    num: '02',
    title: 'Buy Tickets',
    desc: 'Choose how many tickets. Pay in BTC sats. More tickets = higher chance.',
    icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  },
  {
    num: '03',
    title: 'Wait for Draw',
    desc: 'When the round ends, anyone can trigger the provably fair draw.',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    num: '04',
    title: 'Claim Prize',
    desc: 'Winner claims on-chain. BTC payout is issued automatically.',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

export default function HowItWorks() {
  return (
    <section style={{
      maxWidth: 960, margin: '0 auto',
      padding: '60px 24px 40px',
    }}>
      <h3 style={{
        fontSize: 28, fontWeight: 800,
        textAlign: 'center', marginBottom: 40, color: 'white',
      }}>
        How It{' '}
        <span style={{ color: '#a855f7' }}>Works</span>
      </h3>

      <div className="hiw-grid">
        {steps.map(step => (
          <div
            key={step.num}
            style={{
              background: 'rgba(16,19,42,0.8)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: 18, padding: '28px 20px',
              textAlign: 'center',
              transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
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
              width: 48, height: 48, margin: '0 auto 16px',
              borderRadius: 14,
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg
                width={24} height={24}
                fill="none" stroke="#a855f7"
                viewBox="0 0 24 24"
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              >
                <path d={step.icon} />
              </svg>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: 'rgba(168,85,247,0.5)',
              letterSpacing: '0.15em',
            }}>{step.num}</span>
            <h4 style={{
              fontSize: 16, fontWeight: 700,
              color: 'white', margin: '6px 0 10px',
            }}>{step.title}</h4>
            <p style={{
              fontSize: 12, color: '#64748b',
              lineHeight: 1.6,
            }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
