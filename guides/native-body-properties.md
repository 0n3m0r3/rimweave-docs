---
title: Read native body properties
description: Keep body size, health scaling and extension-defined dimensions separate.
---

# Read native body properties

A renderer wants to choose a visual size, while a medical mod reads the same character.
Using a health effect's severity as a universal body dimension would give those consumers
an agreement that its owner never declared. Start with the native value whose meaning
matches the question; keep any extension-specific measurement with its provider.

## Read size and health scaling separately

For a fully initialized pawn, RimWorld already exposes both values:

[!code-csharp[Read native body factors](../examples/Recipes/Health.cs#native-body-factors)]

`BodySize` multiplies the race's `baseBodySize` by the current life stage's
`bodySizeFactor`. `HealthScale` separately multiplies `baseHealthScale` by
`healthScaleFactor`. These are native game factors, not metres, current hit points,
a particular organ's dimensions or a guarantee of physical ability. Equal body sizes
can have different health scales. An extension owns any conversion to its own units.

A `Hediff.Severity` is a value interpreted by that effect's definition and code.
It does not automatically become a size, damage amount or shared measurement. A mod
that intentionally uses severity as a dimension must declare that meaning and scale
for its consumers; RimWeave does not change it or infer it from a name or texture.

## Observe an initialized character

Read on the simulation thread after native pawn initialization. Resolving an uncached
life stage can initialize native state and invoke lifecycle callbacks; reading a
partially constructed pawn is not a passive inspection contract. Do not force a life
stage recalculation merely to display these values.

The returned numbers are observations. Native definitions and life stages remain
authoritative and can change; read again before a later decision. Keeping two numbers
does not reserve a body, freeze a native object or establish fertility, willingness,
health, reachability or the ability to perform an activity.

## Verified boundary

The installed RimWorld 1.7.5011 rev24 getters were inspected and exercised in the test
host. Five regression cases cover independent race/life-stage factors, severity
independence, retained observations, unchanged native effect membership and random
state during repeated reads after fixture initialization. The recipe is compiled
with the documentation examples. No new colony run, third-party patch compatibility
or arbitrary initialization path is certified by these checks.
