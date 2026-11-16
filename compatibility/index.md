---
title: Support and evidence
description: What this prototype implements and what its recorded tests establish.
---

# Support and evidence

[!INCLUDE [Documented version](../includes/version.md)]

The framework is experimental. This matrix separates an implemented contract from the scope of its verification. “Not verified” is not a claim that a configuration fails.

## Current evidence

| Area | Evidence | Boundary |
| --- | --- | --- |
| Shared identity, metadata, origin and resolution contracts | Automated framework tests; executable documentation examples | Does not establish arbitrary third-party integration. |
| Native health targeting and guard refusals | Automated checks with minimal native objects | Successful native lifecycle operations need game validation. |
| Exact-instance native removal | Manual prototype check on RimWorld 1.7.5000 rev1275: first removal succeeded, second returned absent, callback deltas were `[1,1]` then `[0,0]` | Specific framework/example configuration, recorded on 8 November 2026. |
| Independent hand targets | Manual prototype check preserved the other hand's marker | Does not establish general transformation reversal. |
| Removal by contribution identity | Automated lookup and guard checks; successful native withdrawal after a reload in the [two-consumer scenario](#two-consumer-scenario) | Verified with the two cooperating examples; no general provider-removal guarantee. |
| Observed native body part | Ten snapshot tests and [60 native checks](#observed-body-part-snapshots), including a fresh-process load | Snapshot of an effect's declared slot; no organ identity, anatomical validation or part-change notification. |
| Interrupted removal and reattachment | [60 native callback checks](#interrupted-removal-and-reattachment), including propagated exceptions, partial changes and `StillPresent` | Instrumented subclass; no rollback, automatic retry or arbitrary provider isolation. |
| Saving contribution metadata | Automated native Scribe checks and the bounded colony scenarios below | Does not establish arbitrary provider compatibility or migration. |
| Unreadable saved metadata | Automated rejection/preservation tests and [84 native checks across three processes](#unreadable-metadata-across-restarts) | Native run covers an unsupported metadata version and an absent record; no migration, save repair or missing-class recovery. |
| Core without active DLC | [81 native checks across four processes](#core-only-configuration), with and without the optional examples | Bounded loading, health and reference checks; no full neutrality comparison or physical DLC uninstall. |
| Passive inspection | Implemented as native state reads and diagnostic output | Full neutrality across all game configurations is not certified. |

The original repeated-removal example contains two observers in one mod. That check is distinct from the [two-consumer scenario](#two-consumer-scenario) below; neither establishes compatibility between arbitrary independent mods.

## Core-only configuration

On 16 November 2026, framework [e306982](https://github.com/0n3m0r3/rimweave/commit/e306982326fa9f96738063a527c43c22913efa66) passed **81 native checks** on **RimWorld 1.7.5011 rev24**, without a framework change. **57 existing Debug tests** covering composition, resolution, contribution operations, persisted references and body-part snapshots also passed. See [how to choose required content](versions.md#choose-required-game-content) for the distinction between framework capabilities and an extension's own DLC dependencies.

Four distinct processes used two disposable profiles, with two native saves and two direct loads. The actual running package lists contained Core, the framework and one explicitly invoked temporary observer; the composition profile additionally loaded A and B. All five native DLC activation flags were false in every process. The source saves and their direct-load inputs had identical hashes.

| Profile | Checks by process | Observed result |
| --- | --- | --- |
| Framework without the examples | 14 creation / 15 load | No example assembly or health definition loaded, and no contribution added. A passive pawn reference resolved; toggling developer mode and inspecting it preserved the observed health fields and simulation randomness. The new process restored the selected pawn's native identity and recorded health fields. Its explicitly saved reference loaded with interrupted tracking and no automatic resumption. |
| Framework with A and B | 25 creation / 27 load | Three explicit additions succeeded through the ordinary extension API while developer mode was disabled. A/B targeted one human hand and B the other. Five exact references, metadata, severity and creation ticks survived the new process without replayed additions or implicit tracking. |

The two consumers retained distinct identities while their shared first-hand responsibility remained ambiguous. After loading, removing B by identity on the first hand preserved A and the other-hand B. Two explicitly resumed B observers recorded detachment and stopped. Repetition returned absent without another callback, and the shared claim then resolved uniquely to A. The final withdrawal was verified in memory only; no post-withdrawal save was made. Composition counters recorded additions **3/0**, post-load callbacks **0/3**, and one explicit removal after the second process had verified its loaded state.

The independent save audit found no contribution metadata in the framework-only save, and exactly three native contributions plus five references in the composition save. It verified owner-qualified metadata, the native hand indices, source values and the saved package lists without DLC entries. Queries and captures preserved health-list membership and simulation randomness. Installed artifact hashes matched the committed Debug outputs; all four processes exited successfully. The original installation was restored, both observers removed and all 25 normal configuration files remained unchanged.

Logs contained the graphics-layer Fossilize error, loader and shutdown allocation warnings. No unexpected native error or reference-resolution warning was found. This configuration disables DLC activation; it does not test physically uninstalling DLC files. The observer itself was loaded, the checks were programmatic, and the framework-only phase did not compare every simulation or UI behavior against a game without the framework. No general neutrality, performance, Release game-run, third-party or multiplayer certification follows.

## Unreadable metadata across restarts

On 16 November 2026, framework [e306982](https://github.com/0n3m0r3/rimweave/commit/e306982326fa9f96738063a527c43c22913efa66) passed **84 native checks** on **RimWorld 1.7.5011 rev24**, without a framework change. **50 existing Debug tests** covering metadata serialization, persistence, resolution and contribution operations also passed. The [persistence guide](../guides/persistence.md#keep-an-unreadable-record-across-restarts) explains the consumer decision.

The isolated profile used Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework, both composition examples and an explicitly invoked temporary driver. The driver added a counting component to the two example definitions in memory without replacing their `ContributionHediff` class. Three distinct processes completed three native saves and two direct loads: **12/33/39 checks**, respectively.

The first process created A/B on one human hand, B on the other and a whole-body B control, plus six exact references including two observers of the first B. An untouched source save was retained. A separate copy changed only the first B's metadata version from `1` to unsupported `2` and removed the whole-body control's metadata node; an XML audit verified those two semantic edits.

Both subsequent loads preserved all four native effects, their IDs, parts, severity and creation ticks. The first B's entire description was unavailable, with `LoadError` and one diagnostic naming its definition and native ID. The whole-body control had normally absent metadata, no load error and no reconstruction from XML defaults. All six references resolved their original targets; tracking remained stopped and interrupted observations survived. Additions were **4/0/0**, post-load callbacks **0/4/4**, and no removal occurred during loading.

On the first hand, identity and exclusive-claim resolution returned `InvalidMetadata` with the readable A match and the unreadable B candidate. The list-only query threw; removal by identity requested no native removal. The other hand's B remained uniquely queryable. Inspection and refused operations preserved the health list and simulation randomness. An attempted metadata mutation was refused without clearing the error.

Both later saves retained the original unknown XML in the opaque wrapper. Decoding those saves found identical payloads and diagnostics, no nested wrapper, unchanged valid metadata and no recreated metadata node on the whole-body control. The original save's hash stayed unchanged. After the last save, explicit exact-instance removal of the unreadable B succeeded once, stopped its two resumed observers and preserved A and both controls. A repeated removal returned absent without another callback. **That final cleanup was verified only in memory, not saved or reloaded.**

All three processes exited successfully; installed artifact hashes matched the committed Debug outputs. The installation was restored and all 25 normal configuration files remained unchanged. Logs included the graphics-layer Fossilize error, loader and temporary-manifest warnings, a ritual-precept restoration warning during the first load, and shutdown allocation warnings. No native reference-resolution warning or unexpected native error was found.

This verifies retention and explicit refusal for the tested unknown format, not recovery, version migration, arbitrary malformed colony files, missing provider classes, crash recovery, UI operations or multiplayer behavior. An unreadable description does not disable the effect's native gameplay behavior.

## Observed body-part snapshots

On 16 November 2026, framework [e306982](https://github.com/0n3m0r3/rimweave/commit/e306982326fa9f96738063a527c43c22913efa66) added <xref:RimWeave.References.NativeReferenceSnapshot.EffectPart>. It captures the resolved effect's native part without changing targeting, subscription coverage or persistence. **291 Debug and 276 Release tests** passed, including ten new cases covering ordinary and cooperating effects, old versus current observations, detached effects, shared records, whole-body and pawn-only references, and unavailable or loading references. The [body-part guide](../guides/health-effects.md#capture-the-observed-body-part) includes a compiled observation recipe.

The committed Debug artifacts passed **60 native checks** on **RimWorld 1.7.5011 rev24** across two distinct processes, one save and one direct load. The isolated profile used Core, Royalty, Ideology, Biotech, Odyssey, both composition examples and an explicitly invoked temporary driver. The driver substituted an instrumented subclass for B in memory and preserved its base lifecycle callbacks; the public examples were unchanged.

A pawn began with A/B on the first human hand slot and another B on the second. A controlled removal callback explicitly reassigned the target B's native `Part` and reattached that same instance to the second hand. This was the verification consumer's operation, not a new framework retargeting service. The original snapshot retained the first part while its `Effect.Part` now pointed to the second. A snapshot taken while detached kept the declared first part with `EffectAttached == false`; new captures after reattachment reported the second part. The two exact B observers recorded the native detachment and stayed stopped until explicit resumption. No part-change event was added.

The same-identity B effects on the second hand made identity lookup ambiguous, while each exact reference still named its original instance. A and the other B retained their targets, attribution, severity and creation ticks. Snapshot and query inspection left health-list membership and simulation randomness unchanged. Only one B observer resumed before saving; the other kept its own detachment observations.

A fresh process restored all five references and the three exact effects, including B's current native part and each consumer's pending observations. No tracking resumed implicitly. Per-process counters recorded additions **4/0**, removals **1/0**, and post-load callbacks **0/3**. The save audit found the three parts in native health data and no duplicate part storage in RimWeave references. Both processes exited successfully. Installed artifact hashes matched the committed Debug outputs, the installation was restored, and all 25 normal configuration files remained unchanged.

The logs contained the graphics-layer Fossilize error, loader and temporary-manifest warnings, native ritual-precept restoration warnings during loading, and shutdown allocation warnings; no native reference-resolution warning or unexpected native error was found. The evidence is limited to the human body, the stated callback ordering and the instrumented subclass. It does not certify anatomical presence, individual organ identity, arbitrary retargeting, third-party races, migrations, UI operations or multiplayer behavior.

## Interrupted removal and reattachment

On 16 November 2026, framework [8e0d7b1](https://github.com/0n3m0r3/rimweave/commit/8e0d7b14f8574028a9c0c68ebc3b44f95c90cf22) passed **60 native checks** for [callback failures and reattachment](../guides/removal.md#when-a-callback-fails-or-puts-the-effect-back) on **RimWorld 1.7.5011 rev24**, without a framework change. The isolated profile used Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework, both composition examples and an explicitly invoked temporary driver. The driver substituted an instrumented `ContributionHediff` subclass for B's definition in memory, preserving its base lifecycle calls. The public example files were unchanged. **44 existing tests** covering addition, removal, resolution and guards also passed in Debug.

One pawn carried A/B on one hand and B on the other. A separate whole-body B instance served as a deliberately nested removal target. All health mutations went through native operations via the existing adapters; the checks ran programmatically while paused:

- Two requested removals by identity reached a failing `PreRemoved` callback. Each propagated the same exception object, kept the target attached and released the guard. Nested removal of that same target returned `AlreadyRemoving`. Removal of the whole-body instance completed once inside the first callback; its absence and counted side effect survived the outer exception. The second attempt returned absent for that independent instance without another callback.
- After disabling the failure, a new explicit removal succeeded. Following explicit reattachment, a `PostRemoved` callback changed a counter and threw. The target was already absent, its observers had recorded detachment, and the counter remained changed. A historical lookup still held the target object; a new identity lookup returned `NotPresent` with null `Removal`. An exact-instance retry returned `NotPresent` without repeating callbacks. Reattachment followed by a successful removal established that the guard had also been released after this exception.
- Another `PostRemoved` callback reattached the same target through `ContributionOperations.Add`. The outer identity-based operation returned `Found` with `StillPresent`; another removal requested inside that callback returned `AlreadyRemoving`. The two target references retained the transient detachment and stayed stopped despite final attachment. Acknowledging and restarting one left the other unchanged. Disabling reattachment allowed a later removal to return `Removed`, followed by an absent retry with no callbacks.

Across these controlled operations, the target recorded five additions, seven `PreRemoved` calls and five `PostRemoved` calls. The three deliberately counted callback side effects were retained. A and the other-hand B kept their exact instances, attribution, targets, severity and creation ticks; their observers remained active without unrelated changes. Inspection preserved health-list membership and simulation randomness.

The process exited successfully. Installed artifact hashes matched the working-tree Debug outputs; the original installation was restored, the temporary helper removed, and all 25 normal configuration files remained unchanged. The log contained the graphics-layer Fossilize error, a loader warning, temporary-manifest metadata warning and shutdown allocation warnings. Expected callback exceptions were caught and compared by the driver; no unexpected native health error was found. This is not a warning-free startup claim.

This proof covers the stated callback ordering and instrumented subclass. It does not exercise UI actions, save/load, interrupted writes, process crashes, general compensation, cross-thread calls or arbitrary third-party patches. It adds no retry loop, transaction engine or callback isolation.

## Caravan division and merging

On 16 November 2026, framework [8e0d7b1](https://github.com/0n3m0r3/rimweave/commit/8e0d7b14f8574028a9c0c68ebc3b44f95c90cf22) passed the [split/merge scenario](../guides/caravan-references.md#split-and-merge-without-entering-a-map) on **RimWorld 1.7.5011 rev24**, without a framework change. The isolated profile used Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework, both unchanged composition examples and an explicitly invoked temporary driver. Twenty existing reference/snapshot and tracking tests passed in Debug.

The native run passed **165 checks** across three distinct processes, two saves and two direct loads, with successful process exits. Three colonists began in one caravan: a traveller with A/B, a witness with A and an unmodified companion. The six references started after native departure. The driver prepared native transferables and invoked the internal `Dialog_SplitCaravan` split routine by reflection, moving only the traveller. New captures reported its new caravan; an older snapshot retained the former mutable holder. The witness and companion stayed in the original caravan.

After a complete restart, exact targets and split memberships were restored without implicit tracking. Following explicit resumption, the driver selected both caravans and invoked `CaravanMergeUtility.TryMergeSelectedCaravans`. The original caravan, containing two colonists, received the traveller; only the emptied one was destroyed. The pawn remained alive, undestroyed and undiscarded with A/B attached. Another restart restored the merged membership without recreating the empty caravan.

Both holder changes left all subscriptions active with empty pending flags: no direct map or health transition was invented. Captures refreshed `ParentHolder` while `Map`/`MapHeld` remained null. Stopping, acknowledging and restarting one B observer left the other independent. Snapshot inspection preserved the traveller's and witness's health lists and simulation randomness. Exact effect identities, metadata, targets, severity and creation ticks stayed unchanged.

Fresh per-process counters recorded additions **3/0/0**, removals **0/0/0**, and native post-load callbacks **0/3/3**. Neither loading process created a colony or replayed a producer action. An independent XML audit found each of the three pawns once in `WorldPawns`, with reference-only membership lists matching the split and merged states. Both saves retained all three contributions and six exact-reference records. The original local map remained available throughout. Native autostart copies were byte-identical; tested file hashes matched the committed Debug build. Installation was restored, the helper removed and all 25 normal configuration files were unchanged.

No unresolved, unsaved-effect or discarded-pawn reference warning occurred. Graphics startup, temporary manifest, ritual-precept and shutdown-allocation messages remained. The simulation was paused and operations were invoked programmatically; the private split call is temporary instrumentation rather than a shipped API. UI clicks, travel over time, shuttle merging, prisoners, exhaustive cargo/nutrition behavior, third-party caravans, provider changes and activity continuation remain outside this proof. It adds no world-transition notification contract. Website deployment and a framework release remain separate.

## Removal of a former map

On 16 November 2026, framework [8e0d7b1](https://github.com/0n3m0r3/rimweave/commit/8e0d7b14f8574028a9c0c68ebc3b44f95c90cf22) passed the [map-removal scenario](../guides/map-removal.md) on **RimWorld 1.7.5011 rev24**, without a framework change. The isolated profile used Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework, both unchanged composition examples and an explicitly invoked temporary driver. The 11 existing reference-tracking tests also passed in Debug, including event-adapter checks for handler removal and a target whose latest map differs from the removed one.

The final native run passed **189 checks** across three distinct processes, two saves and two direct loads, with successful process exits. The traveller departed with A/B; its references acknowledged `LeftContext`. Native `Game.DeinitAndRemoveMap` then removed the only map, recording `ContextRemoved` on the four traveller observers without destroying or discarding the pawn or stopping its subscriptions. The witness had entered a separate caravan before its two subscriptions started; those observers received no historical map-removal flag. Acknowledging one B observer left the other pending.

A new process loaded the world-only save. Both pawns and all three effects resolved through native world storage, the removed map stayed absent, and all subscriptions remained stopped until explicitly resumed. Native map generation at the traveller's world tile produced a different map identity without moving either referenced pawn. The driver selected that map as the current local context before native caravan entry. Entry recorded `EnteredContext`, preserved A/B and removed only the traveller's empty caravan. The independent witness remained in its own caravan. Another complete restart restored only the new map and the correct native owners.

Fresh per-process counters recorded additions **3/0/0**, removals **0/0/0**, and native post-load callbacks **0/3/3**. Neither loading process created a new colony or replayed a producer action. Exact effect identities, metadata, targets, severity and creation ticks survived; snapshots preserved native health and simulation randomness. Tracking was never resumed implicitly.

An independent XML audit found no local map in the first save and only the new map in the second. Both characters were initially saved once in `WorldPawns`; after arrival only the traveller moved to map storage. Caravan contents referenced those native pawns. All three contributions, six exact-reference records, pending observations and explicit tracking boundaries were audited. Native autostart copies were byte-identical and tested file hashes matched the committed Debug build. The installation was restored, the helper removed and all 25 normal configuration files were unchanged.

The final run had no unresolved, unsaved-effect or discarded-pawn reference warning and no native error beyond the separately identified graphics startup message. Temporary manifest, ritual-precept and shutdown-allocation messages remained. This paused, programmatic path does not test the abandonment interface, the fate of characters left behind, pocket or third-party maps, arbitrary native relation persistence, changed providers or activity-resource cleanup. Website deployment and a framework release remain separate.

## Caravan departure and return

On 16 November 2026, framework [8e0d7b1](https://github.com/0n3m0r3/rimweave/commit/8e0d7b14f8574028a9c0c68ebc3b44f95c90cf22) passed the [caravan reference scenario](../guides/caravan-references.md) on **RimWorld 1.7.5011 rev24**, without a framework change. The isolated profile used Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework, both unchanged composition examples and an explicitly invoked temporary driver.

The run passed **168 checks** across three distinct processes, two saves and two direct loads, with successful process exits. Native `CaravanMaker.MakeCaravan` moved the traveller off the map; four observers recorded `LeftContext`. Its snapshots retained the exact pawn and A/B effects, with null `Map`/`MapHeld`, the native caravan as `ParentHolder` and `Spawned = false`. The witness stayed on the original map with its independent A unchanged.

The first fresh process restored the traveller from `WorldPawns` and resolved the caravan's native pawn reference. All six subscriptions remained stopped until explicitly resumed. Native `CaravanEnterMapUtility.Enter` then returned the pawn to its original map, delivering `EnteredContext` to its four observers and removing the empty caravan. All six subscriptions remained active; acknowledging one B observer left the other pending. The next restart retained the returned targets and observations without recreating the caravan or automatically restarting tracking.

Fresh per-process counters recorded additions **3/0/0**, removals **0/0/0**, and native post-load callbacks **0/3/3**. Both loading processes created no colony and ran no producer action. Exact effect identities, metadata, body-part targets, severity and creation ticks were preserved. Snapshot inspection left native health and simulation randomness unchanged.

An independent XML audit found one copy of the traveller under `worldPawns/pawnsAlive` in the first save, referenced by the caravan, and on the original map in the second save. The witness remained on that map. Both saves retained the same three contributions and six exact-reference records; native autostart copies were byte-identical. Tested file hashes matched the committed Debug build. Installation was restored, the helper removed and all 25 normal configuration files were unchanged.

No unresolved, unsaved-effect or discarded-pawn reference warning occurred. Graphics startup, temporary manifest, ritual-precept and shutdown-allocation messages still occurred. This paused, programmatic path does not test formation UI, a travelling route, caravan simulation over time, splitting or merging, transport pods, third-party holders, configuration changes or activity resumption. It adds no broader caravan notification contract. Website deployment and a framework release remain separate.

## Corpse destruction and native discard

On 16 November 2026, framework [8e0d7b1](https://github.com/0n3m0r3/rimweave/commit/8e0d7b14f8574028a9c0c68ebc3b44f95c90cf22) passed the [corpse/discard scenario](../guides/corpse-and-discard.md) on **RimWorld 1.7.5011 rev24**, without a framework change. It used Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework, both composition examples and an explicitly invoked temporary driver in an isolated profile. The shipped example definitions were unchanged.

The run passed **137 checks** across three distinct processes, two saves and two direct loads, with successful process exits. After native death, destroying the corpse left the same dead pawn in `WorldPawns`, with A/B attached, no holder or map and all six subscriptions active. No native retention rule was added by RimWeave. The independent witness retained its own A contribution.

After the first restart, native world storage restored the dead pawn and its effects. Explicit `RemoveAndDiscardPawnViaGC` then removed and discarded it. Health callbacks immediately stopped the three effect observers; the pawn-only reference reconciled discard at inspection. Managed references still resolved the exact discarded objects, but all four refused tracking restart. Acknowledging one B observer preserved the other. The witness's two subscriptions remained active and unchanged.

After the second restart, the four discarded-target references were unresolved with their diagnostic identities and saved observations intact. The witness and its contribution resolved normally, without substitution or automatic tracking. Fresh per-process counters recorded additions **3/0/0**, removal callbacks **0/0/0**, and native post-load callbacks **0/3/1**. The two loading processes created no colony and invoked no producer action.

An independent XML audit found the dead pawn under native `worldPawns/pawnsDead` only in the first save, no copy of its corpse in either save, and the witness on its original map in both. It checked all six references, effect identities, metadata, target, severity, creation ticks and tracking boundaries. Native autostart copies were byte-identical. Tested file hashes matched the committed Debug build; installation was restored, the helper removed and all 25 normal configuration files were unchanged.

Native warnings included four discarded-pawn reference writes from RimWeave, one native log target, two unsaved-effect warnings and three unresolved-effect links on load. Scribe omitted the discarded pawn links. Graphics startup, temporary manifest, ritual-precept and shutdown-allocation messages also occurred. This is not a warning-free serialization claim or a test of automatic garbage-collector selection, natural decay, combat, arbitrary off-map destruction, third-party cleanup, configuration changes or activity resumption. Website deployment and a framework release remain separate.

## References across game restarts

On 16 November 2026, framework commit [8e0d7b1](https://github.com/0n3m0r3/rimweave/commit/8e0d7b14f8574028a9c0c68ebc3b44f95c90cf22) passed the [three-process death/resurrection check](../guides/death-and-resurrection.md#quit-and-reload-in-a-new-process) on **RimWorld 1.7.5011 rev24**. The existing implementation needed no change. A disposable profile used Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework, both composition examples and an explicitly invoked temporary driver. The game and mod configuration stayed the same across all three processes.

The final run passed **164 checks**, with two saves, two direct loads and three distinct process IDs, all exiting successfully. The driver initialized fresh callback counters before native loading in each process. Expected identities and metadata were kept externally for comparison only; native saves restored the objects. Diagnostic records were frozen at capture, so later actions could not change earlier counter observations.

| Process | Native operation | Contribution additions | Contribution removals | Native post-load callbacks |
| --- | --- | --- | --- | --- |
| 1 | Create the disposable colony, explicitly add A/B, kill the pawn, save and exit | 2 explicit additions | 0 | 0 |
| 2 | Directly load the dead pawn, explicitly resume tracking, resurrect, create a new B, save and exit | 0 during load; 1 explicit replacement afterward | 0; native resurrection bypasses `PostRemoved` | 1 each for original A/B |
| 3 | Directly load the resurrected pawn and inspect | 0 | 0 | 1 each for A/new B |

The dead load retained the original pawn, corpse, two effects, metadata and pending observations. All subscriptions stayed stopped until explicit resumption; acknowledging one loaded observer left the other untouched. The final load retained A and the new B with their own native identities, while both old B references remained unresolved and retained their diagnostic identity. The temporary B-definition flag was configured independently in each process; the shipped example XML remained unchanged.

An independent XML audit checked both saves for native ownership, effect identities, metadata, target, severity, creation ticks and saved reference state. Byte-identical autostart copies were verified; the two loading processes created no new colony. The tested files matched the committed Debug build. Installed files were restored, the temporary driver removed and all 25 normal configuration files remained unchanged.

The old B target produced one expected save warning and two unresolved-reference warnings on the final load. Graphics startup, temporary manifest, ritual-precept and shutdown-allocation messages also occurred. This is not a warning-free serialization claim. The run covers programmatic native operations and clean process exits with one fixed configuration. Menu interactions, interrupted writes, version or provider changes, third-party resurrection, corpse cleanup and activity resumption remain unverified. The API snapshot remains pinned to 8e0d7b1; website deployment and a framework release remain separate.

## Native death and resurrection

Framework commit [8e0d7b1](https://github.com/0n3m0r3/rimweave/commit/8e0d7b14f8574028a9c0c68ebc3b44f95c90cf22) fixes subscription loss after native death. On **RimWorld 1.7.5011 rev24**, `Pawn.Kill` sets both `Dead` and `Destroyed` while the corpse retains the pawn. The previous implementation stopped tracking at inspection and rejected restarting it. An initial native run reproduced the failure at its 52nd check; two new automated cases also failed before the correction.

The corrected implementation shares one eligibility rule between inspection and subscription start. Dead, non-discarded pawns can remain tracked; discarded pawns, destroyed living pawns and detached effects cannot. Four new automated cases cover native corpse state for pawn/effect references, dead-pawn discard and independent reconciliation of a silently removed effect. The full working-tree suites passed **281 Debug / 266 Release tests**.

On 16 November 2026, the [death/resurrection scenario](../guides/death-and-resurrection.md) passed **139 checks**, with two native saves and two complete reloads in one game process. It used Core, Royalty, Ideology, Biotech, Odyssey, the prepared Debug framework, both composition examples and an explicitly invoked temporary driver. B's definition temporarily used `forceRemoveOnResurrection` in that process; the shipped example XML was unchanged.

Death retained the exact pawn, its corpse and both effects. The dead save kept the same native identities, metadata and pending observations without resuming tracking on load. After an explicit restart, native resurrection retained A and removed B without `PostRemoved`. Only A reported resurrection. Both old B observers reconciled detachment and stopped; neither selected an explicitly created replacement B. The second reload retained A and the new B while both old references became unresolved. Counters recorded exactly three explicit additions and no removal callbacks.

An independent XML audit confirmed native pawn/corpse storage, effect identities, metadata, target, severity and creation ticks in both saves. The final Debug artifacts matched those used in the successful run. Inspection preserved native health, ownership and simulation random state. Installed files were restored, the temporary helper removed and normal player configuration unchanged.

The removed B reference produced the expected native save warning and two unresolved-reference warnings on load. Graphics startup (including a Fossilize filter error), temporary-driver manifest, ritual-precept and shutdown-allocation messages also occurred. This is not a warning-free serialization claim. Fatal attacks, resurrection items, manual UI, corpse decay/destruction, caravans, third-party resurrection and separate-process loading remain outside this run. The API snapshot is exported from the clean corrected framework commit; website deployment and a framework release remain separate steps.

## Native holder context

Framework commit [edb7e42](https://github.com/0n3m0r3/rimweave/commit/edb7e42be6cb241bd39373d47312d34b8bc099f1) adds `ParentHolder` and `MapHeld` to `NativeReferenceSnapshot`. It reads the pawn's native properties without changing `Map` or `Spawned`, storing a holder graph, modifying the reference save format or expanding notification coverage. Six new automated cases cover pawn/effect references, nested holders, off-map holders, fresh captures and unavailable references. The full working-tree suites passed **277 Debug / 262 Release tests**, with a final Debug build and no compiler warnings or errors.

On 13 November 2026, the [casket scenario](../guides/held-references.md) passed **167 checks** in one **RimWorld 1.7.5005 rev1082** process, with two native saves and two complete reloads. It used Core, Royalty, Ideology, Biotech, Odyssey, the prepared Debug framework, both composition examples and an explicitly invoked temporary driver.

The direct-spawned pawn had its map as its immediate native holder. Entering a cryptosleep casket kept the pawn and its two hand contributions resolved; `Map` became null and `Spawned` false, while `ParentHolder` named the casket and `MapHeld` named its map. Temporarily despawning the occupied casket made only the held map unavailable; respawning it restored that observation. Captures preserved the simulation random state, native health list, ownership and pending observations.

Loading while contained retained the same pawn and effects without restarting tracking or replaying additions. After an explicit tracking restart, native ejection reported direct map entry. The released state survived the second reload. Counters recorded two contribution additions and no contribution removals. A separate XML audit confirmed native containment only in the first save, unchanged effect identities and metadata in both files, and no added holder/map fields in the three saved references.

The final Debug artifacts matched those used by the game run. Installed mod files were restored, the helper removed and normal player configuration was unchanged. Graphics startup, temporary-driver manifest, ideology and shutdown-allocation warnings remained. Ejection used the native cryptosleep-sickness behavior; this check preserves the two contributions, not the entire health list across that operation.

This is a programmatic native casket test, not manual UI validation, transport-history tracking or evidence for arbitrary containers, caravans, destruction and separate-process loading. Nested-holder behavior is covered by controlled fixtures. The API snapshot is exported from that clean framework commit; website deployment and a framework release remain separate steps.

## Native prosthesis removal and reinstallation

On 12 November 2026, the [native recipe-worker scenario](../guides/native-prosthesis-removal.md) passed **164 checks**, with three native saves and three complete reloads in one **RimWorld 1.7.5005 rev1082** process. It used Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework, both composition examples and an explicitly invoked temporary driver. Framework source and binaries were unchanged from published [b74b256](https://github.com/0n3m0r3/rimweave/commit/b74b256a3dbe11f889d6d1a74b599e2b97e27e8e); this increment adds documentation, not a new runtime API. The driver compiled without warnings or errors.

The native `InstallBionicArm` recipe selected the Human body's `Shoulder` sites at indices 23 and 34. The target implant occupied index 23; natural `Arm` and `Hand` descendants were missing and contribution additions to them returned `MissingPart`. A and B occupied the implanted shoulder, with independent controls on the opposite shoulder. Native `RemoveBodyPart` removed the implant and both targeted markers and left that shoulder missing. Their tracked references recorded detachment; the ordinary implant was reevaluated at `Capture()`, while the cooperating markers supplied their removal callbacks. Repeated exact removal of the absent markers returned `NotPresent` without repeating callbacks or affecting controls.

The first reload preserved the missing site and left the original implant and marker references unresolved. Native reinstallation used the same shoulder slot but created a new implant identity, without recreating contributions; that state survived a second reload. Only explicit A/B calls created new effects, which survived the third reload. Six contribution-addition callbacks and two removal callbacks occurred in total. Loading replayed no addition and restarted no tracking. Passive queries preserved the simulation random state and native health list.

A separate XML audit checked all three saves: the five original reference identities stayed fixed, removed effects were absent, the replacement implant persisted, and the opposite shoulder's controls retained their exact native IDs, target, metadata, severity and creation ticks. Final local artifacts matched the tested binaries. Installed mod files were restored, the temporary helper removed and normal player configuration was unchanged.

An initial attempt stopped at its target assertion before installation: it supplied `Arm`, whereas the recipe accepts `Shoulder`. Inspection of the native definition corrected the fixture to use the worker's candidate list. This finding distinguishes the earlier direct-health placement from a recipe-selected site; it did not require a framework change. The completed run emitted warnings for three removed references at its first save/load, plus graphics, temporary-manifest, ideology and shutdown-allocation warnings. It was not a warning-free run.

The recipe workers were called without a surgeon, ingredients or a bill. This bypasses surgeon-dependent failures, work and recovered-item spawning; no complete player surgery or item recovery was tested. The run also does not establish separate-process loading, arbitrary third-party recipes, custom anatomy, provider removal or behavior with `keepOnBodyPartRestoration` enabled.

## Native prosthetic arm

On 12 November 2026, the [prosthetic-arm scenario](../guides/native-prosthesis.md) passed **141 checks**, with two native saves and two complete reloads in one **RimWorld 1.7.5005 rev1082** process. The configuration contained Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework, both composition examples and an explicitly invoked temporary verification driver. Runtime code was unchanged from published [framework commit e4f121d](https://github.com/0n3m0r3/rimweave/commit/e4f121d7521386a88a25f2b1b31647cbcabe363d). Two local guard tests were added; the working-tree suites passed **271 Debug / 256 Release tests**, without build warnings or errors. One test deliberately stops in a callback after native insertion; these fixtures do not replace the completed game run.

A and B were attached to the Human body's arm and hand at native indices 25 and 28, with independent controls at indices 36 and 39. This fixture supplied `Arm` directly to the health tracker; it did not use the surgery recipe, whose native target is `Shoulder` as verified in the separate run above. Adding native `BionicArm` at index 25 removed the four targeted contributions and stopped their observers. The arm slot remained available and its natural hand became missing. Both providers refused the missing hand without falling back to the artificial arm or the other hand. Two new explicit applications on the arm succeeded with new native IDs; all four original references remained unresolved after loading, including when matching contributions existed again.

Counters recorded ten explicit contribution additions and four removals across the run; loading replayed no addition and restarted no tracking. The other side's four effects retained their native IDs, exact targets, metadata, severity and creation ticks. Passive inspection preserved the health list and simulation random state. A separate XML audit checked both saves, the eight original reference identities, the missing hand and the same exact prosthesis. The final local binaries matched the tested artifacts; installed mod files were restored and normal player configuration was unchanged.

Both marker definitions use `keepOnBodyPartRestoration = false`. The first save/load emitted native warnings for the four referenced effects no longer owned by the save. Graphics startup, temporary-driver manifest, ideology and shutdown allocation warnings were also present; this was not a warning-free run. The completed check used direct health calls, without the surgery recipe, doctor, costs, failure roll or manual UI. It does not verify prosthesis removal, another process, altered anatomy, third-party prostheses or arbitrary providers. No runtime API or automatic reapplication was added.

## Native hand loss and restoration

On 12 November 2026, the [lost-hand scenario](../guides/hand-restoration.md) passed **103 checks**, with three native saves and three complete reloads in one **RimWorld 1.7.5005 rev1082** process. The configuration contained Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework, both composition examples and an explicitly invoked temporary verification driver. Runtime code was unchanged from [5c7bf7a](https://github.com/0n3m0r3/rimweave/commit/5c7bf7a833ae3cd456599409adcbab0bcb6007cc); the local guard test was strengthened. The complete working-tree suites passed **269 Debug / 254 Release tests**, without build warnings or errors.

A and B were attached to the Human body's hand at native index 28, with independent A/B controls at index 39. Native loss removed both targeted markers and stopped their active observers. Both providers refused additions to the missing hand without selecting the other hand. Native restoration, followed by reloading, left the restored slot empty. Only new explicit applications created replacement effects, with distinct native IDs. The saved original references remained unresolved, even after the new matching contributions were saved and loaded.

Counters recorded six addition callbacks and two contribution-removal callbacks across the entire run; loading did not replay additions. Passive reference and contribution queries preserved the simulation random state and health list. A separate XML audit checked all three saves: the original removed effects were absent, the four references retained their original diagnostic identities, and the other hand's controls kept their native IDs, target, metadata, severity and creation ticks. Final local binaries matched the tested artifacts. Installed mod files were restored and the normal player configuration was unchanged.

Both marker definitions use `keepOnBodyPartRestoration = false`. The first save/load emitted the expected native warnings for two referenced effects that were no longer saved; their diagnostic identities remained available. Engine/graphics and temporary-driver manifest warnings were also present. This is not a warning-free game run, a manual UI/surgery test, a separate-process reload test or evidence for prostheses, altered anatomies and arbitrary providers. No new runtime API or automatic anatomical behavior was added.

## XML contribution declarations

The [XML declaration adapter](../guides/xml-declarations.md) is included in the documented revision, published in [framework commit 5c7bf7a](https://github.com/0n3m0r3/rimweave/commit/5c7bf7a833ae3cd456599409adcbab0bcb6007cc). It adds optional creation defaults for `ContributionHediff`; the saved metadata format remains version `1`. B's example now reads its identity and claim from its native XML definition, while A keeps its C# initialization. The API snapshot is exported from that committed framework revision, with source links pinned to it.

On 11 November 2026, the final framework tree passed **269 tests in Debug and 254 in Release**, without build warnings or errors. Targeted checks cover the real peer XML through the native parser, shared validation, independent metadata, passive reads, creation callback order and saved metadata after definition changes. Controlled Scribe tests also preserve missing and unreadable metadata instead of substituting XML defaults. A separate counter-analysis strengthened the callback test to capture values at callback time.

Two completed **RimWorld 1.7.5005 rev1082** processes passed **69 checks** (29 and 40), with two native saves and three native loads. Each used Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework, A, B and a temporary explicitly invoked verification driver. Both installed providers remained present. The target was the Human body's first hand, at native index 28 in the fixture.

The first run created A and B, then saved and loaded them. The second restarted with B's XML owner, local identity and claim changed, loaded a copy of that original, created a new B and saved and loaded again. The old effects kept their native IDs, saved declarations, target, severity and origins. The new B received the new XML values and coexisted with both originals. Counters verified that metadata was present during B's creation callback and that no creation or addition callback was replayed on load. Looking up the new identity did not silently select old B. Removing new B preserved old B and A; explicitly removing old B by its saved identity preserved A.

An independent XML audit confirmed unchanged original attribution fields in the derived save and separately encoded new B metadata. Native age and visibility fields changed during loading and ticking; these checks do not establish that the whole simulation was frozen. Source save hashes were preserved. No managed exception or native save/load error occurred in the two completed runs; graphics startup diagnostics and engine warnings remained. Two preliminary attempts required fixes in the disposable driver's diagnostics and JSON reporting, without changing the framework implementation. The original mod installation was restored, the helper removed and normal game configuration verified unchanged.

This run used programmatic native calls, with no manual UI test. It does not repeat the earlier four-configuration load-order matrix or test missing providers, custom subclass migration, arbitrary addons or multiplayer. Missing and unreadable metadata were tested in controlled Scribe graphs, not deliberately corrupted full colonies.

## Two-consumer scenario

The [composition procedure](../guides/composition.md) uses RimWeave Example and RimWeave Example Peer as independently loadable consumers, published in [framework commit 189137c](https://github.com/0n3m0r3/rimweave/commit/189137ca1655ba74a530c646492198de6d0ed1c6). It targets the same first native hand, keeps owner-qualified identities separate and reports a deliberately shared exclusive claim without arbitration. That scenario increment did not change the public framework API; its documentation snapshot was pinned to `ce48935`.

On 10 November 2026, this increment passed 249 tests in Debug and 234 in Release; both builds completed without warnings or errors. A temporary driver then passed 272 assertions across four separate RimWorld 1.7.5000 rev1275 processes: A then B (82), B then A (82), A alone (54) and B alone (54). Each used a fresh colony with Core, Royalty, Ideology, Biotech and Odyssey, plus the Debug framework and the stated consumers. All four completed two native saves and reloads, for eight complete cycles.

The tested target was the Human body's first native hand, at body-part index 28 in that fixture. Both load orders produced the same sets of owner-qualified identities and semantic outcomes. The shared exclusive claim stayed ambiguous while both contributions were present. Withdrawing B by identity after reload preserved A's exact instance and made the claim unique; a second reload preserved that remaining state. Single-consumer runs passed without the opposite package, assembly or definition.

After each load, native IDs, metadata, target and cardinality were checked before any producer call. These observations establish persistence without duplicate contributions in this scenario; no callback counter was instrumented. Calls used the public producers and guarded developer entry points programmatically, without manual menu clicks. The solo runs do not test uninstalling a provider from an existing save. No third-party addon, migration, multiplayer or universal compatibility claim follows. Native engine logs included warnings; the compiler result does not describe the game console. The temporary driver was removed and the original mod installation restored.

## Provider removal and return

The [missing-provider procedure](../guides/provider-removal.md) compares an untouched original AB save, loading without B, and returning B to either the original or a file saved during its absence. It uses the consumers already published in [framework commit 189137c](https://github.com/0n3m0r3/rimweave/commit/189137ca1655ba74a530c646492198de6d0ed1c6). B supplies its effect definition; the effect class remains available from the framework. That investigation did not change the API snapshot.

On 11 November 2026 (UTC+1), the published source passed 249 tests in Debug and 234 in Release against the installed game assemblies, with no build warnings or errors. The native investigation ran on **RimWorld 1.7.5005 rev1082**, separately from the earlier composition run on 1.7.5000. Core, Royalty, Ideology, Biotech, Odyssey, the framework, A and a temporary driver stayed fixed; only B varied.

Five separate game processes completed 90 protocol and observed-state checks, with two native saves and five native loads. These counts describe completed verification, not successful recovery of every contribution:

| Run | Observed state after loading | Checks |
| --- | --- | --- |
| Create AB source and reload its control | A and B retained their original native identities, declarations and targets. | 25 |
| Load an original copy without B, without saving | Loading completed; A remained intact and B was absent. | 15 |
| Restore B and load another original copy | Both original contributions returned intact. | 18 |
| Load a fresh original copy without B and save under another name | A remained intact; B was absent from the derived save. | 18 |
| Restore B and load the derived save | A remained intact; B was still absent despite its provider being active. | 14 |

Each load without B completed with three native errors: B's missing definition, a `NullReferenceException` in native `HediffWithComps.InitializeComps` during loading, and cleanup of null health entries. B was not retained despite the framework class remaining available. This was not a clean uninstall or a warning-free load. Independent XML inspection found both effects in the original and only A in the derived file, with no remaining B definition or encoded owner declaration. A's native ID, metadata, body target, severity and creation tick were identical in both files. The master and every branch input retained their original file hashes.

The driver made two producer calls to create the source contributions and none afterward. All post-load observations preceded any producer command. Native identities, declarations and counts were checked, without instrumenting callback counts or clicking the UI manually. This establishes recovery from the preserved original in this configuration, **not recovery of B from the derived save**. It does not test missing provider classes, arbitrary addons, migrations or irreversible gameplay consequences. The temporary driver was removed, the original mod installation restored and normal game configuration left unchanged.

## Prepared provider removal

The [prepared-removal procedure](../guides/prepared-removal.md) withdraws B while its provider is still loaded, saves that state, then verifies it without B and after B returns. It reuses the consumers and removal API published in [framework commit 189137c](https://github.com/0n3m0r3/rimweave/commit/189137ca1655ba74a530c646492198de6d0ed1c6); no production code or API snapshot changed.

On 11 November 2026 (UTC+1), three separate **RimWorld 1.7.5005 rev1082** processes completed 84 checks, four native loads and one native save. They used the protected AB original from the missing-provider investigation, the same frozen Debug artifacts, Core, Royalty, Ideology, Biotech and Odyssey. A temporary driver remained fixed across these runs; only B's active-package state varied.

| Run | Observed result | Checks |
| --- | --- | --- |
| Load original AB, withdraw B, save and reload with B active | Both original effects were verified before withdrawal. B's first removal returned `Found` / `Removed`; repetition returned `NotPresent` without requesting native removal. The prepared reload retained A and no B. | 44 |
| Restart without B and load a prepared copy | B's package, assembly and definition were absent. A retained its identity, declarations, target and severity; B remained absent. | 20 |
| Restart with B restored and load another prepared copy | A retained those same fields; B remained absent before any producer command. | 20 |

The driver made two explicit removal requests during preparation and no addition calls. The absence and return processes made no producer calls. Each prepared-state observation resolved the shared exclusive claim uniquely to A. No native save/load error was recorded, including the missing-definition, initialization exception and null-entry cleanup seen in the unprepared-removal investigation. Graphics startup diagnostics and engine warnings remained; this is not a claim that the entire console was empty.

A separate XML audit confirmed that the prepared file contained A's contribution and no B effect definition or encoded owner metadata. A's saved native ID, contribution metadata, definition, exact target, severity and creation tick were unchanged. Its native age and visibility fields did change (`ageTicks=3`, `visible=True`), while the saved game tick advanced from 1 to 3. These fields are updated by native ticking; the checks do not establish that every field of A or the simulation remained frozen. Both protected originals, the prepared source and every branch input kept their file hashes.

The helper used programmatic native loading and the provider's public removal API, without manual menu interaction or a global callback counter. This result concerns one known marker on one known pawn and part. It does not certify global provider cleanup, absent custom classes, automatic producers in other mods, or reversal of irreversible effects. The original installation was restored, the helper removed and the normal game configuration verified unchanged.

## Targeted addition

The [explicit addition adapter](../guides/health-effects.md#observe-the-addition) is included in the documented revision and published in [framework commit ce48935](https://github.com/0n3m0r3/rimweave/commit/ce48935b3f2414aa140b731e0fc3486cdc4bc273). It requests native addition of one prepared `ContributionHediff` and reports the exact instance's observed attachment. Same-instance repetition and reentrancy guards do not impose a stacking policy or reject distinct objects merely because their contribution identities match.

On 10 November 2026, this increment passed 229 tests in Debug and 224 in Release, including 17 targeted addition tests; both builds completed without warnings or errors. Independent review found no material defect in the code, tests or guide. The documentation recipe is compiled against the documented framework revision during API export; compilation does not execute native addition.

A temporary driver passed 52 assertions and observed all 11 addition statuses in a disposable RimWorld 1.7.5000 rev1275 colony with Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework and the example. Checks covered independent same-definition contributions, the opposite hand, shared body-part records, whole-body targeting, refusals, repetition and reentrancy. Native `PostAdd` and later `HediffGiver.OnHediffAdded` callbacks exercised removal and changed owner/part fields before the result was captured. Exceptions preserved partial changes and allowed a later attempt; legitimate mutation randomness was not rewound. The extension API also worked without developer mode.

Absorption by an ordinary effect used a deliberately constructed mixed-class fixture, not an actual third-party addon. The run exercised programmatic native calls, with no manual UI or new save/load test. These results cover the tested configuration, not arbitrary providers or universal compatibility. The temporary driver was removed and the original mod installation restored.

## Health contribution diagnostic

The [health contribution report](../guides/debugging.md#inspect-declared-health-contributions) was introduced in [framework commit 2f6be47](https://github.com/0n3m0r3/rimweave/commit/2f6be47af59a84b5bb041bd541f11989cfbe7a23) and is included in the documented revision. It inspects one pawn's attached health effects and declared metadata, with explicit bounds and incomplete-result markers. It does not establish the actual origin of an undeclared effect, provider presence, gameplay eligibility or general compatibility.

On 9 November 2026, the full suite with this diagnostic passed 205 tests in Debug and 203 in Release; both builds completed without warnings or errors. Release inspection confirmed no debug actions, and no game assemblies were copied into the installable mod.

A temporary verification driver passed 35 assertions in a disposable RimWorld 1.7.5000 rev1275 colony with Core, Royalty, Ideology, Biotech, Odyssey and the Debug framework, without the optional example. Checks distinguished identity ambiguity from an exclusive claim conflict on one hand, kept the other hand separate, retained unknown and unreadable states, refreshed after native removal and marked the 40-effect limit. Reports preserved exact effects, severity, targets, consumer tracking and simulation randomness; opaque source values and raw errors stayed hidden.

The actual dialog's opening, isolated repaint and closing paths also preserved simulation randomness. Two native screenshots were reviewed for readability. Scroll position was set programmatically; debug-menu clicks and mouse-wheel interaction were not tested. Unreadable metadata was injected as a controlled failure state, so this run adds no Scribe save/load evidence. These checks cover that diagnostic and its fixtures, not arbitrary providers or multiplayer configurations.

## Native reference tracking

The documented framework revision includes exact native references and per-consumer observations of supported transitions. Automated checks cover current-state inspection, native map event adapters, cooperating health callbacks and native Scribe reference resolution, including rejection of references created or loaded without an owning game. On 9 November 2026, the framework and example described below passed 192 tests in Debug and 190 in Release, with no build warnings or errors. No game assemblies were copied into the installable mod directories.

These checks use controlled native objects and save graphs. They do not establish a complete colony load, a full movement/death/resurrection sequence in game, or compatibility with arbitrary providers. Some native removals bypass callbacks; direct map presence does not cover every carried or contained pawn, and arbitrary off-map destruction has no immediate notification guarantee. See [the integration boundaries](../guides/health-effects.md#keep-a-reference-when-the-character-moves).

### In-game reference scenario

On 9 November 2026, a disposable colony ran on RimWorld 1.7.5000 rev1275 with Core, Royalty, Ideology, Biotech, Odyssey, RimWeave Framework, RimWeave Example and a temporary verification driver. The driver invoked the example's guarded command entry point inside the game; it did not test the debug menus. The tested scenario code is published in [framework commit dd5d0e3](https://github.com/0n3m0r3/rimweave/commit/dd5d0e36a4ebaec7b34e61f6474d006c4149f2d2).

All 34 assertions passed, including direct native departure and return, independent acknowledgement by two consumers, exact-effect removal with the similar effect preserved, and two complete native colony save/load cycles. Loading preserved observations and diagnostic identities without automatically resuming tracking or replaying scenario commands. After the second load, the removed target remained unresolved and the similar effect stayed attached. Starting with developer mode disabled was refused before adding markers; an untouched game and passive inspection created no scenario.

Native save/load warnings for the removed effect are expected in this scenario: no owner serializes that detached target. Its reference retains the diagnostic identity, becomes unresolved after loading and never substitutes the surviving effect. This result does not promise warning-free native serialization. It also does not establish caravan or container transport, death/resurrection behavior, UI interactions, or compatibility with arbitrary providers. See [the reproducible scenario](../guides/debugging.md#verify-native-references-across-a-reload).

## Published corrections

A later independent review reproduced two defects in the published framework on RimWorld 1.7.5000 rev1275: a reentrant exact-effect removal invoked both native removal callbacks twice, and the reference scenario's report changed simulation randomness at opening and closing. These observations supplement the earlier checks; they do not invalidate the narrower results those checks measured.

The documented revision includes both corrections, published in [framework commit bbed0b6](https://github.com/0n3m0r3/rimweave/commit/bbed0b63b9d93722bca5c7227972e38b629f6b63): [an explicit result for reentrant removal](../guides/removal.md#when-a-removal-callback-requests-the-same-removal) and [passive reference-report presentation](../guides/debugging.md#verify-native-references-across-a-reload). The generated API includes `AlreadyRemoving` and its exact-instance contract.

On 9 November 2026, the final corrected working tree passed 212 tests in Debug and 207 in Release, with no build warnings or errors. An independent review checked both fixes. The presentation helper and debug commands are absent from Release.

A temporary driver passed 35 assertions in a disposable RimWorld 1.7.5000 rev1275 colony with Core, Royalty, Ideology, Biotech, Odyssey, the Debug framework and example. The nested removal returned `AlreadyRemoving`, the outer call returned `Removed`, and each before/after callback ran once. A later attempt after an exception, reattachment of the same instance and nested removal of another instance also passed. Opening, one isolated repaint and closing both report dialogs preserved simulation randomness. A real scenario removal command retained a native observer's random draw, confirming that presentation isolation did not rewind the gameplay action.

Two native screenshots were reviewed for readability. These checks used programmatic entry points and rendering instrumentation, not manual menu or mouse interactions; they do not establish compatibility with arbitrary providers. They cover the fixes published in `bbed0b6`, not earlier framework revisions.

## Explicit limitations

| Capability | Current state |
| --- | --- |
| Contribution metadata after save/load | Implemented for `ContributionHediff`; another object must explicitly use the persistence helper in its own save/load code. See [Keep information through a save](../guides/persistence.md). |
| Migration or provider removal | No general migration or removal/reinstallation guarantee. The initial save/load contract assumes the required classes and definitions remain available. |
| Automatic discovery of other mods' origins | Not implemented. A provider or explicit adapter must supply provenance. |
| General gameplay conflict detection | Not implemented. Queries report declared identities and exclusive claims in their supplied scope. |
| Object, equipment or activity adapters | No native adapter delivered by this preview. Generic test consumers are not such integrations. |
| RJW binary compatibility | Not promised or verified. |
| Multiplayer determinism and performance budgets | Not verified. |

## Target and dependencies

The current target is RimWorld 1.7 with .NET 10. Evidence from older game versions does not certify this target. Neither Harmony nor HugsLib is a required dependency of the present framework project.

Extensions own their compatibility statements and adapters. An effect added through a native API by another mod remains native; it does not automatically acquire RimWeave metadata. An exact-instance operation may still be usable when its documented preconditions hold.

Report a compatibility finding with exact versions, a minimal scenario and observable results. Describe an untested interaction as an investigation rather than asserting either universal compatibility or incompatibility.
