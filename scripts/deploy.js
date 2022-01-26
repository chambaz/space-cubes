async function main() {
  const baseTokenURI = 'ipfs://QmVwpWC6yQrtsCkVw9trZydsZJWotax51wvXW6jXqvN1Vh/'

  // get owner/deployer's wallet address
  const [owner] = await hre.ethers.getSigners()

  // get contract that we want to deploy
  const contractFactory = await hre.ethers.getContractFactory('SpaceCubes')

  // deploy contract with the correct constructor arguments
  const contract = await contractFactory.deploy(baseTokenURI)

  // wait for this transaction to be mined
  await contract.deployed()

  // get contract address
  console.log('Contract deployed to:', contract.address)

  // whitelist owner
  txn = await contract.whitelistUsers([owner.address])
  await txn.wait()
  console.log(`Added owner to whitelist`)

  // mint 3 NFTs for owner
  txn = await contract.mintNFTs(3)
  await txn.wait()
  console.log('3 NFTs have been minted for owner')

  // get all token IDs of the owner
  let ownerTokens = await contract.tokensOfOwner(owner.address)
  await txn.wait()
  console.log('Owner has tokens: ', ownerTokens)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
