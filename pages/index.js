import { useState } from 'react'
import Footer from '../components/Footer'
import Header from '../components/Header'
import SwapComponent from '../components/SwapComponent'

export default function Home() {
  const [smartAccount, setSmartAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  return (
    <div className='w-full h-screen flex flex-col items-center justify-center bg-[#2D242F]'>
      <Header smartAccount={smartAccount} setSmartAccount={setSmartAccount} provider={provider} setProvider={setProvider} />
      <SwapComponent smartAccount={smartAccount} provider={provider} />
      <Footer />
    </div>
  )
}
