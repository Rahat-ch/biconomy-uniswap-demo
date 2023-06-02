import React, { useEffect, useState } from 'react'
import TokenBalance from './TokenBalance'

import { ConnectButton } from '@rainbow-me/rainbowkit'

import { useAccount } from 'wagmi'

import toast, { Toaster } from 'react-hot-toast'
import NavItems from './NavItems'
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ConnectDynamic = dynamic(
  () => import("../components/Connect").then((res) => res.default),
  {
    ssr: false,
  }
);

const Header = ({ smartAccount, setSmartAccount, provider, setProvider }) => {


  return (
    <div className='fixed left-0 top-0 w-full px-8 py-4 flex items-center justify-between'>
      <div className='flex items-center'>
        <img src='./logo.png' className='h-12' />
        <NavItems />
      </div>
      <div className='flex'>
        <ConnectDynamic smartAccount={smartAccount} setSmartAccount={setSmartAccount} provider={provider} setProvider={setProvider}  />
      </div>

      <Toaster />
    </div>
  )
}

export default Header
