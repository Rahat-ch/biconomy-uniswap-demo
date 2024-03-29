import React, { useEffect, useState, useRef } from 'react'

import { ArrowSmDownIcon } from '@heroicons/react/outline'
import SwapField from './SwapField'
import TransactionStatus from './TransactionStatus'
import { USDC, WETH } from '../utils/SupportedCoins'
import { toEth, toWei } from '../utils/ether-utils'
import { abi as IUniswapV3PoolABI} from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { abi as SwapRouterABI} from '@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json'
import { getPoolImmutables, getPoolState } from '../utils/helpers'
import { ChainId } from '@biconomy/core-types'
import { ethers } from 'ethers'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import erc20Abi from '../utils/erc20abi.json';
import { 
  IPaymaster, 
  BiconomyPaymaster,  
  IHybridPaymaster,
  PaymasterMode,
  SponsorUserOperationDto, 
} from '@biconomy/paymaster'

const SwapComponent = ({ smartAccount }) => {
  const [srcToken, setSrcToken] = useState(USDC)
  const [destToken, setDestToken] = useState(WETH)

  const [inputValue, setInputValue] = useState()
  const [outputValue, setOutputValue] = useState()

  const inputValueRef = useRef()
  const outputValueRef = useRef()

  const isReversed = useRef(false)

  const ENTER_AMOUNT = 'Enter an amount'
  const CONNECT_TO_WEB3 = 'Connect to Web3'
  const SWAP = 'Swap'

  const srcTokenObj = {
    id: 'srcToken',
    value: inputValue,
    setValue: setInputValue,
    defaultValue: srcToken,
    ignoreValue: destToken,
    setToken: setSrcToken,
  }

  const destTokenObj = {
    id: 'destToken',
    value: outputValue,
    setValue: setOutputValue,
    defaultValue: destToken,
    ignoreValue: srcToken,
    setToken: setDestToken,
  }

  const [srcTokenComp, setSrcTokenComp] = useState()
  const [destTokenComp, setDestTokenComp] = useState()

  const [swapBtnText, setSwapBtnText] = useState(ENTER_AMOUNT)
  const [txPending, setTxPending] = useState(false)


  useEffect(() => {
    // Handling the text of the submit button

    if (!smartAccount) setSwapBtnText(CONNECT_TO_WEB3)
    else if (!inputValue) setSwapBtnText(ENTER_AMOUNT)
    else setSwapBtnText(SWAP)
  }, [inputValue, outputValue, smartAccount])

  useEffect(() => {
    if (
      document.activeElement !== outputValueRef.current &&
      document.activeElement.ariaLabel !== 'srcToken' &&
      !isReversed.current
    )

    setSrcTokenComp(<SwapField obj={srcTokenObj} ref={inputValueRef} />)

    if (inputValue?.length === 0) setOutputValue('')
  }, [inputValue, destToken])

  useEffect(() => {
    if (
      document.activeElement !== inputValueRef.current &&
      document.activeElement.ariaLabel !== 'destToken' &&
      !isReversed.current
    )

    setDestTokenComp(<SwapField obj={destTokenObj} ref={outputValueRef} />)

    if (outputValue?.length === 0) setInputValue('')

  }, [outputValue, srcToken])

  useEffect(() => {
    setOutputValue("Swap for WETH")
  }, [inputValue])

  return (
    <div className='bg-zinc-900 w-[35%] p-4 px-6 rounded-xl'>
      <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
        />
      <div className='flex items-center justify-between py-4 px-1'>
        <p>Swap</p>
      </div>
      <div className='relative bg-[#212429] p-4 py-6 rounded-xl mb-2 border-[2px] border-transparent hover:border-zinc-600'>
        {srcTokenComp}

        <ArrowSmDownIcon
          className='absolute left-1/2 -translate-x-1/2 -bottom-6 h-10 p-1 bg-[#212429] border-4 border-zinc-900 text-zinc-300 rounded-xl cursor-pointer hover:scale-110'
        />
      </div>

      <div className='bg-[#212429] p-4 py-6 rounded-xl mt-2 border-[2px] border-transparent hover:border-zinc-600'>
        {destTokenComp}
      </div>

      <button
        className={getSwapBtnClassName()}
        onClick={() => {
          if (swapBtnText === SWAP) handleSwap()
        }}
      >
        {swapBtnText}
      </button>

      {txPending && <TransactionStatus />}

    </div>
  )

  async function handleSwap() {
    console.log("handle swap")
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`)
    const poolAddress = "0x45dDa9cb7c25131DF268515131f647d726f50608" // WETH/USDC
    const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
    const tokens = [
      { name: 'USDC', symbol: 'USDC', address: '"0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"', decimals: 6},
      { name: 'WETH', symbol: 'WETH', address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18},
    ];

    try {
      toast.info('Swapping USDC for Weth', {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
      console.log("before contract")
      const poolContract = new ethers.Contract(
        poolAddress,
        IUniswapV3PoolABI,
        provider
      )
        console.log("after contract")
      const immutables = await getPoolImmutables(poolContract)
      const state = await getPoolState(poolContract)
      console.log({ immutables, state})
  
      const swapRouterContract = new ethers.Contract(
        swapRouterAddress,
        SwapRouterABI,
        provider
      )
  
    // .001 => 1 000 000 000 000 000
    const amountIn = ethers.utils.parseUnits(
      inputValue.toString(),
      tokens[0].decimals
    )
  
    const approvalAmount = (amountIn * 2).toString()
    const tokenContract0 = new ethers.Contract(
      immutables.token0,
      erc20Abi,
      provider
    )
    console.log({usdc: immutables.token0, weth: immutables.token1})
    const approvalTrx = await tokenContract0.populateTransaction.approve(swapRouterAddress, approvalAmount)
    const tx1 = {
      to: immutables.token0,
      data: approvalTrx.data,
      }
    
    const address = await smartAccount.getAccountAddress()
    const params = {
      tokenIn: immutables.token0,
      tokenOut: immutables.token1,
      fee: immutables.fee,
      recipient: address,
      deadline: Math.floor(Date.now() / 1000) + (60 * 10),
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    }
    const swapTrx = await swapRouterContract.populateTransaction.exactInputSingle(params)
    // {
    //   gasLimit: ethers.utils.hexlify(1000000)
    // }
    const tx2 = {
      to: swapRouterAddress,
      data: swapTrx.data
    }

    const partialUserOp = await smartAccount.buildUserOp([ tx1, tx2 ]);
    const biconomyPaymaster = smartAccount.paymaster;

    let finalUserOp = partialUserOp;
    console.log({ finalUserOp })
    console.log({ partialUserOp })
    console.log("before fee quotes response")
    const feeQuotesResponse = await biconomyPaymaster.getPaymasterFeeQuotesOrData(
      partialUserOp,
      {
          mode: PaymasterMode.ERC20,
          smartAccountInfo: {
            name: 'BICONOMY',
            version: '2.0.0'
          },
          tokenList: [],
      }
      ); 
      console.log("after fee quote")
      const feeQuotes = feeQuotesResponse.feeQuotes;
      console.log({ feeQuotes })
      function findUSDCObject(data) {
        return data.find(item => item.symbol === "USDC");
    }
      const spender = feeQuotesResponse.tokenPaymasterAddress || "";
      const usdcFeeQuotes = findUSDCObject(feeQuotes)
      console.log({ usdcFeeQuotes })
      finalUserOp = await smartAccount.buildTokenPaymasterUserOp(partialUserOp, {
        feeQuote: usdcFeeQuotes,
        spender: spender,
        maxApproval: false,
    });
    
    let paymasterServiceData = {
        mode: PaymasterMode.ERC20,
        feeTokenAddress: usdcFeeQuotes.tokenAddress,
        calculateGasLimits: true, // Always recommended and especially when using token paymaster
    };

    try{
      const paymasterAndDataWithLimits =
        await biconomyPaymaster.getPaymasterAndData(
          finalUserOp,
          paymasterServiceData
        );
      finalUserOp.paymasterAndData = paymasterAndDataWithLimits.paymasterAndData;
  
      // below code is only needed if you sent the flag calculateGasLimits = true
      if (
        paymasterAndDataWithLimits.callGasLimit &&
        paymasterAndDataWithLimits.verificationGasLimit &&
        paymasterAndDataWithLimits.preVerificationGas
      ) {
  
        // Returned gas limits must be replaced in your op as you update paymasterAndData.
        // Because these are the limits paymaster service signed on to generate paymasterAndData
        // If you receive AA34 error check here..   
  
        finalUserOp.callGasLimit = paymasterAndDataWithLimits.callGasLimit;
        finalUserOp.verificationGasLimit =
          paymasterAndDataWithLimits.verificationGasLimit;
        finalUserOp.preVerificationGas =
          paymasterAndDataWithLimits.preVerificationGas;
      }
    } catch (e) {
      console.log("error received ", e);
    }

    try {
      const paymasterAndDataWithLimits =
          await biconomyPaymaster.getPaymasterAndData(
              finalUserOp,
              paymasterServiceData
          );
      finalUserOp.paymasterAndData = paymasterAndDataWithLimits.paymasterAndData;
  } catch (e) {
      console.log("error received ", e);
  }

  try {
    const userOpResponse = await smartAccount.sendUserOp(finalUserOp);
    const transactionDetails = await userOpResponse.wait(1);
    console.log("txHash", transactionDetails.receipt.transactionHash);
    const txLink = `https://polygonscan.com/tx/${transactionDetails.receipt.transactionHash}`
    toast.success(<a href={txLink} target='_blank' rel="noreferrer">Success! Click here for your transaction!</a>, {
      position: "top-right",
      autoClose: 15000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      });
} catch (e) {
    console.log("error received ", e);
}

    } catch (error) {
      console.log(error)
    }
  }


  function getSwapBtnClassName() {
    let className = 'p-4 w-full my-2 rounded-xl'
    className +=
      swapBtnText === ENTER_AMOUNT || swapBtnText === CONNECT_TO_WEB3
        ? ' text-zinc-400 bg-zinc-800 pointer-events-none'
        : ' bg-blue-700'
    return className
  }

}

export default SwapComponent
