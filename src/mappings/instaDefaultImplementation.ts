import { InstaList } from "../../generated/InstaIndex/InstaList";
import {
  LogDisableUser,
  LogEnableUser
} from "../../generated/templates/InstaDefaultImplementation/InstaDefaultImplementation"
import {
  getOrCreateSmartAccount,
  getOrCreateInstaIndex,
  getOrCreateUser,
  getOrCreateDisableEvent,
  getOrCreateEnableEvent
} from "../utils/helpers";
import { log, Address } from "@graphprotocol/graph-ts";

// - event: LogDisableUser(address indexed user)
//   handler: handleLogDisableSmartAccountOwner

export function handleLogDisableSmartAccountOwner(event: LogDisableUser): void {
  let instaIndex = getOrCreateInstaIndex();
  let instaListContract = InstaList.bind(instaIndex.instaListAddress as Address);
  let accountID = instaListContract.accountID(event.address);
  let account = getOrCreateSmartAccount(accountID.toString(), false);
  if (account == null) {
    log.error("DISABLE - Indexed address for smart account is wrong? {}", [
      accountID.toString()
    ]);
  } else {
    let eventId = event.transaction.hash
      .toHexString()
      .concat("-")
      .concat(event.logIndex.toString());
    let user = getOrCreateUser(event.params.user.toHexString());
    let disableEvent = getOrCreateDisableEvent(eventId);
    disableEvent.account = account.id;
    disableEvent.user = user.id;
    disableEvent.tx_hash = event.transaction.hash.toHexString();
    disableEvent.block = event.block.number;
    disableEvent.logIndex = event.logIndex;

    account.owner = user.id;
    let authorities = account.authorities;
    let userIndex = authorities.indexOf(user.id);
    if (userIndex != -1) {
      authorities.splice(userIndex, 1);
    }
    account.authorities = authorities;
    account.isEnabled = false;

    account.save();
    disableEvent.save();
  }
}

// - event: LogEnableUser(address indexed user)
//   handler: handleLogEnableSmartAccountOwner

export function handleLogEnableSmartAccountOwner(event: LogEnableUser): void {
  let instaIndex = getOrCreateInstaIndex();
  let instaListContract = InstaList.bind(instaIndex.instaListAddress as Address);
  let accountID = instaListContract.accountID(event.address);
  let account = getOrCreateSmartAccount(accountID.toString(), false);
  if (account == null) {
    log.error("ENABLE - Indexed address for smart account is wrong? {}", [
      accountID.toString()
    ]);
  } else {
    let eventId = event.transaction.hash
      .toHexString()
      .concat("-")
      .concat(event.logIndex.toString());
    let user = getOrCreateUser(event.params.user.toHexString());
    let enableEvent = getOrCreateEnableEvent(eventId);
    enableEvent.account = account.id;
    enableEvent.user = user.id;
    enableEvent.tx_hash = event.transaction.hash.toHexString();
    enableEvent.block = event.block.number;
    enableEvent.logIndex = event.logIndex;

    account.owner = user.id;
    let authorities = account.authorities;
    let userIndex = authorities.indexOf(user.id);
    if (userIndex == -1) {
      authorities.push(user.id);
    }
    account.authorities = authorities;
    account.isEnabled = true;

    account.save();
    enableEvent.save();
  }
}
