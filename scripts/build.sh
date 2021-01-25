#!/bin/sh
if ! test -e src; then
  echo "It seems like you're not running script from root directroy. Script must be executed from project root directory."
  exit 1
fi

echo "Comparing Torque package version defined in src with the one from package.json ..."
SRC_CONFIG=src/config/package.json-replica-for-config.json
PACKAGE_JSON_CONFIG=package.json

if ! test -f "$SRC_CONFIG"; then
  echo "ERROR: Missing $SRC_CONFIG\nBuild aborted."
  exit 1
fi
SRC_CONFIG_VERSION=$(cat $SRC_CONFIG | jq .version)

if ! test -f "$PACKAGE_JSON_CONFIG"; then
  echo "ERROR: Missing $PACKAGE_JSON_CONFIG\nBuild aborted."
  exit 1
fi
PACKAGE_JSON_CONFIG_VERSION=$(cat $PACKAGE_JSON_CONFIG | jq .version)

if [ $SRC_CONFIG_VERSION = $PACKAGE_JSON_CONFIG_VERSION ]; then
  echo "Torque package versions match. Current version: $SRC_CONFIG_VERSION"
else
  echo "ERROR: Torque package version from src does not match version from package.json.\nCorrect versions then try again."
  echo "src version: $SRC_CONFIG_VERSION"
  echo "package.json version: $PACKAGE_JSON_CONFIG_VERSION"
  exit 1
fi

echo "Using local tsc for build. Running 'yarn run tsc' ..."
yarn run tsc
