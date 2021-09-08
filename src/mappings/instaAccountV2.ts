import { InstaList } from "../../generated/InstaIndex/InstaList";
import {
  LogCast,
  LogDisableUser,
  LogEnableUser
} from "../../generated/templates/InstaAccountV2/InstaAccountV2"
import {
  getOrCreateSmartAccount,
  getOrCreateInstaIndex,
  getOrCreateUser,
  getOrCreateDisableEvent,
  getOrCreateEnableEvent,
  getOrCreateCast,
  getOrCreateCastEvent,
} from "../utils/helpers";
import { log, Address, Bytes, BigInt } from "@graphprotocol/graph-ts";


// - event LogCast(address indexed origin,address indexed sender,uint256 value,string[] targetsNames,address[] targets,string[] eventNames,bytes[] eventParams);
//   handler: handleLogCastV2

export function handleLogCastV2(event: LogCast): void {
  let instaIndex = getOrCreateInstaIndex();
  let instaListContract = InstaList.bind(instaIndex.instaListAddress as Address);
  let accountID = instaListContract.accountID(event.address);
  let account = getOrCreateSmartAccount(accountID.toString(), BigInt.fromString('2'), false);
  if (account == null) {
    log.error("LOGCAST - Indexed address for smart account is wrong? {}", [
      accountID.toString()
    ]);
  } else {
    let eventId = event.transaction.hash
      .toHexString()
      .concat("-")
      .concat(event.logIndex.toString());
    let castEvent = getOrCreateCastEvent(eventId);
    let cast = getOrCreateCast(eventId);

    castEvent.account = account.id;
    castEvent.origin = event.params.origin;
    castEvent.sender = event.params.sender;
    castEvent.value = event.params.value;
    castEvent.targetsNames = event.params.targetsNames;
    castEvent.targets = event.params.targets as Bytes[];
    castEvent.eventNames = event.params.eventNames;
    castEvent.eventParams = event.params.eventParams;
    castEvent.tx_hash = event.transaction.hash.toHexString();
    castEvent.block = event.block.number;
    castEvent.logIndex = event.logIndex;

    cast.account = account.id;
    cast.origin = event.params.origin;
    cast.sender = event.params.sender;
    cast.value = event.params.value;
    cast.targetsNames = event.params.targetsNames;
    cast.targets = event.params.targets as Bytes[];
    cast.eventNames = event.params.eventNames;
    cast.eventParams = event.params.eventParams;
    cast.tx_hash = event.transaction.hash.toHexString();
    cast.block = event.block.number;
    cast.logIndex = event.logIndex;

    castEvent.save();
    cast.save();
  }
}

// - event: LogDisableUser(address indexed user)
//   handler: handleLogDisableSmartAccountOwnerV2

export function handleLogDisableSmartAccountOwnerV2(event: LogDisableUser): void {
  let instaIndex = getOrCreateInstaIndex();
  let instaListContract = InstaList.bind(instaIndex.instaListAddress as Address);
  let accountID = instaListContract.accountID(event.address);
  let account = getOrCreateSmartAccount(accountID.toString(), BigInt.fromString('2'), false);
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
//   handler: handleLogEnableSmartAccountOwnerV2

export function handleLogEnableSmartAccountOwnerV2(event: LogEnableUser): void {
  let instaIndex = getOrCreateInstaIndex();
  let instaListContract = InstaList.bind(instaIndex.instaListAddress as Address);
  let accountID = instaListContract.accountID(event.address);
  let account = getOrCreateSmartAccount(accountID.toString(), BigInt.fromString('2'), false);
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
