import {
  Transfer,
  Whitepaper as WhitepaperContract,
  PageContact,
  URI,
} from "../generated/Whitepaper/Whitepaper";

import {
  Whitepaper,
  Transfer as TransferEntity,
  AppData,
} from "../generated/schema";
import { Address } from "@graphprotocol/graph-ts";

export const WHITEPAPER_CONTRACT_ADDRESS =
  "0x75a43163C74e0Ff26e9a53dA4658a405fbB11D84";
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function handleTransfer(event: Transfer): void {
  const newOwner = event.params.to;
  const tokenId = event.params.tokenId;

  let whitepaper = Whitepaper.load(tokenId.toString());

  if (event.params.from == Address.fromString(ADDRESS_ZERO)) {
    let appData = AppData.load("app");
    if (!appData) {
      appData = new AppData("app");
      appData.numMinted = 0;
      appData.numEdited = 0;
    }

    appData.numMinted = appData.numMinted + 1;
    appData.save();
  }

  if (!whitepaper) {
    whitepaper = new Whitepaper(tokenId.toString());
    let contract = WhitepaperContract.bind(
      Address.fromString(WHITEPAPER_CONTRACT_ADDRESS)
    );
    whitepaper.paper = contract.tokenURI(tokenId);
  }
  whitepaper.isEdited = false;
  whitepaper.owner = newOwner;

  whitepaper.save();

  if (event.params.from == Address.fromString(ADDRESS_ZERO)) {
    return;
  }

  const transfer = new TransferEntity(event.transaction.hash.toHexString());
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.tokenId = event.params.tokenId;

  transfer.save();
}
export function handleURI(event: URI): void {
  const tokenId = event.params.tokenId;

  let whitepaper = Whitepaper.load(tokenId.toString()) as Whitepaper;
  whitepaper.paper = event.params.value;
}

export function handlePageContact(event: PageContact): void {
  const tokenId = event.params.tokenId;

  let appData = AppData.load("app");
  if (!appData) {
    appData = new AppData("app");
    appData.numMinted = 0;
    appData.numEdited = 0;
  }

  appData.numEdited = appData.numEdited + 1;

  appData.save();
  let whitepaper = Whitepaper.load(tokenId.toString()) as Whitepaper;
  whitepaper.paperContent = event.params.pageContant.join('\n');
  whitepaper.isEdited = true;

  whitepaper.save();
}
