import { Toaster } from 'react-hot-toast';
import { useRaffle } from './useRaffle';
import Header from './components/Header';
import Hero from './components/Hero';
import StatsCards from './components/StatsCards';
import BuyTickets from './components/BuyTickets';
import Actions from './components/Actions';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

export default function App() {
  const {
    round, account, loading, error, txPending, currentBlock, myTickets,
    refresh, connectWallet, createRound, buyTickets, drawWinner, claimPrize, withdrawFee,
  } = useRaffle();

  const busy = txPending || loading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#10132a',
            color: '#e2e8f0',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '12px',
          },
        }}
      />

      <Header account={account} onConnect={connectWallet} loading={loading} />

      {error && (
        <div style={{ maxWidth: 900, margin: '12px auto 0', padding: '0 24px', width: '100%' }}>
          <div style={{
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            fontSize: 13, color: '#f87171',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>{error}</span>
            <button
              onClick={refresh}
              style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 12, marginLeft: 12 }}
            >Retry</button>
          </div>
        </div>
      )}

      <Hero round={round} currentBlock={currentBlock} />

      <StatsCards round={round} />

      {round && (
        <BuyTickets
          round={round}
          account={account}
          busy={busy}
          myTickets={myTickets}
          onBuy={buyTickets}
          onConnect={connectWallet}
        />
      )}

      {round && (
        <Actions
          round={round}
          account={account}
          busy={busy}
          onDraw={drawWinner}
          onClaim={claimPrize}
          onWithdrawFee={withdrawFee}
          onCreateRound={createRound}
        />
      )}

      <HowItWorks />
      <Footer />
    </div>
  );
}
