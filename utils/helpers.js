export const getPoolImmutables = async (poolContract) => {
  console.log("getting poolimmutable")
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee()
  ])
console.log("if i don't appear i fail at the promise")
  const immutables = {
    token0: token0,
    token1: token1,
    fee: fee
  }
  return immutables
}

export const getPoolState = async (poolContract) => {
  console.log("getting pool state")
  const slot = await poolContract.slot0()

  const state = {
    sqrtPriceX96: slot[0]
  }

  return state
}