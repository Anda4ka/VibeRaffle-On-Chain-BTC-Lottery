/**
 * useRaffle — React hook for reading and writing VibeRaffle contract state.
 *
 * Reads:   getRoundInfo() via JSONRpcProvider (no wallet needed)
 * Writes:  window.opnet wallet API or SDK fallback
 */

import { useState, useEffect, useCallback } from 'react';
import { getContract, JSONRpcProvider } from 'opnet';
import { Address } from '@btc-vision/transaction';
import { networks } from '@btc-vision/bitcoin';
import { CONTRACT_ADDR, NETWORK_NAME, RPC_URL } from './config';

const RESOLVED_RPC = typeof RPC_URL === 'string' && RPC_URL ? RPC_URL : 'https://testnet.opnet.org';

// ── Types ────────────────────────────────────────────────────────────────────
export interface RoundInfo {
  ticketPrice:  bigint;
  endBlock:     bigint;
  totalTickets: bigint;
  prizePool:    bigint;
  isDrawn:      boolean;
  prizeClaimed: boolean;
  feeClaimed:   boolean;
  winner:       string;
  feePercent:   bigint;
  owner:        string;
}

// ── ABI ─────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ABI: any[] = [
  { name: 'getRoundInfo', type: 'function', constant: true, inputs: [], outputs: [
    { name: 'ticketPrice',  type: 'UINT256' },
    { name: 'endBlock',     type: 'UINT64'  },
    { name: 'totalTickets', type: 'UINT256' },
    { name: 'prizePool',    type: 'UINT256' },
    { name: 'isDrawn',      type: 'BOOL'    },
    { name: 'prizeClaimed', type: 'BOOL'    },
    { name: 'feeClaimed',   type: 'BOOL'    },
    { name: 'winner',       type: 'ADDRESS' },
    { name: 'feePercent',   type: 'UINT64'  },
    { name: 'owner',        type: 'ADDRESS' },
  ]},
  { name: 'createRound', type: 'function', inputs: [
    { name: 'ticketPrice',    type: 'UINT256' },
    { name: 'durationBlocks', type: 'UINT64'  },
  ], outputs: [{ name: 'success', type: 'BOOL' }]},
  { name: 'buyTickets', type: 'function', payable: true, inputs: [
    { name: 'count', type: 'UINT32' },
  ], outputs: [{ name: 'success', type: 'BOOL' }]},
  { name: 'drawWinner',  type: 'function', inputs: [], outputs: [{ name: 'success', type: 'BOOL' }]},
  { name: 'claimPrize',  type: 'function', inputs: [], outputs: [{ name: 'winnerAmount', type: 'UINT256' }]},
  { name: 'withdrawFee', type: 'function', inputs: [], outputs: [{ name: 'feeAmount', type: 'UINT256' }]},
];

