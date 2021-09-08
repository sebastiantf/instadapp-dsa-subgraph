import {
  LogSetDefaultImplementation,
  LogAddImplementation,
  LogRemoveImplementation
} from "../../generated/templates/InstaImplementations/InstaImplementations";
import { Connector as ConnectorContract } from "../../generated/templates/InstaConnectors/Connector";
import {
  getOrCreateImplementation,
  getOrCreateInstaImplementation
} from "../utils/helpers";
import { Implementation } from "../../generated/templates/InstaImplementations/Implementation";
import { getOrCreateInstaConnectorV2 } from "../utils/helpers/instaConnectorsV2";
import { Address, log } from "@graphprotocol/graph-ts";


// - event LogSetDefaultImplementation(address indexed oldImplementation, address indexed newImplementation);
//   handler: handleLogSetDefaultImplementation

export function handleLogSetDefaultImplementation(event: LogSetDefaultImplementation): void {
  let instaImplementation = getOrCreateInstaImplementation(event.address)
  instaImplementation.defaultImplementation = event.params.newImplementation;
  
  instaImplementation.save();
}

// - event: LogAddImplementation(address indexed implementation, bytes4[] sigs);
//   handler: handleLogAddImplementation

export function handleLogAddImplementation(event: LogAddImplementation): void {
  let implementation = getOrCreateImplementation(event.params.implementation.toHexString());

  implementation.isEnabled = true;
  implementation.instaImplementation = event.address.toHexString();
  implementation.sigs = event.params.sigs;

  implementation.save();

  let implementationContract = Implementation.bind(event.params.implementation);
  let connectorsAddress = implementationContract.try_connectorsM1();
  if (!connectorsAddress.reverted) {
    let instaConnector = getOrCreateInstaConnectorV2(connectorsAddress.value);
    instaConnector.save();
    implementation.connectorsM1 = connectorsAddress.value;
    implementation.save();
  }
}

// - event: LogRemoveImplementation(address indexed implementation, bytes4[] sigs);
//   handler: handleLogRemoveImplementation

export function handleLogRemoveImplementation(event: LogRemoveImplementation): void {
  let implementation = getOrCreateImplementation(event.params.implementation.toHexString());

  implementation.isEnabled = false;
  implementation.instaImplementation = event.address.toHexString();
  implementation.sigs = event.params.sigs;

  implementation.save();
}