import Web3 from 'web3';
import { BytesLike, ContractFactory, ContractInterface, ethers } from 'ethers';

import AbiFinder from '../../abis/abi-finder';
import TokenService, { CreateTokenInfoDto } from '../../features/Token/TokenService';
import DataService from '../http/DataService';

// import { AbiItem } from 'web3-utils';

interface IMintSealToken {
  deployArgs: Array<any>;
  contractAbi: ContractInterface;
  contractByteCode: BytesLike;
}

export const deployBNBContract = async ({
  deployArgs,
  contractAbi,
  contractByteCode,
}: IMintSealToken) => {
  const factory = new ContractFactory(contractAbi, contractByteCode);
  const contract = await factory.deploy(deployArgs);
};

// export const mintSealToken = async () => {
//   const root = await AbiFinder.findBNBRoot('seal', 'binance');
//   const { abiFile } = root;
//
//   const web3 = new Web3(Web3.givenProvider || 'ws://some.local-or-remote.node:8546');
//
//   if (abiFile) {
//     // const sealContract = new web3.eth.Contract(abiFile.abi, root.rootAddress);
//     // sealContract.methods.mint();
//   }
// };

export const mintStampToken = async (tokenDto: CreateTokenInfoDto) => {
  const contract = await AbiFinder.findBNBRoot('stamp1', tokenDto.blockchain);
  const provider = await new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const stampTokenContract = new ethers.Contract(
    tokenDto.collectionID!,
    contract.abiFile.abi,
    signer,
  );
  const endorsementToken = await stampTokenContract.mint();
  tokenDto.txHash = endorsementToken.hash;
  await TokenService.createTokenInfo(tokenDto);
};

export const mintSealToken = async (tokenDto: CreateTokenInfoDto) => {
  try {
    const contract = await AbiFinder.findBNBRoot('seal', tokenDto.blockchain);
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const sealTokenContract = new ethers.Contract(
      tokenDto.collectionID!,
      contract.abiFile.abi,
      signer,
    );
    const sealToken = await sealTokenContract.mint();
    tokenDto.txHash = sealToken.hash;
    await TokenService.createTokenInfo(tokenDto);
  } catch (err) {
    console.log(err);
  }
};
