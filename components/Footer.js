import React from 'react'
import TokenBalance from './TokenBalance'

const Footer = () => {
  return (
    <div className='flex flex-col fixed bottom-4 left-1/2 -translate-x-1/2'>
         <img src='./pbb.svg' className='h-12' />
         <p className='text-sm'>Made with ❤ by <a href="https://twitter.com/Rahatcodes" target='_blank' rel="noreferrer">Rahat</a></p>
    </div>
  )
}

export default Footer
