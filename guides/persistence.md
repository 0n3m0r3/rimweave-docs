---
title: Keep information through a save
description: Understand what is saved with a health effect, how loading differs from applying it again, and how unreadable information is reported.
---

# Keep information through a save

Suppose the player saves while the character is wearing the glove. The health effect is still there after loading. Its mod also needs to know that it is the glove's effect, rather than seeing an effect with no recorded owner or cause.

RimWorld already saves the health effect itself. RimWeave adds its description to that effect's saved data. It does not save a second copy of the character, the hand or the health list.

## What comes back after loading

For a `ContributionHediff`, RimWeave saves the declared identity, exclusive responsibility, origin type and optional source reference. Custom origin types are retained without registration. An absent origin remains absent; an explicit `Unknown` remains explicit.

Loading restores that information. It does **not** equip the glove again, add another effect, remove an effect or repeat the original command. The game's health system restores the existing native effect; the mod still owns its gameplay rules.

The initial supported scope assumes the same game, framework and mod configuration, with the needed classes and definitions available. This is not a promise that arbitrary mod removal or version changes can be recovered.

## How a mod participates

`ContributionHediff` already connects to the game's save/load process through `ExposeData`. A subclass that overrides that method must call `base.ExposeData()` in every native phase.

For a different kind of object, implementing `IContribution` only exposes information for queries. It does not automatically save it. An owner can use <xref:RimWeave.Persistence.ContributionMetadataScribe> from its own `ExposeData` to save the metadata while retaining responsibility for saving the object itself.

The game loads data in phases. RimWeave replaces the metadata object during `LoadingVars`, rather than combining saved values with new defaults. Consumers should read it from the restored owner. Native components can use it in `PostLoadInit`, after the value-loading phase has finished. Keeping a reference to metadata from before loading would retain the old object.

## Save an exact reference separately

This reference contract is experimental; it is not a compatibility promise for future revisions.

Saving an effect's metadata and saving another object's reference to that effect are separate operations. A consumer can save its `NativeReference` from its own `ExposeData` through native deep serialization. The handle uses the game's reference resolution for the target pawn and exact effect; it does not save a second health list or look for a replacement with the same contribution identity.

For a handle in its owning game, `Capture()` reports `Loading` until native reference loading completes. After resolution, a missing target remains `Unresolved`, with its original native identity retained for diagnosis. That identity is not a fallback search key. An inconsistent identity or target kind reports `Mismatch`. Neither outcome authorizes using another effect or proves that the original target disappeared permanently. If an owner saves a handle retained from another game, RimWeave preserves its identity and pending changes but omits resolvable target links and marks the handle as belonging to a different game. Loading continues to report `DifferentGame`; coincidentally equal IDs in the new game cannot retarget it.

A reference loaded without an owning `Current.Game` remains unavailable. Creating a game afterward cannot make it resolve or attach to a target with a matching identity.

Pending change kinds survive the save. If tracking was active, loading also records `TrackingInterrupted`: a C# subscription is not a saved gameplay action. Tracking does not restart automatically, and loading invokes no activity reaction. After native game initialization, the owner reads the restored state and pending changes, decides its own continuation policy, and explicitly calls `StartTracking()` if observation should resume. Use `LoadedGame`, `StartedNewGame` or later; `PostLoadInit` is too early to activate tracking.

These guarantees assume the required native objects, definitions and provider classes can be loaded. They do not preserve every historical target, provide persistent organ identity or resolve an opaque `SourceReference`. The reference tests use native Scribe resolution with controlled pawn and health graphs; they do not demonstrate loading an entire colony or resuming every provider's activity.

## An old save may contain no description

If the effect was saved before it carried RimWeave metadata, there is nothing to restore. It remains without a declared identity or origin. RimWeave does not infer those values from its class or invent a history.

Completely empty metadata adds no extra save node. This keeps “nothing was declared” distinct from a description that failed to load.

## An unreadable description is a different problem

If a saved metadata record is malformed or uses an unsupported format, RimWeave leaves the native effect intact but makes its entire description unavailable. `Metadata.LoadError` explains why. The health integration logs the effect definition and native ID after loading.

Queries return `InvalidMetadata` when an unreadable record is present in the selected scope, even if another record matches the requested identity. The unreadable record could be another match. Removal by identity therefore stops without choosing an effect. Queries on another pawn or body part remain independent.

`ContributionQueries.Find`, which returns only a list, throws for this case. Use `Resolve` to inspect both valid matches and `InvalidCandidates`. A mod that deliberately chooses a known instance can still use exact-instance removal; that cleanup decision belongs to the caller.

Unreadable XML is kept as text in later saves without interpreting its fields. It is not silently replaced by empty values or automatically repaired. This preserves the record for a possible recovery policy; it does not make a missing third-party class loadable or repair a malformed save file.

## Details for inspecting the saved format

The current metadata format is version `1`, with strings encoded as `utf16le-base64`. This preserves the exact .NET string contents, including characters that XML cannot represent directly. A saved source reference remains a string: loading it does not look up its object or prove that the source still exists.

Automated tests exercise save/load round trips through RimWorld's Scribe APIs outside a running colony. Full-colony loading, third-party callbacks and resuming a mod's own activities require their own game checks. See [what has been verified](../compatibility/index.md).
