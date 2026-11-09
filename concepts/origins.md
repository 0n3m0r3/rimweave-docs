---
title: What caused this effect?
description: Describe a cause and an optional source without assuming that an unfamiliar mod is unknown.
---

# What caused this effect?

Suppose a medical mod creates two effects: a reaction to a weapon hit and a reaction to an infection. The same mod owns both effects. Knowing its name does not explain why either effect appeared.

RimWeave lets the mod add an **origin**: a description of the cause. This information helps another mod inspect or explain the effect. It does not make the effect happen.

## A kind of cause, and optionally a particular source

For the weapon reaction, the kind of cause could be “impact”. The source could identify the particular hit or weapon, if the medical mod has that information.

For the infection reaction, the kind of cause could be “infection”. Its source could identify the infection being tracked.

Those are separate pieces of information. You can know that a reaction came from an impact without knowing which weapon caused it. In C#, the kind is `ContributionOriginType`, and the optional source is `ContributionOrigin.SourceReference`.

## Any mod can name another kind of cause

There is no fixed list limited to equipment and surgery. A mod can declare “impact”, “infection” or a new cause relevant to its own features without changing RimWeave or registering a type first.

A type has two names: a namespace, identifying the vocabulary it belongs to, and a local name within that vocabulary. For example, `example.combat` and `impact` together identify one type. The namespace is lowercased; the local name is case-sensitive. Mods using the same pair need to agree on what it means.

RimWeave keeps a valid custom type exactly as declared, even if it does not know what that cause means. An unfamiliar type does **not** become `Unknown` or `Other`. `Unknown` is the only predefined cause in this version; the other names on this page are examples chosen by mod authors.

## A source reference is information supplied by a mod

A source reference is a string, such as an identifier for an item or an event. RimWeave stores it. The mod that defines its format is responsible for explaining how to use it.

RimWeave does not search the world for that string or check whether the item still exists. It can retain a reference to something supplied by another mod, including a mod that does not use RimWeave. Someone still has to provide reliable information about that source.

The string is preserved without changing its case or contents. Blank values and surrounding whitespace are rejected. Omit the reference when there is no precise source to record.

## No description, unknown cause and missing source

These situations should produce different explanations to a developer:

| Situation | What it means | API value |
| --- | --- | --- |
| No origin was declared | The mod did not provide a description. | `Metadata.Origin == null` |
| The cause was explicitly declared unknown | A description exists, but its cause is not known. | `Origin.Type == ContributionOriginType.Unknown` |
| A custom cause was declared | Use the supplied type, even if your mod does not understand it. | The declared `Origin.Type` |
| The source was omitted | The kind of cause may still be known. | `Origin.SourceReference == null` |

These meanings assume the metadata loaded successfully. If `Metadata.LoadError` is set, the saved description is unavailable; null fields do not prove that nothing was declared. See [saving and loading](../guides/persistence.md).

RimWeave does not automatically fill in `Unknown` when no origin was supplied. Once an origin is assigned, a different one cannot replace it, including an explicit `Unknown`. Leave it undeclared if you intend to describe it later when better information becomes available.

## Another mod's effect does not explain itself

Seeing a wound tells you that a health effect exists. It does not necessarily tell you which hit or operation caused it. A mod using RimWeave can supply the description; dedicated integration code can also translate information from another mod when that information is actually available.

Without either source of information, RimWeave cannot reconstruct the history. A custom cause being accepted and an effect being automatically discovered are two different things.

Finally, a cause does not decide when an effect expires or whether it can be undone. “Created by surgery” is information for a mod to interpret, not an instruction to reverse the surgery. The [C# example](../getting-started/first-contribution.md) shows how to declare this description.
