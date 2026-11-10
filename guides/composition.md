---
title: Verify two independent mods
description: Reproduce coexistence, explicit conflicts and independent withdrawal across a native save and reload.
---

# Verify two independent mods

One mod supplies a medical contribution to a character's hand; another supplies a temporary contribution to the same hand. With both present, their shared exclusive claim must remain an explicit conflict. After saving and reloading, withdrawing the temporary contribution must leave the medical one intact.

RimWorld already stores and saves the health effects. Each example mod owns its declarations and explicit add/remove commands; RimWeave supplies the existing identity, query, addition, removal and persistence contracts. The examples add technical markers, not medical or equipment gameplay rules.

> [!NOTE]
> This scenario is prepared locally after the [documented `ce48935` framework revision](../compatibility/versions.md). The public API snapshot is unchanged; the new consumer commands are not available in that published revision. [Support and evidence](../compatibility/index.md#prepared-two-consumer-scenario) records this scenario's verification separately.

## Install two separate consumers

Build the solution in **Debug** from the same checkout. Install the framework and each consumer as separate mods:

| Consumer | Installable folder and package ID |
| --- | --- |
| A: RimWeave Example | `examples/RimWeave.Example` — `rimweave.example` |
| B: RimWeave Example Peer | `examples/RimWeave.Example.Peer` — `rimweave.example.peer` |

The marker definitions are `RimWeave_CompositionMedical` for A and `RimWeave_CompositionTemporary` for B. Both depend on RimWeave Framework; neither depends on the other. Put the framework before the consumers. Their relative order is part of the test. Release builds omit the developer commands.

Use a fresh disposable colony and a living colonist on the map. These commands target the **first `Hand` occurrence in the pawn's native `BodyDef` order**. This is not a promise that the part is labelled “left hand”. Both consumers use the same rule. Addition refuses a missing first hand; neither command switches to the other hand. Use [body inspection](debugging.md#inspect-a-character-without-changing-it) to identify that slot before starting.

Loading either mod, enabling developer mode or inspecting must create no contribution. Mutation requires developer mode and the explicit pawn action at execution time. Opening the debug menu alone is not that action.

## Add, reload, then withdraw B

The commands are in categories **RimWeave Example** and **RimWeave Example Peer**. Search by their complete action names, select an action, then click the same colonist. Results are written to the native log with the RimWeave prefix. Use the framework's [Inspect selected pawn health contributions](debugging.md#inspect-declared-health-contributions) report to compare the attached effects.

1. Run **Composition A: add on first hand**, then **Composition B: add on first hand** on that colonist. Each should report `ADD: Added`. After B, expect `claim=Ambiguous; claimants=2`. Inspect: two instances with different definitions and owners share the local contribution name `hand-state` on the same exact hand.
2. Each full contribution identity should resolve uniquely. Their common exclusive claim, `rimweave.examples/hand-state`, should return both candidates as `Ambiguous`, without choosing a winner. Repeat each add command: expect `AlreadyPresent` and no new instance.
3. Record the native effect IDs, owners, local identities, declared origin types, exact part and effect count. Save through the game's normal save menu and reload. **Inspect before issuing another add command.** The same two effects and declarations should remain, without another instance or automatic command replay.
4. Run **Composition B: remove on first hand** on the same colonist. Expect `lookup=Found; removal=Removed`, followed by `claim=Found; claimants=1`. Inspect: B is absent; A retains its native identity, declarations and exact target. The shared claim now resolves uniquely to A.
5. Repeat B's removal. Expect `lookup=NotPresent; removal=not requested`, with A still unchanged. Save and reload again, then inspect before another producer command: A should remain unchanged and B absent. This withdraws B's contribution; it does not uninstall B or disable its commands.

Different owners make these two full identities distinct despite the equal local name. The shared exclusive claim is a deliberate diagnostic conflict, not a rule preventing either addition. The examples use the same public [addition](health-effects.md#observe-the-addition), [lookup](../concepts/cooperation.md#read-the-answer-before-making-a-decision) and [removal](removal.md#when-you-know-its-identity-and-target) contracts available to other mods.

## Reverse the order and run each consumer alone

Restart the game after each mod-list change. Use a fresh colony for each row:

| Active consumer order, after the framework | Check |
| --- | --- |
| A, then B | Run the complete sequence above. |
| B, then A | Repeat it after a real restart. Compare sets of contribution identities and semantic outcomes, not enumeration order or numeric IDs across fresh colonies. |
| A only | Add A, repeat the add, inspect and remove A. Its identity and exclusive claim should each resolve uniquely while present. B is not required. |
| B only | Add B, repeat the add, inspect and remove B. Its identity and exclusive claim should each resolve uniquely while present. A is not required. |

For each single-consumer run, also save and reload before removal, then again after removal. Inspect before another producer command: the contribution should survive the first reload and remain absent after the second.

Keep the tested game build, source revision and enabled mods with the result. Single-consumer runs start fresh: they do not validate loading a save after uninstalling one of its providers.

## What this scenario establishes

This is a bounded check between two independently loadable consumers, separate from the [two observers inside the reference example](debugging.md#verify-native-references-across-a-reload). Passing it does not certify arbitrary mods, every body model, migrations, multiplayer or general gameplay compatibility. The examples own their first-hand targeting and duplicate-add policy; the framework does not impose them on other extensions.

Inspection is a snapshot and does not choose a winner, apply an effect or repair a save. If an operation fails, record its actual result and inspect native state before continuing: native exceptions can follow partial changes, without rollback. Keep these disposable saves separate from ordinary play and restore the intended active-mod list when finished.
