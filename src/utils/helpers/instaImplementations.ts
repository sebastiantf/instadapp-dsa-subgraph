import { InstaImplementations as ImplementationsTemplate } from "../../../generated/templates";
import { InstaConnector, Connector, Chief, ConnectorEvent, InstaImplementation, Implementation } from "../../../generated/schema";
import { Address } from "@graphprotocol/graph-ts";

export function getOrCreateInstaImplementation(
  addressId: Address
): InstaImplementation {
  let instaImplementations = InstaImplementation.load(addressId.toHexString());

  if (instaImplementations == null) {
    instaImplementations = new InstaImplementation(addressId.toHexString());

    instaImplementations.save();

    ImplementationsTemplate.create(addressId);
  }

  return instaImplementations as InstaImplementation;
}

export function getOrCreateImplementation(
  id: String,
  createIfNotFound: boolean = true
): Implementation {
  let implementation = Implementation.load(id);

  if (implementation == null && createIfNotFound) {
    implementation = new Implementation(id);
  }

  return implementation as Implementation;
}
