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
}

// - event: LogRemoveImplementation(address indexed implementation, bytes4[] sigs);
//   handler: handleRemoveImplementation

export function handleRemoveImplementation(event: LogRemoveImplementation): void {
  let implementation = getOrCreateImplementation(event.params.implementation.toHexString());

  implementation.isEnabled = false;
  implementation.instaImplementation = event.address.toHexString();
  implementation.sigs = event.params.sigs;

  implementation.save();
}