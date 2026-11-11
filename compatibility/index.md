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
| Saving contribution metadata | Automated tests using the native Scribe save/load phases for a health effect and a separate data owner | Does not establish full-colony reload behavior or arbitrary provider compatibility. |
| Unreadable saved metadata | Automated rejection of unsupported or malformed metadata, preservation for later saves, and incomplete-query results | Does not repair a damaged save or replace missing third-party classes. |
| Passive inspection | Implemented as native state reads and diagnostic output | Full neutrality across all game configurations is not certified. |

The original repeated-removal example contains two observers in one mod. That check is distinct from the [two-consumer scenario](#two-consumer-scenario) below; neither establishes compatibility between arbitrary independent mods.

## Two-consumer scenario

The [composition procedure](../guides/composition.md) uses RimWeave Example and RimWeave Example Peer as independently loadable consumers, published in [framework commit 189137c](https://github.com/0n3m0r3/rimweave/commit/189137ca1655ba74a530c646492198de6d0ed1c6). It targets the same first native hand, keeps owner-qualified identities separate and reports a deliberately shared exclusive claim without arbitration. The public framework API is unchanged; its documented snapshot remains pinned to `ce48935`.

On 10 November 2026, this increment passed 249 tests in Debug and 234 in Release; both builds completed without warnings or errors. A temporary driver then passed 272 assertions across four separate RimWorld 1.7.5000 rev1275 processes: A then B (82), B then A (82), A alone (54) and B alone (54). Each used a fresh colony with Core, Royalty, Ideology, Biotech and Odyssey, plus the Debug framework and the stated consumers. All four completed two native saves and reloads, for eight complete cycles.

The tested target was the Human body's first native hand, at body-part index 28 in that fixture. Both load orders produced the same sets of owner-qualified identities and semantic outcomes. The shared exclusive claim stayed ambiguous while both contributions were present. Withdrawing B by identity after reload preserved A's exact instance and made the claim unique; a second reload preserved that remaining state. Single-consumer runs passed without the opposite package, assembly or definition.

After each load, native IDs, metadata, target and cardinality were checked before any producer call. These observations establish persistence without duplicate contributions in this scenario; no callback counter was instrumented. Calls used the public producers and guarded developer entry points programmatically, without manual menu clicks. The solo runs do not test uninstalling a provider from an existing save. No third-party addon, migration, multiplayer or universal compatibility claim follows. Native engine logs included warnings; the compiler result does not describe the game console. The temporary driver was removed and the original mod installation restored.

## Provider removal and return

The [missing-provider procedure](../guides/provider-removal.md) compares an untouched original AB save, loading without B, and returning B to either the original or a file saved during its absence. It uses the consumers already published in [framework commit 189137c](https://github.com/0n3m0r3/rimweave/commit/189137ca1655ba74a530c646492198de6d0ed1c6). B supplies its effect definition; the effect class remains available from the framework. The API snapshot is unchanged.

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
