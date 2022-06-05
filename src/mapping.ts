import {
  Transfer, Whitepaper as WhitepaperContract
} from "../generated/Whitepaper/Whitepaper"
import {Whitepaper, Transfer as TransferEntity} from "../generated/schema";
import {Address} from "@graphprotocol/graph-ts";

export const WHITEPAPER_CONTRACT_ADDRESS = '0x75a43163C74e0Ff26e9a53dA4658a405fbB11D84';
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function handleTransfer(event: Transfer): void {

  const newOwner = event.params.to;
  const tokenId = event.params.tokenId;


  let whitepaper = Whitepaper.load(tokenId.toString());

  if (!whitepaper) {
    whitepaper = new Whitepaper(tokenId.toString());
    let contract = WhitepaperContract.bind(Address.fromString(WHITEPAPER_CONTRACT_ADDRESS));
    whitepaper.paper = contract.tokenURI(tokenId);
  }

  whitepaper.owner = newOwner;

  whitepaper.save()


  if (event.params.from == Address.fromString(ADDRESS_ZERO)) {
    return;
  }

  const transfer = new TransferEntity(event.transaction.hash.toHexString());
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.tokenId = event.params.tokenId;

  transfer.save()
}