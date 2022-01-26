require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require('dotenv').config()

task('whitelist', 'Whitelist an address')
  .addParam('address', 'Address to whitelist')
  .setAction(async (taskArgs) => {
    const contract = await hre.ethers.getContractAt(
      'SpaceCubes',
      process.env.SPACE_CUBES_ADDRESS
    )

    txn = await contract.whitelistUsers([taskArgs.address])
    await txn.wait()

    console.log('Added address to whitelist', taskArgs.address)
  })

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.4',
  defaultNetwork: 'mumbai',
  networks: {
    mainnet: {
      chainId: 137,
      url: process.env.MAINNET_API_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    mumbai: {
      chainId: 80001,
      url: process.env.MUMBAI_API_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.ETHERSCAN_API,
    },
  },
}
