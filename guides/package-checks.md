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
contracts, invalid XML, links and command exit codes. Their placeholder assembly
bytes are intentional: these tests prove structural checking, not game loading.

## What GitHub checks automatically

The framework's **Validate package sources** workflow runs the Python regressions
on every push and pull request. It also supports manual execution. One test reads
the real versioned manifests and definitions into a temporary package fixture,
then checks their contract. It supplies inert placeholder assembly bytes, never
the game's assemblies. A corrupted source manifest makes this check fail.

This remote check is separate from running the validator against locally compiled
folders. GitHub does not compile the C# solution or run RimWorld. Before installation,
run the local command after your chosen build and perform the relevant game checks.
The workflow has read-only repository access and no deployment or release step.
