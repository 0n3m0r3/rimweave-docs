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

## When an action is absent

Check that the installed files came from the last **Debug** build, that the separate example is enabled, and that the game has been restarted after replacing assemblies. Search for the action name while playing on a map. A successful IDE build is not proof that the running game loaded the new files.

See [Support and evidence](../compatibility/index.md) for what the recorded prototype checks establish.
