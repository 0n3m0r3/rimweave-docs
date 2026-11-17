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
is compiled with the documentation examples. These fixtures do not execute native
wear/remove callbacks, render garments, simulate damage or certify third-party
patches or a newly loaded colony. RimWeave adds no equipment state or behavior.