const NETWORK = NETWORK_NAME === 'regtest' ? networks.regtest
              : NETWORK_NAME === 'mainnet' ? networks.bitcoin
              :                              networks.testnet;

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useRaffle() {
  const [round, setRound]               = useState<RoundInfo | null>(null);
  const [account, setAccount]           = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [txPending, setTxPending]       = useState(false);
  const [currentBlock, setCurrentBlock] = useState<bigint>(0n);

  // ── Connect wallet ────────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    const opnet = (window as any).opnet;
    if (!opnet) {
      setError('OP_WALLET not found. Install the OPNet browser extension.');
      return;
    }
    try {
      const accounts: string[] = await opnet.requestAccounts();
      setAccount(accounts[0] ?? null);
      setError(null);
    } catch (e: any) {
      setError(`Connect failed: ${e?.message ?? e}`);
    }
  }, []);

  // ── Read state ────────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!CONTRACT_ADDR) { setError('CONTRACT_ADDR not set'); return; }
    setLoading(true);
    setError(null);
    try {
      const provider = new JSONRpcProvider(RESOLVED_RPC, NETWORK);

      // Get current block
      try {
        const blockNum = await provider.getBlockNumber();
        setCurrentBlock(blockNum);
      } catch { /* ignore */ }

      const contract = getContract(
        CONTRACT_ADDR,
        ABI,
        provider,
        NETWORK,
        Address.dead(),
      );
      const result = await (contract as any).getRoundInfo();
      if (result?.revert) throw new Error(result.revert);
      const p = result?.properties ?? {};
      setRound({
        ticketPrice:  p.ticketPrice  ?? 0n,
        endBlock:     p.endBlock     ?? 0n,
        totalTickets: p.totalTickets ?? 0n,
        prizePool:    p.prizePool    ?? 0n,
        isDrawn:      p.isDrawn      ?? false,
        prizeClaimed: p.prizeClaimed ?? false,
        feeClaimed:   p.feeClaimed   ?? false,
        winner:       p.winner?.p2op?.(NETWORK) ?? p.winner?.toString?.()  ?? '',
        feePercent:   p.feePercent   ?? 5n,
        owner:        p.owner?.p2op?.(NETWORK)  ?? p.owner?.toString?.()   ?? '',
      });
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Send transaction ──────────────────────────────────────────────────────
  async function opnetSend(methodName: string, args: unknown[], satoshis = 0n) {
    const opnet = (window as any).opnet;
    if (!opnet) throw new Error('OP_WALLET not detected.');
    if (!account) throw new Error('Wallet not connected.');

    setTxPending(true);
    try {
      const provider = new JSONRpcProvider(RESOLVED_RPC, NETWORK);

      const contract = getContract(
        CONTRACT_ADDR, ABI, provider, NETWORK, Address.dead(),
      );

      // Encode calldata directly — avoids testnet simulation OOM
      const calldata = (contract as any).encodeCalldata(methodName, args);

      // Resolve contract's hex pubkey for the wallet
      const resolvedAddress = await provider.getPublicKeyInfo(CONTRACT_ADDR, true);
      if (!resolvedAddress) throw new Error(`Cannot resolve contract: ${CONTRACT_ADDR}`);
      const contractHex: string = (resolvedAddress as any).toHex?.()
        ?? (resolvedAddress as any).toString();

      // Get fresh UTXOs and PoW challenge
      const utxos = await provider.utxoManager.getUTXOs({ address: account });
      if (utxos.length === 0) throw new Error('No UTXOs. Fund your wallet with testnet BTC.');
      const challenge = await provider.getChallenge();

      // OP_WALLET web3 API — signs and broadcasts without running full simulation
      const result = await (opnet as any).web3.signAndBroadcastInteraction({
        from:       account,
        to:         CONTRACT_ADDR,
        contract:   contractHex,
        utxos,
        calldata,
        challenge,
        feeRate:    10,
        priorityFee: 0n,
        gasSatFee:  10_000n,
        network:    NETWORK,
        ...(satoshis > 0n ? { satoshis } : {}),
      });

      return result;
    } finally {
      setTxPending(false);
      setTimeout(refresh, 5_000);
    }
  }

  // ── Public actions ────────────────────────────────────────────────────────
  const createRound = (ticketPrice: bigint, durationBlocks: bigint) =>
    opnetSend('createRound', [ticketPrice, durationBlocks]);

  const buyTickets = (count: number, ticketPrice: bigint) =>
    opnetSend('buyTickets', [count], ticketPrice * BigInt(count));

  const drawWinner  = () => opnetSend('drawWinner', []);
  const claimPrize  = () => opnetSend('claimPrize', []);
  const withdrawFee = () => opnetSend('withdrawFee', []);

  // ── Auto-refresh ──────────────────────────────────────────────────────────
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 20_000);
    return () => clearInterval(timer);
  }, [refresh]);

  return {
    round,
    account,
    loading,
    error,
    txPending,
    currentBlock,
    refresh,
    connectWallet,
    createRound,
    buyTickets,
    drawWinner,
    claimPrize,
    withdrawFee,
  };
}
