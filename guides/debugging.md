---
title: Inspect and debug
description: Locate the developer commands, understand their guards and reproduce the native callback check.
---

# Inspect and debug

The developer example lets you add a harmless marker to a character's hand, remove it, and check that a repeated removal does not notify the same removal handlers twice. It is a way to observe the guard in the running game. Opening the tool does not apply the marker.

Build the framework and optional example in **Debug**, install them separately, and enable the framework before the example. Release builds omit their debug commands. Use a disposable test colony for commands that modify health state.

## Read the native log

`RimWeaveLog.Message` writes through RimWorld's log and adds `[RimWeave]` at the beginning of every normalized line. It does not open a separate console. Enabling developer mode gives access to the game's debug log and actions interface.

The logger does not determine whether an operation failed. The calling mod reads the operation's result and chooses whether to log it. In this example, two components observe the same removal. Two messages can therefore describe one operation; the check below counts their removal handlers, also called callbacks.

## Inspect a character without changing it

Select one character on the map. RimWorld calls these entities pawns; animals and other creatures also use that native type. Open the debug actions menu using the third button in the top developer toolbar, whose tooltip is **Open debug actions menu.** Search for **Log selected pawn body**.

The report lists body slots, parent slots, definitions, labels, directly missing parts and attached health effects. An index identifies a slot in that inspected body list; it is not a permanent organ ID. The command reads state and logs a snapshot without applying effects or consuming simulation randomness.

## Inspect declared health contributions

