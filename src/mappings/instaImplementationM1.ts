import { InstaList } from "../../generated/InstaIndex/InstaList";
import {
  getOrCreateSmartAccount,
  getOrCreateCast,
  getOrCreateCastEvent,
  getOrCreateInstaIndex,
} from "../utils/helpers";
import { log, Address } from "@graphprotocol/graph-ts";
import { LogCast } from "../../generated/templates/InstaImplementationM1/InstaImplementationM1";

// - event LogCast(address indexed origin,address indexed sender,uint256 value,string[] targetsNames,address[] targets,string[] eventNames,bytes[] eventParams);
//   handler: handleLogCast

export function handleLogCast(event: LogCast): void {
  let instaIndex = getOrCreateInstaIndex();
  let instaListContract = InstaList.bind(instaIndex.instaListAddress as Address);
  let accountID = instaListContract.accountID(event.address);
  let account = getOrCreateSmartAccount(accountID.toString(), false);
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
    castEvent.targets = event.params.targets;
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
    cast.targets = event.params.targets;
    cast.eventNames = event.params.eventNames;
    cast.eventParams = event.params.eventParams;
    cast.tx_hash = event.transaction.hash.toHexString();
    cast.block = event.block.number;
    cast.logIndex = event.logIndex;

    castEvent.save();
    cast.save();
  }
}
