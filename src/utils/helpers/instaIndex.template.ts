import {
  User,
  SmartAccount,
  AccountModule,
  InstaIndex,
} from "../../../generated/schema";
import { InstaAccount as AccountTemplate, InstaAccountV2 as AccountTemplateV2 } from "../../../generated/templates";
import { Address, BigInt } from "@graphprotocol/graph-ts";

export function getOrCreateUser(
  id: String,
  createIfNotFound: boolean = true,
  save: boolean = true
): User {
  let user = User.load(id);

  if (user == null && createIfNotFound) {
    user = new User(id);

    if (save) {
      user.save();
    }
  }

  return user as User;
}

export function getOrCreateSmartAccount(
  id: String,
  version: BigInt,
  createIfNotFound: boolean = true,
  address: Address | null = null
): SmartAccount {
  let smartAccount = SmartAccount.load(id);

  if (smartAccount == null && createIfNotFound) {
    smartAccount = new SmartAccount(id);

    smartAccount.shield = false;
    if (address != null) {
      if (version == BigInt.fromString('1'))
        AccountTemplate.create(address as Address);
      if (version == BigInt.fromString('2'))
        AccountTemplateV2.create(address as Address);
      else
        AccountTemplate.create(address as Address);
    }

    smartAccount.authorities = []
  }

  return smartAccount as SmartAccount;
}

export function getOrCreateAccountModule(
  id: String,
  createIfNotFound: boolean = true
): AccountModule {
  let accountModule = AccountModule.load(id);

  if (accountModule == null && createIfNotFound) {
    accountModule = new AccountModule(id);

    let instaIndex = getOrCreateInstaIndex();
    accountModule.instaIndex = instaIndex.id;
  }

  return accountModule as AccountModule;
}

export function getOrCreateInstaIndex(): InstaIndex {
  let index = InstaIndex.load("{{InstaIndexAddress}}");

  if (index == null) {
    index = new InstaIndex("{{InstaIndexAddress}}");
    index.save();
  }

  return index as InstaIndex;
}
