import React, {useState, useRef, useEffect} from 'react';
import {
  ParticleAuthModule,
  ParticleProvider,
} from "@biconomy/particle-auth";
import { ChainId } from "@biconomy/core-types";
import { Bundler } from '@biconomy/bundler'
import { BiconomyPaymaster } from '@biconomy/paymaster'
import { ethers } from 'ethers'
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from "@biconomy/modules";
import Image from 'next/image';
import SideMenu from './SideMenu';

const Connect = ({ smartAccount, setSmartAccount, provider, setProvider}) => {
  // const [interval, enableInterval] = useState(false)
  // const sdkRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState("");

  function truncateAddress(add) {
    const len = add.length;
    if (len < 11) return add;
    return add.substring(0, 6) + "..." + add.substring(len - 4, len);
  }

  const particle = new ParticleAuthModule.ParticleNetwork({
    //get values from particle dashboard
    //https://docs.particle.network/getting-started/dashboard
    projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
    clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
    appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
    wallet: {
      displayWalletEntry: true,
      defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
    },
  });

  const bundler = new Bundler({
    //https://dashboard.biconomy.io/
    // for testnets you can reuse this and change the chain id (currently 80001)
    bundlerUrl: "https://bundler.biconomy.io/api/v2/137/fAPY9R6ts.gg1v9570-521z-59jk-gt69-9654m83c0m37",    
    chainId: ChainId.POLYGON_MAINNET,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  })


  
  const paymaster = new BiconomyPaymaster({
    //https://dashboard.biconomy.io/
    //replace with your own paymaster url from dashboard (otherwise your transaction may not work :( )
    paymasterUrl: "https://paymaster.biconomy.io/api/v1/137/u2tMy61_L.22152d61-064b-40f9-9e6a-4ac445cf5d3d"
  })

  // useEffect(() => {
  //   let configureLogin
  //   if (interval) {
  //     configureLogin = setInterval(() => {
  //       if (!!sdkRef.current?.provider) {
  //         setupSmartAccount()
  //         clearInterval(configureLogin)
  //       }
  //     }, 1000)
  //   }
  // }, [interval])

  async function login() {
    console.log("hello from login")
    try {
      setLoading(true)
      const userInfo = await particle.auth.login();
      console.log("Logged in user:", userInfo);
      const particleProvider = new ParticleProvider(particle.auth);
      console.log({particleProvider})
      const web3Provider = new ethers.providers.Web3Provider(
        particleProvider,
        "any"
      );

      const validationModule = await ECDSAOwnershipValidationModule.create({
        signer: web3Provider.getSigner(),
        moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
      });

      setProvider(web3Provider)
      let biconomySmartAccount = await BiconomySmartAccountV2.create({
            provider: provider,
            chainId: ChainId.POLYGON_MAINNET,
            bundler: bundler,
            paymaster: paymaster,
            entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
            defaultValidationModule: validationModule,
            activeValidationModule: validationModule
      })
      const address = await biconomySmartAccount.getAccountAddress()
      console.log({ address })
      setAddress( address )
      setSmartAccount(biconomySmartAccount)
      setLoading(false)
    } catch (error) {
      console.error(error);
    }
  }

  // async function setupSmartAccount() {
  //   if (!sdkRef?.current?.provider) {
  //     setUserInfo( await sdkRef?.current?.getUserInfo())
  //     console.log(userInfo)
  //     return
  //   }
  //   sdkRef.current.hideWallet()
  //   setLoading(true)
  //   const web3Provider = new ethers.providers.Web3Provider(
  //     sdkRef.current.provider
  //   )
  //   setProvider(web3Provider)
  //   try {
  //     const smartAccount = new SmartAccount(web3Provider, {
  //       activeNetworkId: ChainId.POLYGON_MAINNET,
  //       supportedNetworksIds: [ChainId.POLYGON_MAINNET],
  //       networkConfig: [
  //         {
  //           chainId: ChainId.POLYGON_MAINNET,
  //           dappAPIKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY
  //         },
  //       ],
  //     })
  //     const acct = await smartAccount.init()
  //     console.log({ deployed: await smartAccount.isDeployed(ChainId.POLYGON_MAINNET)})
  //     const isDeployed = await smartAccount.isDeployed(ChainId.POLYGON_MAINNET)
  //     if (isDeployed == false) {
  //       console.log("this one needs to be deployed")
  //       const deployTx = await smartAccount.deployWalletUsingPaymaster()
  //       console.log(deployTx);
  //     }
  //     setSmartAccount(acct)
  //     const info = await sdkRef.current.getUserInfo() 
  //     setUserInfo( info )
  //     setLoading(false)
  //   } catch (err) {
  //     console.log('error setting up smart account... ', err)
  //   }
  // }

  const logout = async () => {
    alert("do the logout")
  }

  console.log({
    smartAccount,
    userInfo
  })
  return (
    <>
    { smartAccount && <SideMenu address={address} isOpen={isOpen} setIsOpen={setIsOpen} smartAccount={smartAccount} logout={logout} userInfo={userInfo} />}
    {smartAccount == null && !loading && <button onClick={() => login()} className='bg-zinc-900 text-zinc-300 w-fit p-2 px-3 rounded-l-lg'>Connect to Web3</button>}
    {smartAccount !== null && (
      <>
      <button 
        onClick={() => setIsOpen(true)} 
        className='bg-zinc-900 text-zinc-300 w-fit p-2 px-3 rounded-l-lg'> 
      {truncateAddress(address)}
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
