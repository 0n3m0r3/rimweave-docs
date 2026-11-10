---
title: Check your integration
description: Test the result your mod needs, from identifying an effect to loading a colony.
---

# Check your integration

For the glove example, success means more than getting a matching identifier. Taking off the glove should remove its effect, preserve the other mod's effect and run each removal handler only as intended.

Different checks establish different parts of that behavior.

## Check the description and the lookup

Use small objects to check that two mods retain different identities, that a custom cause is kept, and that two exclusive claims are reported without picking a winner. These checks need no colony because they do not change the game.

The [first C# example](../getting-started/first-contribution.md#run-the-example) runs nine checks against the same source excerpts shown in the guide.

## Check the game objects your code selects

The framework's automated tests use minimal native objects to check exact targeting and removal refusal paths: the wrong pawn, another hand, a missing identity, duplicate identities, an already absent effect or unreadable saved metadata.

Fixtures can populate a native list directly to construct a test. An actual mod must use the game's operations so its health calculations and callbacks run.

From the framework repository, build and test each configuration sequentially:

```bash
dotnet build RimWeave.sln --configuration Debug
dotnet test RimWeave.sln --configuration Debug --no-build
dotnet build RimWeave.sln --configuration Release
dotnet test RimWeave.sln --configuration Release --no-build
```

The configurations share the installable output directories. Build Debug last if the next step is to use the developer commands in game.

## Check what saving actually preserves

The persistence tests use the native Scribe APIs to save and reload metadata and health state. They check custom origin values, absent descriptions, invalid data, retained unreadable records and the result of querying those records.

These tests run without a live colony. They do not establish that every other mod's loading callbacks cooperate correctly. A game check must also confirm that the effect remains on the intended target, its information is available, and loading does not apply it a second time.

## Check the complete player action

Use a disposable colony. Record the game build, framework revision, participating mods, target and expected result. Execute the action your integration is meant to support, then inspect the actual health state and relevant callbacks.

The original [developer example](debugging.md#verify-repeated-removal) checks repeated exact-instance removal with two observers in one mod. The separate [two-mod composition scenario](composition.md) uses independently loadable consumers, a native reload, targeted withdrawal, reversed load order and fresh single-consumer runs. Its procedure and recorded evidence keep those scopes distinct.

Record failures and scenarios you have not run. A passing build or unit test is useful evidence for its own scope, not proof of an unrelated save migration, mod removal or multiplayer configuration.
