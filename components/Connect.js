import React, {useState, useRef, useEffect} from 'react';
import SocialLogin from "@biconomy/web3-auth"
import { ChainId } from "@biconomy/core-types";
import { ethers } from 'ethers'
import SmartAccount from "@biconomy/smart-account";
import Image from 'next/image';
import SideMenu from './SideMenu';

const Connect = ({ smartAccount, setSmartAccount, provider, setProvider}) => {
  const [interval, enableInterval] = useState(false)
  const sdkRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  function truncateAddress(add) {
    const len = add.length;
    if (len < 11) return add;
    return add.substring(0, 6) + "..." + add.substring(len - 4, len);
  }

  useEffect(() => {
    let configureLogin
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          setupSmartAccount()
          clearInterval(configureLogin)
        }
      }, 1000)
    }
  }, [interval])

  async function login() {
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin()
      const signature1 = await socialLoginSDK.whitelistUrl('https://aaswap.vercel.app')
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MAINNET).toString(),
        network: "mainnet",
        whitelistUrls: {
          'https://aaswap.vercel.app': signature1,
        }
      })
      sdkRef.current = socialLoginSDK
    }
    if (!sdkRef.current.provider) {
      sdkRef.current.showWallet()
      enableInterval(true)
    } else {
      setupSmartAccount()
    }
  }

  async function setupSmartAccount() {
    if (!sdkRef?.current?.provider) {
      setUserInfo( await sdkRef?.current?.getUserInfo())
      console.log(userInfo)
      return
    }
    sdkRef.current.hideWallet()
    setLoading(true)
    const web3Provider = new ethers.providers.Web3Provider(
      sdkRef.current.provider
    )
    setProvider(web3Provider)
    try {
      const smartAccount = new SmartAccount(web3Provider, {
        activeNetworkId: ChainId.POLYGON_MAINNET,
        supportedNetworksIds: [ChainId.POLYGON_MAINNET],
        networkConfig: [
          {
            chainId: ChainId.POLYGON_MAINNET,
            dappAPIKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY
          },
        ],
      })
      const acct = await smartAccount.init()
      console.log({ deployed: await smartAccount.isDeployed(ChainId.POLYGON_MAINNET)})
      const isDeployed = await smartAccount.isDeployed(ChainId.POLYGON_MAINNET)
      if (isDeployed == false) {
        console.log("this one needs to be deployed")
        const deployTx = await smartAccount.deployWalletUsingPaymaster()
        console.log(deployTx);
      }
      setSmartAccount(acct)
      const info = await sdkRef.current.getUserInfo() 
      setUserInfo( info )
      setLoading(false)
    } catch (err) {
      console.log('error setting up smart account... ', err)
    }
  }

  const logout = async () => {
    if (!sdkRef.current) {
      console.error('Web3Modal not initialized.')
      return
    }
    await sdkRef.current.logout()
    sdkRef.current.hideWallet()
    setSmartAccount(null)
    enableInterval(false)
  }

  console.log({
    smartAccount,
    userInfo
  })
  return (
    <>
    { smartAccount && <SideMenu isOpen={isOpen} setIsOpen={setIsOpen} smartAccount={smartAccount} logout={logout} userInfo={userInfo} />}
    {smartAccount == null && !loading && <button onClick={() => login()} className='bg-zinc-900 text-zinc-300 w-fit p-2 px-3 rounded-l-lg'>Connect to Web3</button>}
    {smartAccount !== null && (
      <>
      <button 
        onClick={() => setIsOpen(true)} 
        className='bg-zinc-900 text-zinc-300 w-fit p-2 px-3 rounded-l-lg'> 
      {truncateAddress(smartAccount.address)}
      </button>
      <div className='flex items-center p-2 px-2 bg-[#2172e5] rounded-r-lg'>
      <Image
       src="/user.png"
       width={25}
       height={25}
       alt="Picture of the author"
       // className={styles.imageItem}
     /> 
   </div>
      </>
    )
 }
    {loading && <button className='bg-zinc-900 text-zinc-300 w-fit p-2 px-3 rounded-l-lg'>Loading...</button>}
    </>
  )
}

export default Connect;
