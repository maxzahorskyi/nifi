export enum ModalType {
  creatingAuction = 'creatingAuction',
  submittingBid = 'submittingBid',
  auctionSaleSetup = 'auctionSaleSetup',
  auctionSaleSetupActive = 'auctionSaleSetupActive',
  creatingBid = 'creatingBid',
  acceptingBid = 'acceptingBid',
  sendToken = 'sendTokenHandler',
  saleOfferCreation = 'saleOfferCreation',
  saleOfferCancellation = 'saleOfferCancellation',
  salePriceChange = 'salePriceChange',
  offerCancellationRequired = 'offerCancellationRequired',
}

export const modalName: { [key in ModalType]: string } = {
  [ModalType.creatingAuction]: 'Creating auction',
  [ModalType.submittingBid]: 'Submitting bid',
  [ModalType.auctionSaleSetup]: 'Auction / sale setup',
  [ModalType.auctionSaleSetupActive]: 'Auction / sale setup',
  [ModalType.creatingBid]: 'Creating bid',
  [ModalType.acceptingBid]: 'Accepting bid',
  [ModalType.sendToken]: 'Send token',
  [ModalType.saleOfferCreation]: 'Sale offer creation',
  [ModalType.saleOfferCancellation]: 'Sale offer cancellation',
  [ModalType.salePriceChange]: 'Sale price change',
  [ModalType.offerCancellationRequired]: 'Offer cancellation required',
};
