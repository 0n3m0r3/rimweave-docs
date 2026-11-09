---
title: C# API reference
description: Find the class or method for the operation you want to perform.
---

# C# API reference

These pages list the public C# types, their parameters, results and exceptions. If the names are unfamiliar, first read [What RimWeave does](../getting-started/index.md), which explains the problem before introducing the API.

## Describe and find an effect

| What you want to do | API |
| --- | --- |
| Let RimWeave read your object's description | <xref:RimWeave.Contributions.IContribution> |
| Store its identity, cause and optional exclusive responsibility | <xref:RimWeave.Contributions.ContributionMetadata> |
| Identify the declaring mod and its effect | <xref:RimWeave.Contributions.ContributionId> |
| Name a kind of cause, such as an impact | <xref:RimWeave.Contributions.ContributionOriginType> |
| Record that cause and an optional reference to its source | <xref:RimWeave.Contributions.ContributionOrigin> |
| Find matches in a collection you supply | <xref:RimWeave.Contributions.ContributionResolver> |
| Interpret no match, one match, several matches or unreadable metadata | <xref:RimWeave.Contributions.ContributionLookupStatus> |

The [first C# example](../getting-started/first-contribution.md) shows these declarations in context.

## Work with the game's health effects

| What you want to do | API |
| --- | --- |
| Use a health effect that carries and saves RimWeave information | <xref:RimWeave.Health.ContributionHediff> |
| Find effects on one pawn and one particular body part | <xref:RimWeave.Health.ContributionQueries> |
| Remove a specific effect object after checking its owner and presence | <xref:RimWeave.Health.HediffOperations> |
| Read what the removal actually observed | <xref:RimWeave.Health.HediffRemovalResult> |
| Find an effect by identity and request removal if the match is unique | <xref:RimWeave.Health.ContributionOperations> |
| Read both the lookup and the optional removal result | <xref:RimWeave.Health.ContributionRemovalResult> |

See [health effects](../guides/health-effects.md) and [removal](../guides/removal.md) for the sequence of calls and the decisions your mod must make.

## Follow an exact native target

| What you want to do | API |
| --- | --- |
| Retain an exact pawn or health-effect reference and explicitly observe supported transitions | <xref:RimWeave.References.NativeReference> |
| Read resolution, direct map presence, native lifecycle state and effect attachment separately | <xref:RimWeave.References.NativeReferenceSnapshot> |
| Check which native notifications an active reference can receive | <xref:RimWeave.References.ReferenceTrackingCoverage> |

The [health-effect guide](../guides/health-effects.md#keep-a-reference-when-the-character-moves) explains the departure-and-return scenario and the limits of this first integration. A resolved reference is not permission to act on its target.

## Save information and write diagnostics

<xref:RimWeave.Persistence.ContributionMetadataScribe> saves metadata inside an object's own native save/load process. It is already used by `ContributionHediff`; other owners must connect it explicitly. Read [Keep information through a save](../guides/persistence.md).

<xref:RimWeave.Logging.RimWeaveLog> writes to RimWorld's log with the framework prefix. The [debugging guide](../guides/debugging.md) explains how to find the log and use the example commands.

Game types such as `Pawn` and `Hediff` in signatures belong to RimWorld. This reference documents what RimWeave adds, rather than duplicating the game's entire API.
