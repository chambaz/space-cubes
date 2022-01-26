async function main() {
  // get contract that we want to deploy
  const contract = await hre.ethers.getContractAt(
    'SpaceCubes',
    process.env.SPACE_CUBES_ADDRESS
  )

  // get owner/deployer's wallet address
  const [owner] = await hre.ethers.getSigners()

  // withdraw funds
  console.log('Withdraw funds')
  txn = await contract.withdraw()
  await txn.wait()

  console.log('Owner balance', await owner.getBalance())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
