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

The [two-consumer example](composition.md) keeps A's initialization in C# and declares B's identity and claim in XML. See [the recorded XML verification](../compatibility/index.md#xml-contribution-declarations) for actual creation, reload and changed-definition checks. No general migration, uninstall or third-party compatibility guarantee follows.
