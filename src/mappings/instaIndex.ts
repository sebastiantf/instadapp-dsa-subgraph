import {
  LogAccountCreated,
  LogNewAccount,
  LogNewCheck,
  LogNewMaster,
  LogUpdateMaster,
  SetBasicsCall,
  BuildCall,
  InstaIndex
} from "../../generated/InstaIndex/InstaIndex";
import { InstaList } from "../../generated/InstaIndex/InstaList";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  getOrCreateAccountModule,
  getOrCreateUser,
  getOrCreateSmartAccount,
  getOrCreateInstaConnector,
  getOrCreateInstaIndex,
  getOrCreateInstaImplementation
} from "../utils/helpers";
import { InstaAccountV2 } from "../../generated/templates/InstaAccountV2/InstaAccountV2";

// - event: LogAccountCreated(address,indexed address,indexed address,indexed address)
//   handler: handleLogAccountCreated
//  Creation of new smart account for user
//  event LogAccountCreated(address sender, address indexed owner, address indexed account, address indexed origin);

export function handleLogAccountCreated(event: LogAccountCreated): void {
  let owner = getOrCreateUser(event.params.owner.toHexString());
  let sender = getOrCreateUser(event.params.sender.toHexString());
  let index = getOrCreateInstaIndex();
  let version = InstaIndex.bind(event.address).versionCount();
  let instaListContract = InstaList.bind(index.instaListAddress as Address);
  let dsaID = instaListContract.accountID(event.params.account);
  let smartAccount = getOrCreateSmartAccount(
    dsaID.toString(),
    version,
    true,
    event.params.account as Address
  );

  smartAccount.owner = owner.id;
  let authorities = smartAccount.authorities;
  let userIndex = authorities.indexOf(owner.id);
  if (userIndex == -1) {
    authorities.push(owner.id);
  }
  smartAccount.authorities = authorities;
  smartAccount.creator = sender.id;
  smartAccount.origin = event.params.origin;
  smartAccount.version = version;
  smartAccount.isEnabled = true;
  smartAccount.accountID = dsaID;
  smartAccount.address = event.params.account;

  smartAccount.save();

  if (smartAccount.version == BigInt.fromString("2")) {
    let instaImplementationsAddress = InstaAccountV2.bind(smartAccount.address as Address).implementations();
    let instaImplementations = getOrCreateInstaImplementation(instaImplementationsAddress);
    instaImplementations.save();
  }
}

// - event: LogNewAccount(indexed address,indexed address,indexed address)
//   handler: handleLogNewAccount
//  Creation of new "Account Module"
//  emit LogNewAccount(_newAccount, _connectors, _check);

export function handleLogNewAccount(event: LogNewAccount): void {
  // current account version has to be retrieved from the contract
  let accountVersion = InstaIndex.bind(event.address).versionCount();
  let accountModule = getOrCreateAccountModule(accountVersion.toString());
  let instaConnector = getOrCreateInstaConnector(event.params._connectors);

  accountModule.address = event.params._newAccount;
  accountModule.connectors = instaConnector.id;
  accountModule.check = event.params._check;

  accountModule.save();
}

// - event: LogNewCheck(indexed uint256,indexed address)
//   handler: handleLogNewCheck

export function handleLogNewCheck(event: LogNewCheck): void {
  let accountModule = getOrCreateAccountModule(
    event.params.accountVersion.toString()
  );

  accountModule.check = event.params.check;

  accountModule.save();
}

// - event: LogNewMaster(indexed address)
//   handler: handleLogNewMaster

export function handleLogNewMaster(event: LogNewMaster): void {
  let index = getOrCreateInstaIndex();

  index.master = event.params.master;

  index.save();
}

// - event: LogUpdateMaster(indexed address)
//   handler: handleLogUpdateMaster

export function handleLogUpdateMaster(event: LogUpdateMaster): void {
  let index = getOrCreateInstaIndex();

  index.master = event.params.master;

  index.save();
}

export function handleSetBasics(call: SetBasicsCall): void {
  let instaIndex = getOrCreateInstaIndex();
  let accountVersion = InstaIndex.bind(call.to).versionCount();
  let accountModule = getOrCreateAccountModule(accountVersion.toString());
  let instaConnector = getOrCreateInstaConnector(call.inputs._connectors);

  accountModule.address = call.inputs._account;
  accountModule.connectors = instaConnector.id;

  instaIndex.instaListAddress = call.inputs._list;

  instaIndex.save();
  accountModule.save();
}

export function handleBuild(call: BuildCall): void {
  let index = getOrCreateInstaIndex();
  let instaListContract = InstaList.bind(index.instaListAddress as Address);
  let dsaID = instaListContract.accountID(call.outputs._account);
  let smartAccount = getOrCreateSmartAccount(
    dsaID.toString(),
    call.inputs.accountVersion,
    true,
    call.outputs._account as Address
  );
  let owner = getOrCreateUser(call.inputs._owner.toHexString());
  let creator = getOrCreateUser(call.from.toHexString());

  smartAccount.owner = owner.id;
  let authorities = smartAccount.authorities;
  let userIndex = authorities.indexOf(owner.id);
  if (userIndex == -1) {
    authorities.push(owner.id);
  }
  smartAccount.authorities = authorities;
  smartAccount.creator = creator.id;
  smartAccount.origin = call.inputs._origin;
  smartAccount.version = call.inputs.accountVersion;
  smartAccount.isEnabled = true;
  smartAccount.accountID = dsaID;
  smartAccount.address = call.outputs._account;
  smartAccount.accountModule = call.inputs.accountVersion.toString();

  smartAccount.save();

  if (smartAccount.version == BigInt.fromString("2")) {
    let instaImplementationsAddress = InstaAccountV2.bind(smartAccount.address as Address).implementations();
    let instaImplementations = getOrCreateInstaImplementation(instaImplementationsAddress);
    instaImplementations.save();
  }
}
