import { InstaConnectorsV2 as ConnectorsTemplateV2 } from "../../../generated/templates";
import { InstaConnector } from "../../../generated/schema";
import { Address } from "@graphprotocol/graph-ts";

export function getOrCreateInstaConnectorV2(
  addressId: Address
): InstaConnector {
  let connectors = InstaConnector.load(addressId.toHexString());

  if (connectors == null) {
    connectors = new InstaConnector(addressId.toHexString());

    connectors.save();

    ConnectorsTemplateV2.create(addressId);
  }

  return connectors as InstaConnector;
}