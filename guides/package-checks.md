---
title: Check mod folders before installing
description: Catch incomplete folders and foreign files before copying the framework and its examples into RimWorld.
---

# Check mod folders before installing

You build RimWeave and prepare to copy it into the game's Mods directory. A missing
assembly makes the mod unusable; a game DLL accidentally copied alongside it can
redistribute files that do not belong to the framework. RimWorld reads each mod's
manifest and assemblies, so inspect the actual folders you intend to copy.

## Run the structural check

From the framework repository, after building the solution:

```bash
python3 tools/check_packages.py
```

The command reads the framework folder and both optional example folders. It
prints their package IDs and exits successfully only when all three pass. Supply
another repository root as its optional argument to inspect a separate checkout
with the same layout. It does not build, install, execute assemblies or change
files. Python 3 uses only its standard library.

The check requires the expected manifest, framework or example assembly, and
example XML definitions. Optional assembly documentation and symbols are allowed.
Unexpected files, empty files, symbolic links and unreadable XML are rejected.
The three package identities, the 1.7 target and the examples' declared dependency
and load order after the framework must match the repository's existing contract.
Any DLL outside that explicit inventory is rejected, including game DLLs with
uppercase filenames or extensions.

On failure, diagnostics name the folder and file; the process returns exit code `1`.
Correct the cause and rerun the check before copying anything. Review unexpected
files before removing them. Adding an intended resource requires updating the
validator's explicit inventory alongside that resource.

## Record the exact file contents

After a successful build, request a portable inventory:

```bash
python3 tools/check_packages.py --json
```

On success, standard output contains only JSON with `formatVersion: 1`,
`validation: "structure-only"` and a sorted `packages` list. Each package has its
`packageId` and sorted `files`; each file records a package-relative `path`, byte
count and SHA256 digest. Optional documentation and symbols are included when
present. Identical bytes produce identical output in different directories; no
absolute path or timestamp is recorded. On validation failure, no success JSON is
printed, errors go to standard error and the exit code is nonzero.

Keep the inventory outside the mod folders when saving it for comparison. A digest
identifies bytes; it does not prove authorship, source revision, build configuration
or game compatibility. Stop builds and file copies while checking: the command
reads files sequentially and does not take an atomic filesystem snapshot. It never
loads an assembly or writes to the inspected folders.

## Verify a copied mod folder

Keep the JSON inventory from the build you intend to install, then compare one
explicit mod folder with it. Replace the sample paths with your saved inventory
and the copied framework folder:

```bash
python3 tools/verify_package.py inventory.json rimweave.framework /path/to/Mods/RimWeave
```

The folder name is arbitrary. Select `rimweave.example` or `rimweave.example.peer`
to check either optional example instead. Only the chosen folder is inspected;
checking the framework does not require installing the examples. The inventory
itself describes all three known packages in format version 1.

A matching folder exits with code `0`. Missing files, changed bytes, extra files,
invalid structure or symbolic links produce diagnostics and code `1`. Optional
symbols and documentation must match exactly when recorded; adding an unrecorded
optional file is also a difference. Nothing is copied, removed or repaired. Review
the differences before deciding what to replace.

Unknown inventory formats, duplicate fields or entries, invalid digests and paths
outside the fixed package inventory are rejected. A matching digest proves only
agreement with that saved inventory, which must come from a source you trust. It
does not prove the running game loaded those files. Keep builds and copies stopped
throughout the comparison; no atomic filesystem snapshot is promised.

## Keep example markers explicit

Each of the four example definition files must contain exactly its expected health
definition and effect class. An empty file with a valid `Defs` root, an extra
definition or an accidental rename is rejected. Conditional, inherited or abstract
XML declarations are outside these four explicit fixtures and are rejected too. For these technical markers,
`isBad`, `makesAlert`, `everCurableByItem`, `tendable` and `scenarioCanAdd` must each
appear once with `false`. Every required identity, class and flag value must also
be a scalar element with no attributes or nested elements. A field is rejected
when it contains additional structure even if its initial text matches the expected
value; the diagnostic identifies its file and field. The checker does not interpret
conditional attributes to guess an effective value.

This catches accidental changes that expose an example
through ordinary scenario selection or change its declared medical behavior.

These are checks of the repository's explicit source contract. They do not run
RimWorld's XML inheritance or patches, inspect class behavior, or certify neutrality
with arbitrary mods. Deliberately changing an example's contract requires reviewing
its validator and native integration evidence together.

## What passing means

Passing establishes the checked folder structure. It does **not** establish that
an assembly contains valid code, matches the source revision, uses Debug or Release,
or loads correctly in the game. The validator deliberately never loads DLLs.
The latest build still determines the assemblies in the shared output folders.

It also does not create an archive, choose a release version, certify a third-party
mod, or publish to Steam Workshop. Run the separate [integration checks](testing.md)
for runtime behavior and keep framework installation separate from activating
optional developer examples. Enabling an example must not execute its commands.

## Test the checker

The framework repository contains temporary-folder regression cases:

```bash
python3 -m unittest discover -s tools -p 'test_*.py' -v
```

They cover complete folders, missing and empty files, foreign assemblies, manifest
contracts, invalid XML, structured required fields, links and command exit codes. Their placeholder assembly
bytes are intentional: these tests prove structural checking, not game loading.

## What GitHub checks automatically

The framework's **Validate sources** workflow runs the Python regressions
on every push and pull request. It also supports manual execution. Tests read
the real versioned manifests and definitions and exercise their contract, including empty,
renamed, extra or incorrectly configured example markers. The fixtures supply inert placeholder assembly bytes, never
the game's assemblies. A corrupted source manifest makes this check fail.

This remote check is separate from running the validator against locally compiled
folders. GitHub also executes the independent C# contracts described below. It does not
compile the complete mod solution or run RimWorld. Before installation,
run the local command after your chosen build and perform the relevant game checks.
The workflow has read-only repository access and no deployment or release step.

## Test shared contracts in GitHub

The same workflow runs 108 existing C# tests for contribution identity, attribution,
origin, resolution and log formatting. A dedicated test project links the production
source files and the original test files. It has no RimWorld references, local game
path or substitute game types, and produces no installable framework assembly.

```bash
dotnet test RimWeave.Contracts.Tests/RimWeave.Contracts.Tests.csproj --configuration Release
```

Run this command from the framework repository with .NET 10. The SDK and test
packages match the existing project. A source-only temporary checkout passed the
suite without game assemblies or local properties; deliberately removing instance
deduplication from its resolver made the same command fail.

This checks the linked contracts independently of the game. Native health adapters,
Scribe persistence, developer UI, the complete framework build and colony behavior
still require their separate local tests. These 108 tests are a subset of the full
suite, not 108 additional independent checks.
