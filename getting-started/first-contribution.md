---
title: First C# example
description: Describe an effect in a small object, understand each declaration, then move to a game integration.
---

# First C# example

The [introduction](index.md) follows a glove effect that must remain separate from a surgical effect. Start by describing the glove effect: who added it and why it exists.

This first example creates an ordinary C# object. It does not create a character, add an item or change a health stat. That lets you see what the descriptive information does before [connecting it to a health effect](../guides/health-effects.md).

The complete example lives in `examples/Recipes/Contributions.cs` in the documentation project. The excerpts below come from that file, which is compiled and checked by the documentation tooling.

## 1. Give the object somewhere to keep its description

[!code-csharp[Contribution implementation](../examples/Recipes/Contributions.cs#contribution)]

`ProtectionContribution` is our example class. `IContribution` is the interface RimWeave reads: it requires a `Metadata` property. `ContributionMetadata` holds the identity and optional information about the effect.

The `= new()` initializer creates one metadata object for this instance. A normal read returns that object; it does not create new data or apply a game effect. `internal` keeps this teaching class inside the example assembly. Your integration does not need a public class merely to let the resolver inspect it.

## 2. Name the mod and describe the cause

[!code-csharp[Declare a contribution](../examples/Recipes/Contributions.cs#origin)]

The method creates and returns a described contribution:

- `AssignIdentity` names the declaring mod, `example.fieldgear`, and its effect, `glove-support`.
- `DescribeOrigin` says this effect came from equipment being worn. `example.equipment` and `equipped` are names chosen for this example, not categories built into RimWeave.
- `example.fieldgear:glove/42` illustrates a reference to a particular glove. RimWeave stores the string; Field Gear would be responsible for interpreting it.

After this method returns, you can read those values from the returned object's metadata. Nothing has been added to RimWorld. The identity and the cause also do not define the effect's strength or duration.

For a different cause, the example declares an impact type like this:

[!code-csharp[Custom cause](../examples/Recipes/Contributions.cs#custom-type)]

No registration is needed. Read [What caused this effect?](../concepts/origins.md) for absent descriptions, unknown causes and sources supplied by another mod.

## 3. Notice two mods claiming the same job

Now imagine that Field Gear and a charm mod both claim to be the sole controller of one target's protection. Merely adding two effects would not express that rule. Each mod must explicitly declare the same responsibility name.

[!code-csharp[Resolve an exclusive claim](../examples/Recipes/Contributions.cs#claims)]

The array represents the contributions relevant to **one target chosen by the caller**. `ResolveExclusiveClaim` searches that array for the named claim. It returns `Ambiguous` with two entries in `Matches`: both objects claimed the job. It neither picks a winner nor removes an object.

The glove and charm still have different identities. You can find one by identity even when both claim the same responsibility. This matters when a mod decides to withdraw its own effect to resolve the disagreement.

## Run the example

After [configuring the framework build](installation.md), run this command from the documentation repository. By default it expects the framework checkout beside it, in `rimweave`:

```bash
dotnet run --project examples/DocumentationExamples.csproj --configuration Release
```

For a checkout elsewhere, add `-p:FrameworkDir=/absolute/path/to/rimweave`. The command reports nine successful checks. The recipes that modify native health effects are compiled too, but this standalone program does not run them.

The small object in this page does not implement saving. Health effects have a supplied [save/load integration](../guides/persistence.md); other objects must deliberately connect to their own saving process.
