---
title: Which mod added this effect?
description: Identify a mod's effect without confusing its owner, its target and the reason it exists.
---

# Which mod added this effect?

The reinforced glove from the [introduction](../getting-started/index.md) adds a temporary effect to a character's left hand. Surgery adds a second effect there. Both are health effects, but they belong to different mods and have different lifetimes.

To find the glove effect later, Field Gear needs a name that another mod will not accidentally use for its own effect.

## Use the mod's name and a local name together

RimWeave combines two values: the identifier of the mod declaring the effect and a name chosen within that mod. For example, Field Gear could use `example.fieldgear` with `glove-support`.

Medical Care may also use the local name `glove-support`. It remains a different identity because its mod identifier is different. The C# type representing this pair is <xref:RimWeave.Contributions.ContributionId>.

The mod identifier is normalized to lowercase. The local name is case-sensitive. Neither value is a translated label shown to the player, and neither proves that the calling code is authorized to act. They are names that cooperating mods agree to use.

## Also say where to look

An identity does not identify a character or a body part. Field Gear could use the same identity for glove effects on several characters, or on both hands of one character.

A health query therefore needs the character and the particular body part as well as the effect's identity. In the API, this selected set of effects is called the **scope**. Asking about the left hand does not search the right hand.

Two effects can even have the same identity in that same scope. RimWeave reports several matches; it does not silently take the first. This lets the caller decide whether it has duplicated an effect or needs a different naming rule.

## Keep the description with the effect

The effect exposes a <xref:RimWeave.Contributions.ContributionMetadata> object containing its identity and optional descriptions. Implementing <xref:RimWeave.Contributions.IContribution> lets the shared lookup code read that object.

For health effects, the metadata belongs to the effect already in the game's health list. RimWeave does not keep a second list that must be synchronized with it. Reading the metadata does not apply an effect or generate a new identity.

An identity can be declared again with the same value. Replacing it with a different identity is rejected: an existing effect should not silently become another mod's effect. If saved metadata could not be read, declarations are also refused until that problem is handled.

## Finding an effect is not changing it

A lookup reports the objects it found at that moment. It does not reserve them. The game or another mod can still remove an effect after the lookup.

That is why [removing an effect](../guides/removal.md) checks its presence again. It is also why “one match found” and “effect removed” are separate results.

The health integration now [saves this information with the effect](../guides/persistence.md). Other kinds of objects must explicitly connect their metadata to their own saving process. After loading, read metadata from the restored object instead of keeping a reference to the old metadata object.

Next: [describe what caused the effect](origins.md). Its cause is a separate question from which mod owns it.
