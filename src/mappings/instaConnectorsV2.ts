import {
  LogController,
  LogConnectorAdded,
  LogConnectorUpdated,
  LogConnectorRemoved
} from "../../generated/templates/InstaConnectorsV2/InstaConnectorsV2";
import { Connector as ConnectorContract } from "../../generated/templates/InstaConnectors/Connector";
import {
  getOrCreateConnector,
  getOrCreateChief,
} from "../utils/helpers";


// - event LogController(address indexed addr, bool indexed isChief)
//   handler: handleLogContoller

export function handleLogContoller(event: LogController): void {
  let chief = getOrCreateChief(event.params.addr.toHexString());

  chief.isActive = event.params.isChief;
  chief.instaConnector = event.address.toHexString();

  chief.save();
}

// - event: LogConnectorAdded(bytes32 indexed connectorNameHash,string connectorName,address indexed connector);
//   handler: handleLogConnectorAdded

export function handleLogConnectorAdded(event: LogConnectorAdded): void {
  let contract = ConnectorContract.bind(event.params.connector);
  let connectorIDResult = contract.connectorID();
  let instaConnectorAddress = event.address.toHexString();
  let entityId = connectorIDResult.value1
    .toString()
    .concat("-")
    .concat(connectorIDResult.value0.toString());
  let connector = getOrCreateConnector(entityId);

  connector.isEnabled = true;
  connector.isStatic = false;
  connector.instaConnector = event.address.toHexString();
  connector.name = contract.name();
  connector.address = event.params.connector;
  connector.connectorType = connectorIDResult.value0;
  connector.connectorID = connectorIDResult.value1;

  connector.save();
}

// - event: LogConnectorUpdated(bytes32 indexed connectorNameHash,string connectorName,address indexed oldConnector,address indexed newConnector);
//   handler: handleLogConnectorUpdated

export function handleLogConnectorUpdated(event: LogConnectorUpdated): void {
  let oldContract = ConnectorContract.bind(event.params.oldConnector);
  let oldConnectorIDResult = oldContract.connectorID();
  let instaConnectorAddress = event.address.toHexString();
  let oldEntityId = oldConnectorIDResult.value1
    .toString()
    .concat("-")
    .concat(oldConnectorIDResult.value0.toString());
  let oldConnector = getOrCreateConnector(oldEntityId);

  oldConnector.isEnabled = false;
  oldConnector.instaConnector = event.address.toHexString();
  oldConnector.name = oldContract.name();
  oldConnector.address = event.params.oldConnector
  oldConnector.connectorType = oldConnectorIDResult.value0;
  oldConnector.connectorID = oldConnectorIDResult.value1;

  oldConnector.save();

  let newContract = ConnectorContract.bind(event.params.newConnector);
  let newConnectorIDResult = newContract.connectorID();
  let newEntityId = newConnectorIDResult.value1
    .toString()
    .concat("-")
    .concat(newConnectorIDResult.value0.toString());
  let newConnector = getOrCreateConnector(oldEntityId);

  newConnector.isEnabled = true;
  newConnector.isStatic = false;
  newConnector.instaConnector = event.address.toHexString();
  newConnector.name = oldContract.name();
  newConnector.address = event.params.newConnector;
  newConnector.connectorType = oldConnectorIDResult.value0;
  newConnector.connectorID = oldConnectorIDResult.value1;

  newConnector.save();
}


// - event: LogConnectorRemoved(bytes32 indexed connectorNameHash,string connectorName,address indexed connector)
//   handler: handleLogConnectorRemoved

export function handleLogConnectorRemoved(event: LogConnectorRemoved): void {
  let contract = ConnectorContract.bind(event.params.connector);
  let connectorIDResult = contract.connectorID();
  let instaConnectorAddress = event.address.toHexString();
  let entityId = connectorIDResult.value1
    .toString()
    .concat("-")
    .concat(connectorIDResult.value0.toString());
  let connector = getOrCreateConnector(entityId);

  connector.isEnabled = false;
  connector.instaConnector = event.address.toHexString();
  connector.name = contract.name();
  connector.address = event.params.connector
  connector.connectorType = connectorIDResult.value0;
  connector.connectorID = connectorIDResult.value1;

  connector.save();
}