> [!NOTE]
> This diagnostic was introduced in [framework commit 2f6be47](https://github.com/0n3m0r3/rimweave/commit/2f6be47af59a84b5bb041bd541f11989cfbe7a23) and is included in the [documented revision](../compatibility/versions.md).

The glove mod and the surgical mod can both affect the same hand. To understand which declarations are actually present, select the character, enable developer mode, and choose **Inspect selected pawn health contributions** in the debug actions menu. This command belongs to the framework; the optional example mod is not required. It opens a scrollable **Health contributions** report without writing the report to the log automatically.

Read each effect's native identity and exact body-part occurrence before comparing its metadata. Whole-body effects form a separate scope. The declaring mod's identifier is a supplied attribution, not proof that this code created the effect or that its provider is currently installed. **Definition package** separately names the package that supplied the effect's definition; it does not identify the code that added this instance. `ContributionHediff` supplies the inspected metadata. Other `Hediff` classes are reported as non-cooperating; the report does not guess their attribution.

The report keeps these cases separate:

- Several effects declaring the same contribution identity make an identity lookup ambiguous. Matching native IDs identify the candidates, including when a long displayed key is shortened.
- Several effects declaring the same exclusive responsibility make competing claims. This does not choose a winner or prove a gameplay conflict.
- An unreadable metadata record makes conclusions in its scope incomplete, even when readable matches exist. The report does not repair it.
- An omitted origin, an explicitly unknown origin and a custom origin retain their distinct meanings. An opaque source reference is shown only as present or absent; its value is not printed.

The report reads up to 40 attached effects and caps the output at 16,000 characters. Omitting effects or report content is marked as an incomplete diagnostic. Long fields are marked separately: at most 120 source characters are retained, then escaped for display. It reads the supplied health adapter's metadata; it does not call arbitrary providers to reconstruct ownership or history. These declarations do not explain a missing provider or a gameplay refusal by themselves.

Inspection does not apply or remove an effect, start tracking, acknowledge observations, repair metadata or consume simulation randomness. Close and reopen to read the current state; an open report is a snapshot. There is no background collection, automatic file export or retained diagnostic history. The [recorded colony check](../compatibility/index.md#health-contribution-diagnostic) exercised the actual dialog's opening, repaint and closing paths; debug-menu clicks and mouse-wheel interactions remain untested.

## Add and remove the example marker

1. In the debug actions menu, search for **marker**. The filter matches action names, not just category names.
2. Select **T: Add marker to hand**, then click a living pawn with hands on the map. Prefer a pawn standing alone on its cell.
3. Choose the intended hand from the menu. Opening the menu alone does not attach anything.
4. Repeat the add to verify the duplicate is refused. Use **T: Remove marker from hand** to remove it.

Developer mode and target availability are checked again when the hand action executes. A pawn with no hand slots has no valid choice for this particular example. This example's hand-specific policy is not a framework restriction on other pawn kinds or targets.

The marker currently uses an ordinary `HediffWithComps`, with two native callback observers. It demonstrates the exact-instance removal guard; it is not an example of `ContributionHediff` attribution or identity-based lookup.

## Verify repeated removal

Add a marker, then select **T: Verify repeated marker removal**, click the same pawn and select the same hand. The check retains the instance and requests removal twice.

Expected result:

```text
Repeated marker removal PASS: first=Removed, second=NotPresent; callbacks first=[1,1], second=[0,0].
```

Each observer ran once on the first removal and zero times on the repeated call. A failure displays the observed values. Also verify that a marker on the other hand remains attached after removing the selected one.

## Verify native references across a reload

> [!NOTE]
> These reference-check commands are included in [framework commit dd5d0e3](https://github.com/0n3m0r3/rimweave/commit/dd5d0e36a4ebaec7b34e61f6474d006c4149f2d2). The recorded in-game run called the guarded command entry point programmatically; the menu interactions below have not been checked. See [Support and evidence](../compatibility/index.md#in-game-reference-scenario).

This scenario uses two consumers, A and B, following the same character and the same exact health effect. A second, similar effect must remain untouched. The example adds two whole-body markers with the same definition and contribution identity: their distinct native identities are what tell them apart. This is separate from the hand-marker example above.

Use a disposable colony with the Debug example installed. Search for **Reference scenario** in the debug actions menu. Each report appears in a message window and the native log.

> [!NOTE]
> Earlier reference-scenario reports consumed simulation randomness through their native notification and dialog sounds. The documented revision includes the correction published in [framework commit bbed0b6](https://github.com/0n3m0r3/rimweave/commit/bbed0b63b9d93722bca5c7227972e38b629f6b63): notification, opening, rendering and closing preserve the random state, including presentation failures. This protection covers presentation only; the scenario's requested mutations retain their native random behavior. See [the correction evidence](../compatibility/index.md#published-corrections).

1. Select **T: Reference scenario: start**, click a living pawn directly on the current map, and confirm **Start reference scenario on …**. Expect `START PASS` with two markers. Opening the selection menu does not start the scenario; developer mode, the selected game and the pawn are checked again when you confirm.
2. Run **Reference scenario: departure and return**, then **Reference scenario: acknowledge A**. The first command briefly removes the pawn from the map and puts it back on the same cell through native operations. Expect `DEPARTURE/RETURN PASS` and `ACKNOWLEDGE A PASS`: A has no pending changes, while B still holds `LeftContext` and `EnteredContext` for both its pawn and effect references. These are change kinds, without ordering or counts.
3. Save through RimWorld's normal save menu, reload that save, and run **Reference scenario: inspect** before another scenario action. Expect `LOAD PASS`: saved native identities and pending observations survived, active tracking gained `TrackingInterrupted`, and all four observers remain stopped. `noReplay` checks that marker and scenario-command counts did not increase; loading does not recreate the markers or run a scenario command.
4. Run **Reference scenario: resume**. Expect `RESUME PASS`: all four observers are active again and their pending observations remain available. Resuming observation does not apply another effect.
5. Run **Reference scenario: remove exact effect**. Expect `EXACT REMOVAL PASS`: the first removal returns `Removed`, a repeated request returns `NotPresent`, both effect observers stop, and the similar effect remains attached. Their target is never replaced by that similar effect.

After removal, save and reload once more, then inspect before another scenario action. Expect one surviving marker, the removed target reported as `Unresolved` with its original diagnostic identity, and no automatic restart. Attempting **Reference scenario: resume** must fail instead of selecting the similar effect. Native save/load warnings about this removed target are expected: no owner saves the detached effect in this scenario. The reference retains its identity without owning or recreating it. An unresolved reference is not a claim that every missing target has permanently disappeared.

**Reference scenario: inspect** reports the exact native identities, current resolution, direct map presence, health attachment, tracking coverage and pending changes. Inspection does not acknowledge either consumer's observations. A failure reports actual values; inspect native state before continuing because a failed native operation may have partially completed.

A save holds one scenario. Starting again is refused; there is no automatic reset or cleanup, and the surviving marker remains in that disposable save. Use a fresh disposable colony for another run. Direct departure and return do not validate caravan travel, carried pawns, arbitrary third-party callbacks or compatibility between independent mods. Recorded results belong in [Support and evidence](../compatibility/index.md).

## When an action is absent

Check that the installed files came from the last **Debug** build, that the separate example is enabled, and that the game has been restarted after replacing assemblies. Search for the action name while playing on a map. A successful IDE build is not proof that the running game loaded the new files.

See [Support and evidence](../compatibility/index.md) for what the recorded prototype checks establish.
