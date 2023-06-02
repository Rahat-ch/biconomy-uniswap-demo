import React, { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import EthBadge from './EthBadge';
import { ChainId } from '@biconomy/core-types';
import TokenBalance from './TokenBalance';
import { ethers } from 'ethers';
import Transak from '@biconomy/transak';

function SideMenu({ isOpen, setIsOpen, smartAccount, logout, userInfo}) {
  const [value, setValue] = useState(0)
  const [balances, setBalances] = useState(null);
  const transak = new Transak('PRODUCTION', {
    walletAddress: smartAccount.address,
    userData: {
      firstName: userInfo?.name || '',
      email: userInfo?.email || '',
    },
  });
  const handleLogout = () => {
    setIsOpen(false)
    logout()
  }
  const getBalances = async () => {
    const balanceParams =
      {
        chainId: ChainId.POLYGON_MAINNET, // chainId of your choice
        eoaAddress: smartAccount.address || '',
        tokenAddresses: [], 
      };


      const balFromSdk = await smartAccount?.getAlltokenBalances(balanceParams);
      const usdBalFromSdk = await smartAccount?.getTotalBalanceInUsd(balanceParams);
      
      console.info("getAlltokenBalances", balFromSdk.data);
      console.info("getTotalBalanceInUsd", usdBalFromSdk);
      setValue(usdBalFromSdk.data.totalBalance)
      setBalances(balFromSdk.data)
  }

  useEffect(() => {
    getBalances()
  },[])
  return (
    <div>

      <Transition show={isOpen} as={React.Fragment}>
        <div
          className="fixed inset-0 overflow-hidden z-50"
          aria-labelledby="slide-over-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-opacity-75 transition-opacity"
              onClick={() => setIsOpen(false)}
            ></div>

            <section
              className="absolute inset-y-0 right-0 pl-10 max-w-full flex"
              aria-labelledby="slide-over-heading"
            >
              <div className="relative w-screen max-w-md">
                <Transition.Child
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <div className="h-screen divide-y divide-gray-200 bg-black text-white shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2
                          id="slide-over-heading"
                          className="text-lg font-medium text-white"
                        >
                          Smart Account
                        </h2>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            className="bg-black rounded-md text-white hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            {/* Replace with your icon */}
                            <svg
                              className="h-6 w-6 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className='m-2' >
                    <EthBadge address={smartAccount.address} />
                    <div className="text-white text-2xl m-4">
                      ${value.toFixed(2)}
                    </div>
                    <button onClick={() => transak.init()} className="bg-blue-500 mb-3 text-white py-2 px-4 rounded-full w-full">
                    Buy Crypto
                    </button>
                    <button onClick={() => handleLogout()} className="bg-blue-500 text-white py-2 px-4 rounded-full w-full">
                    Logout
                    </button>
                    {balances && balances.map((tok, i) => {
                    if (tok.contract_ticker_symbol == "USDC") {
                    return (
                    <TokenBalance key={i} name={tok.contract_ticker_symbol} value={parseInt(tok.balance) / 10**6} />
                    )
                    }
                    return (
                    <TokenBalance key={i} name={tok.contract_ticker_symbol} value={ethers.utils.formatEther(tok.balance)} />
                    )
                    })}
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </section>
          </div>
        </div>
      </Transition>
    </div>
  );
}

export default SideMenu;
