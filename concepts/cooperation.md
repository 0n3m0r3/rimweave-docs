---
title: When do mods conflict?
description: Distinguish two effects that coexist from two mods that both claim to control the same decision.
---

# When do mods conflict?

Two mods affecting the same character do not automatically conflict. The glove effect and the surgical effect from the [introduction](../getting-started/index.md) may both be intended. Two mods that only observe a health change may also both need to receive it.

A different situation arises when two mods each claim that **only their code should control the same decision**. For example, two protection systems may both expect to be the sole controller for one character's hand protection. Their authors need a way to notice that disagreement instead of letting load order decide accidentally.

## The mods must declare what they claim

A mod can attach an exclusive responsibility name to a contribution. This says, in effect, “I claim to control this job.” Mods that coordinate on that job agree on the same name and on where it applies.

RimWeave can then inspect the contributions supplied to it and report who makes that claim. It does not infer a claim merely because an effect exists, has a similar name or came from the same kind of cause.

The lookup itself changes nothing. The calling mod decides whether to warn, disable its own feature, ask the player or follow a rule agreed with the other author. RimWeave supplies no automatic winner.

## Ask about one target at a time

Two mods controlling protection on different characters are not competing for the same target. The caller must therefore choose the contributions relevant to its question before asking who claims the job.

For health effects, RimWeave can select one character and one exact body part from the game's health list. Passing no body part means effects attached to the whole body; it does not mean every effect on every part.

For other data, the mod supplies the relevant collection itself. The shared lookup has no background view of every object in the game.

## Read the answer before making a decision

The same result type answers two kinds of question: “which effect has this identity?” and “who claims this responsibility?”

| Result | Meaning for the question you asked |
| --- | --- |
| `NotPresent` | No contribution matches. |
| `Found` | Exactly one contribution matches. |
| `Ambiguous` | Several contributions match. They are all returned; none is chosen. |
| `InvalidMetadata` | At least one contribution in the selected set has unreadable saved information. The answer cannot be considered complete. |

Unreadable metadata takes priority even if one readable match was found. The unreadable effect could be another claimant. Valid matches remain in `Matches`, while `InvalidCandidates` identifies the effects that could not be checked.

With an identity query, several matches might mean your mod added the same effect twice. With an exclusive responsibility query, they mean several contributions make the same claim. Neither result is a general diagnosis of whether their gameplay effects are compatible.

## What a conflict does not block

The query does not disable a mod or remove an effect. It does not prevent an unrelated feature on another character from running.

A mod can still [remove its uniquely identified effect](../guides/removal.md) even when it shares an exclusive claim with another effect. That may be the mod's chosen way to withdraw from the conflict. The removal must still pass its own checks.

The C# entry point is `ResolveExclusiveClaim` on <xref:RimWeave.Contributions.ContributionResolver>. Responsibility names are case-sensitive strings; their meaning is an agreement between the participating mods.

Mods that directly change the game without exposing these declarations remain outside this lookup. Installing RimWeave alone does not intercept their changes.
