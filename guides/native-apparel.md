---
title: Read native apparel coverage
description: Separate worn items, body-group coverage, visibility and protection.
---

# Read native apparel coverage

A medical display wants to show the garments over a selected hand. There may be
several layers, and another mod may change their appearance. Start with the native
worn-item list and coverage groups; a texture or the first matching garment is not
a complete description of equipment over that part.

## Read all worn garments over a selected part

For a fully initialized pawn with an apparel tracker and a part selected from its
native body, read on the simulation thread:

[!code-csharp[Read worn coverage](../examples/Recipes/Equipment.cs#worn-coverage)]

`WornApparel` is the native worn-item collection. `CoversBodyPart` checks the part's
native `BodyPartGroupDef` memberships against the apparel definition's groups.
Different occurrences can share a group: this is the game's coverage contract,
not a guarantee that a garment distinguishes left and right. Use a provider's
explicit correspondence when you need a finer mapping; do not invent one from
labels or file names. Resolve anatomical presence separately.

The recipe retains every match, including overlapping garments. It returns a
read-only membership snapshot whose item objects remain mutable and native-owned.
Read again before a later decision. It neither reserves a garment nor changes
wearing, groups or anatomy.

## Distinguish inventory from wearing

`Apparel.Wearer` reads the pawn from a native apparel holder. An item in an inventory
or with no holder has no wearer through this getter. That distinction is separate
from the coverage declared by its definition: a garment on the ground can still
have coverage groups, but it is not currently covering a pawn as worn apparel.
Use the chosen pawn's apparel tracker when querying that pawn, not every apparel
object reachable from its inventory or map.

## Treat a definition filter as one input

A wardrobe tool may check whether a definition's native gender and developmental
stage filter accepts a candidate:

[!code-csharp[Read the native definition filter](../examples/Recipes/Equipment.cs#apparel-definition-filter)]

This explicitly uses the `PawnCanWear(Gender, DevelopmentalStage)` overload. In the
inspected version it checks those two definition fields. `Gender.None` on either
side bypasses the gender restriction; that is this native filter's behavior, not a
claim about anatomy, gender identity or an extension's policy. A declared stage
mask can include several stages. Read the pawn after native initialization, since
its developmental stage comes from native life-stage state.

Passing this filter does not prove that the garment fits the current outfit or can
be equipped now. `CanWearWithoutDroppingAnything` separately checks conflicts with
currently worn apparel; an empty outfit can pass that check while the definition
filter fails. Neither result establishes reachability, availability, bodily function,
willingness or permission to perform a job. The extension owns how it combines the
necessary native facts and its own rules.

Do not substitute a similarly named helper without checking its contract. For
example, `CorrectAgeForWearing` also checks whether Biotech is active in the inspected
assembly. These overloads are not interchangeable promises across DLC settings or
third-party patches.

## Keep rendering and protection with their owners

Coverage does not establish current visibility, armor effectiveness, medical
protection, social meaning or permission to access a body. Changing a graphic path
does not change native group coverage. A renderer can hide an item without
transferring ownership of its equipment state to RimWeave. Consult the relevant
native calculation or a provider's declared contract for each additional question;
unknown information remains unknown.

## Verified boundary

The installed 1.7.5011 rev24 getters were inspected and exercised with three test
host cases: native group identity and repeated occurrences, graphic-path
independence with passive reads, and holder-based wearer resolution. The recipe
is compiled with the documentation examples. These initial fixtures do not execute native
wear/remove callbacks, render garments or simulate damage. RimWeave adds no
equipment state or behavior.

Seven additional cases verify the explicit gender/stage overload, its native
`Gender.None` behavior, a multiple-stage mask and the distinction from an empty
outfit's conflict check. They do not exercise equipment jobs or certify all DLC
combinations.

The [retrospective integration audit](../compatibility/index.md#retrospective-integration-audit)
subsequently executed the recipes after actual native wear, removal and inventory
operations on initialized colony pawns. Two worn torso layers were retained,
inventory garments were excluded, and an earlier membership snapshot retained its
item reference after that item's wearer changed. A fresh process restored the
remaining layer and inventory holders. Native definition filters were also checked
against an initialized adult pawn after explicit fixture changes and restoration.
Equipment jobs, rendered appearance, armor and arbitrary providers remain unverified.
