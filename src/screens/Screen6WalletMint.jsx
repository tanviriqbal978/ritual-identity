import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract'

// Screen 6 — Connect Wallet → Confirm Mint
export default function Screen6WalletMint({ twitterHandle, walletAddress, isConnected, onConnectWallet, onMinted }) {
  const [phase, setPhase] = useState(isConnected ? 'ready' : 'connect')
  const [errorMsg, setErrorMsg] = useState('')

  const { writeContract, data: txHash, isError: writeError, error: writeErr } = useWriteContract()
  const { isLoading: isTxPending } = useWaitForTransactionReceipt({
    hash: txHash,
    onSuccess: (receipt) => {
      const tokenId = receipt?.logs?.[0]?.topics?.[2]
      setPhase('success')
      setTimeout(() => onMinted(tokenId ? parseInt(tokenId, 16) : null), 1200)
    },
  })

  // Watch wallet connect
  useEffect(() => {
    if (isConnected && phase === 'connect') setPhase('ready')
  }, [isConnected])

  useEffect(() => {
    if (writeError) {
      setPhase('error')
      setErrorMsg(writeErr?.message?.slice(0, 100) || 'Transaction failed')
    }
  }, [writeError])

  const handleMint = () => {
    setPhase('minting')
    setErrorMsg('')
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'mint',
      args: [twitterHandle],
    })
  }

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null

  const isBusy = phase === 'minting' || isTxPending

  return (
    <motion.div
      key="screen6wm"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.6 }}
      style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020a04', overflow: 'hidden', zIndex: 2, paddingTop: '52px' }}
    >
      <div className="corner-tl" /><div className="corner-tr" />
      <div className="corner-bl" /><div className="corner-br" />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,255,136,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        style={{ position: 'relative', zIndex: 10, background: 'rgba(0,10,4,0.9)', border: '1px solid rgba(0,255,136,0.25)', boxShadow: '0 0 40px rgba(0,255,136,0.08)', padding: 'clamp(28px,5vw,52px) clamp(28px,6vw,60px)', width: 'min(440px, 90vw)', clipPath: 'polygon(16px 0%, 100% 0%, calc(100% - 16px) 100%, 0% 100%)', textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.4em', marginBottom: '6px' }}>◈ STEP 06 ◈</div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.2rem,3.5vw,1.8rem)', color: 'var(--green-bright)', letterSpacing: '0.2em', textTransform: 'uppercase', textShadow: '0 0 24px rgba(0,255,136,0.6)', marginBottom: '8px' }}>
          {phase === 'success' ? 'MINTED ✓' : 'CONFIRM MINT'}
        </h2>
        <div style={{ width: '120px', height: '1px', margin: '0 auto 24px', background: 'linear-gradient(90deg, transparent, var(--green-bright), transparent)' }} />

        <AnimatePresence mode="wait">

          {/* CONNECT phase */}
          {phase === 'connect' && (
            <motion.div key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--green-mid)', letterSpacing: '0.15em', marginBottom: '24px', lineHeight: 1.8 }}>
                Connect your wallet to mint<br />
                <span style={{ color: 'var(--green-bright)' }}>@{twitterHandle}</span> on-chain.
              </div>
              <button className="btn-ritual" onClick={onConnectWallet} style={{ width: '100%', marginBottom: '0' }}>
                CONNECT WALLET
              </button>
            </motion.div>
          )}

          {/* READY phase */}
          {phase === 'ready' && (
            <motion.div key="ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Wallet badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.06)', marginBottom: '20px' }}>
                <span style={{ color: 'var(--green-bright)', fontSize: '0.7rem' }}>✓</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--green-mid)', letterSpacing: '0.1em' }}>{shortAddr}</span>
              </div>

              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.15em', marginBottom: '24px', lineHeight: 1.9 }}>
                IDENTITY: <span style={{ color: 'var(--green-bright)' }}>@{twitterHandle}</span><br />
                CHAIN: <span style={{ color: 'var(--green-mid)' }}>RITUAL · 1979</span><br />
                GAS: <span style={{ color: 'var(--green-mid)' }}>ESTIMATED ON SIGN</span>
              </div>

              <button className="btn-ritual" onClick={handleMint} style={{ width: '100%' }}>
                MINT IDENTITY
              </button>
            </motion.div>
          )}

          {/* MINTING phase */}
          {isBusy && (
            <motion.div key="minting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: '20px' }}>
                <MintingSpinner />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--green-bright)', letterSpacing: '0.3em' }}>
                MINTING...
              </div>
              {txHash && (
                <div style={{ marginTop: '12px', fontFamily: 'var(--font-body)', fontSize: '0.58rem', color: 'var(--text-dim)', wordBreak: 'break-all', letterSpacing: '0.06em' }}>
                  TX: {txHash.slice(0, 24)}...
                </div>
              )}
            </motion.div>
          )}

          {/* SUCCESS */}
          {phase === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 250 }}
                style={{ fontSize: '3rem', marginBottom: '12px', filter: 'drop-shadow(0 0 20px rgba(0,255,136,0.7))' }}
              >✓</motion.div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--green-mid)', letterSpacing: '0.2em' }}>
                IDENTITY CONFIRMED
              </div>
            </motion.div>
          )}

          {/* ERROR */}
          {phase === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#ff4466', letterSpacing: '0.1em', marginBottom: '20px', lineHeight: 1.7 }}>
                {errorMsg || 'Transaction failed'}
              </div>
              <button className="btn-ritual" onClick={() => setPhase('ready')} style={{ width: '100%' }}>
                TRY AGAIN
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function MintingSpinner() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ display: 'block', margin: '0 auto' }}>
      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(0,255,136,0.15)" strokeWidth="3" />
      <circle cx="24" cy="24" r="20" fill="none" stroke="#00ff88" strokeWidth="3"
        strokeDasharray="30 96" strokeLinecap="round"
        style={{ transformOrigin: '24px 24px', animation: 'spin 1s linear infinite' }}
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </svg>
  )
}
