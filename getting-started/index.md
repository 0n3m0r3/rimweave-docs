---
title: What RimWeave does
description: Follow two effects on one character to understand why a mod would use RimWeave.
---

# What RimWeave does

RimWeave is a library for authors of RimWorld mods. A mod can use it to say which effects it added, explain what caused them, and find a particular effect when it needs to change or remove it. Other cooperating mods can read the same information.

It is installed as a mod because its code runs inside RimWorld. It does not add a gameplay system for the player to manage. A mod that calls RimWeave still supplies the actual behavior.

## Start with two effects on one character

Consider two fictional mods. **Field Gear** gives a character a grip bonus while they wear a reinforced glove. **Medical Care** adds a health effect after surgery on the same hand.

Both mods use the game's health system to represent their effects. The character now has two separate effects on their left hand:

| Effect | Mod responsible for it | When it should end |
| --- | --- | --- |
| Support from the glove | Field Gear | When that glove is removed |
| Result of the surgery | Medical Care | When Medical Care's rules say so |

The player takes off the glove. Field Gear needs to remove its own effect. It must leave the surgical effect alone, even though both concern the same hand.

## What RimWorld already handles

The game stores the character, their body parts and their health effects. It can add or remove a particular effect, update health calculations, and notify code that reacts to a removal. RimWeave uses those existing operations.

If a mod already has the correct effect object, it does not need a new identification system merely to distinguish that object. The shared information becomes useful when another part of the mod, or another mod, needs to find it without relying on display names or knowledge of private implementation details.

## What changes when the mods use RimWeave

Field Gear gives its effect an identity consisting of its mod identifier and a name such as `glove-support`. It can also record that the effect came from equipped clothing, and optionally identify the particular glove. Medical Care gives its own effect a different identity and describes its own cause.

When the glove comes off, Field Gear asks for its effect on this character's **left hand**. RimWeave examines the effects that use its health integration and reports whether it found none, one, or several matching effects. Unreadable saved information produces a separate error result rather than a guess.

If exactly one effect matches, Field Gear can request its removal. RimWeave checks that the effect still belongs to the character and is still present, then asks the game's health system to remove it. The check matters because another operation may already have removed it: the native removal method can otherwise call removal handlers again. A handler might release a restriction or notify another system, so repeating it can change behavior.

The surgical effect has a different identity and is left out of this removal request. Code supplied by either mod still controls any additional consequences of its own callbacks.

## The word “contribution” in the API

RimWeave calls something described this way a **contribution**. In this example, each contribution is one health effect. Its **metadata** is the information attached to it: which mod claims it, what caused it, and any other declared responsibility.

These names are broader than health because a mod can also use the shared identification rules for its own data. The current integration with RimWorld's health system is supplied; integrations with other game systems need their own work. Describing a contribution does not, by itself, apply an effect to the game.

## What your mod still decides

Field Gear decides when a glove gives a bonus and when it should expire. Medical Care decides what surgery does. The two mods decide whether their effects are compatible. RimWeave does not infer those rules from the effects' names or origins.

This cooperation must be deliberate. Installing RimWeave does not automatically label every effect from every installed mod or intercept all their changes.

To try the current framework, [build and install it](installation.md). Then follow the [first C# example](first-contribution.md), which introduces the API using one small object before connecting it to the game's health system.
