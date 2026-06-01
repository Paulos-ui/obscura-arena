import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { saveDeployment } from './utils'

// Deploy the ObscuraAuction contract and seed one demo auction.
task('deploy-obscura', 'Deploy ObscuraAuction to the selected network')
	.addOptionalParam('seed', 'Seed a demo auction (true/false)', 'true')
	.setAction(async (args, hre: HardhatRuntimeEnvironment) => {
		const { ethers, network } = hre

		console.log(`Deploying ObscuraAuction to ${network.name}...`)

		const [deployer] = await ethers.getSigners()
		console.log(`Deploying with account: ${deployer.address}`)

		const Obscura = await ethers.getContractFactory('ObscuraAuction')
		const obscura = await Obscura.deploy()
		await obscura.waitForDeployment()

		const address = await obscura.getAddress()
		console.log(`ObscuraAuction deployed to: ${address}`)

		if (args.seed === 'true') {
			// 24h demo auction so judges can bid live.
			const tx = await obscura.createAuction('Genesis Crown — Sealed Lot #001', 60 * 60 * 24)
			await tx.wait()
			console.log('Seeded demo auction #0 (24h).')
		}

		saveDeployment(network.name, 'ObscuraAuction', address)
		return address
	})
