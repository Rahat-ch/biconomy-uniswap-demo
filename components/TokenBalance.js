import React, { useEffect, useState, useRef } from 'react'

const TokenBalance = ({ name, value }) => {
  const [balance, setBalance] = useState('-')
  useEffect(() => {
    if(value) {
      setBalance(value)
    }
  },[value])
  return (
    <div className='flex mx-4 mt-3'>
      <div className='flex items-center bg-zinc-900 text-zinc-300 w-fit p-2 px-3 rounded-l-lg'>
        <p className='text-sm'>{name}</p>
        <p className='bg-zinc-800 p-0.5 px-3 ml-3 rounded-lg text-zinc-100'>
          {balance}
        </p>
      </div>
    </div>
  )
}

export default TokenBalance
