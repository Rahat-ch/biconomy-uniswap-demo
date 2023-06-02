import React, { useState } from 'react'
import { ArrowSmUpIcon } from '@heroicons/react/outline'

const NavItems = () => {
  const SWAP = 'Swap'
  const DOCS = 'Biconomy Docs'

  const [selectedNavItem, setSelectedNavItem] = useState(SWAP)

  return (
    <div className='bg-zinc-900 h-fit flex items-center justify-around rounded-full mx-6'>
      <p
        className={getNavIconClassName(SWAP)}
        onClick={() => setSelectedNavItem(SWAP)}
      >
        {SWAP}
      </p>
      <p
        className={getNavIconClassName(DOCS)}
        onClick={() => window.open('https://docs.biconomy.io/', '_blank')}
      >
        {DOCS}
        <ArrowSmUpIcon className='h-4 rotate-45' />
      </p>
    </div>
  )

  function getNavIconClassName(name) {
    let className =
      'p-1 px-4 cursor-pointer border-[4px] border-transparent flex items-center'
    className +=
      name === selectedNavItem
        ? ' bg-zinc-800 border-zinc-900 rounded-full'
        : ''
    return className
  }
}

export default NavItems
