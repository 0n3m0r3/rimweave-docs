---
title: Declare health contributions in XML
description: Give new health effects their contribution identity from a native definition, while preserving saved attribution.
---

# Declare health contributions in XML

A glove mod adds a temporary effect to one hand. Its effect always belongs to the same mod and uses the same contribution name. Declaring those values beside the native health definition keeps them available to creation and lookup without repeating them in C#.

RimWorld already reads `HediffDef` XML, creates effects through `HediffMaker` and saves existing effects through Scribe. A **definition extension** adds optional fields to that native definition. RimWeave uses those fields to initialize new `ContributionHediff` instances. Your mod still decides when to apply an effect, its target, its cause and its lifetime.

## Declare the identity once

This complete definition describes a technical marker. It introduces no glove behavior or automatic application:

```xml
<Defs>
  <HediffDef>
    <defName>Example_GloveContribution</defName>
    <label>glove contribution</label>
    <description>A contribution explicitly applied by the glove mod.</description>
    <hediffClass>RimWeave.Health.ContributionHediff</hediffClass>
    <isBad>false</isBad>
    <modExtensions>
      <li Class="RimWeave.Health.ContributionDefExtension">
        <ownerId>example.gloves</ownerId>
        <localId>hand-effect</localId>
        <exclusiveResponsibility>example.gloves/hand-effect</exclusiveResponsibility>
      </li>
    </modExtensions>
  </HediffDef>
</Defs>
```

`ownerId` and `localId` are required. They use the [shared identity rules](../concepts/contributions.md#use-the-mods-name-and-a-local-name-together): the owner namespace is normalized to lowercase and the local name is case-sensitive. Omit `exclusiveResponsibility` when no exclusive claim is needed; an empty value is invalid. A claim reports competing declarations in the queried scope; it does not prevent another effect from being added.

Use at most one <xref:RimWeave.Health.ContributionDefExtension> per definition, with `ContributionHediff` or a subclass. Invalid fields, multiple declarations and an incompatible effect class produce native configuration diagnostics naming the definition and its supplying mod. Direct reads and creation also reject invalid declarations. Separate definitions may share an identity: ambiguity is determined among actual instances on the requested target, not in a global definition registry.

## Create an effect explicitly

[!code-csharp[Create from XML attribution](../examples/Recipes/Health.cs#xml-attach)]

`HediffMaker.MakeHediff` invokes `ContributionHediff.PostMake`, which assigns the XML identity and optional claim before native creation component callbacks. Each instance owns independent metadata. The factory creates the object; `ContributionOperations.Add` requests attachment and returns the [observed addition result](health-effects.md#observe-the-addition). Admission, repetition and stacking policies remain your mod's responsibility.

Origin and source are contextual C# data; they are not XML fields in this adapter. Normal mod API calls do not require developer mode. Call native operations on the simulation thread.

Use the native factory rather than `new ContributionHediff()`, which does not run the initialization hook. A subclass overriding `PostMake` must call `base.PostMake()`. Without an XML declaration, the [existing C# initialization recipe](health-effects.md#create-describe-then-attach) remains available. With XML, a later `AssignIdentity` must agree with the already assigned identity; changing it is rejected by the shared metadata contract.

## Read the declaration without applying it

[!code-csharp[Find the current declared identity](../examples/Recipes/Health.cs#xml-query)]

`Read` returns a fresh metadata snapshot, or `null` when no declaration exists. Invalid declarations throw `InvalidOperationException` with definition and mod context. Editing the returned snapshot changes neither the definition nor another effect. Reading it creates no effect, attaches nothing and consumes no simulation randomness. The lookup still needs the pawn and exact body-part occurrence; inspect its status before acting.

## Keep saved attribution authoritative

Changing XML affects newly created instances. Scribe loading does not run `PostMake`: an existing effect keeps its saved identity, claim and origin. Missing or unreadable saved metadata remains missing or unreadable, with the [existing persistence diagnostics](persistence.md#an-unreadable-description-is-a-different-problem); XML is not a repair fallback. Subclasses must preserve `base.ExposeData()` in every save/load phase.

If an update changes `ownerId` or `localId`, the recipe above looks for the **new** identity. It does not find or remove effects saved under the old identity. Those effects can coexist with new ones. Inspect the saved contribution and use its exact identity and target for deliberate cleanup; changing XML is not a migration policy.

### Change defaults without rewriting existing effects

Suppose a provider renames its local contribution from `hand-effect` to `revised-effect` and changes its exclusive claim. A colony already contains the old effect. The next load keeps that instance's saved attribution; an explicitly created effect receives the new values. Both can share the same `HediffDef` and exact body part without becoming the same contribution.

| Current definition | Previously saved instances | Newly created instances |
| --- | --- | --- |
| Original declaration | Keep their saved attribution. | Receive the original identity and optional claim. |
| Changed identity or claim | Still keep their saved attribution. | Receive the changed defaults. |
| Declaration removed, definition/class retained | Still keep their saved attribution. | Start without an identity or claim; contextual origin also remains unset until supplied in code. |

Resolve claims and identities from the actual instance metadata. Reading today's declaration only describes today's creation defaults. A helper that derives its lookup identity from that declaration will not find an old-generation effect under a renamed identity. It must not treat “not present” as permission to remove a different matching definition.

### Remove a declaration without removing the native definition

Removing only `ContributionDefExtension` does not remove the `HediffDef`, its class or existing effects. `ContributionDefExtension.Read` now returns `null`. That is normal absence of a declaration, distinct from unreadable saved metadata. A fresh effect can be explicitly attributed through the ordinary C# recipe; XML no longer supplies defaults.

An example convenience method that requires a declaration may refuse to operate after its removal. The underlying health API can still query and deliberately remove an old effect using its saved identity and exact target. The provider must choose how to maintain old identities, migrate data or clean up obsolete effects. Changing or deleting defaults supplies none of those policies automatically.

The [definition-evolution verification](../compatibility/index.md#changed-declaration-defaults) exercises the original, changed and absent declaration in three separate native processes. It keeps the definition name and class available throughout; removing either is a different compatibility problem. The [original XML verification](../compatibility/index.md#xml-contribution-declarations) covers initial declaration parsing and creation. No general migration, uninstall or third-party compatibility guarantee follows.
