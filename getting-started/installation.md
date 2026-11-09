---
title: Install and build
description: Build the preview against a local RimWorld 1.7 installation and install the framework and example separately.
---

# Install and build

This preview is built from source. Use the [documented revision](../compatibility/versions.md) when reproducing an example; an arbitrary later checkout may expose different contracts.

## Prerequisites

- A locally installed copy of RimWorld 1.7.
- .NET SDK 10.0.114, the SDK used for this preview.
- Git and a C# editor. Rider can work directly in a WSL project.

For the game's 1.7 environment, consult Ludeon's [Modder Primer](https://docs.google.com/document/d/e/2PACX-1vSykw5_DYaaw42nEznI9zmBZVT_Vgg2bxYq_v2XWvAsHC3QSKFuDK2OyiQ5WC9jvVRUcrjpFt7xLLF5/pub). This framework targets `net10.0`; instructions for older RimWorld runtimes need separate verification.

## Configure the game references

Clone the [framework repository](https://github.com/0n3m0r3/rimweave). In the solution directory, copy the configuration template:

```bash
cp RimWeave.local.props.example RimWeave.local.props
```

The resulting `RimWeave.local.props` file contains:

```xml
<Project>
  <PropertyGroup>
    <RimWorldDir>/absolute/path/to/RimWorld</RimWorldDir>
  </PropertyGroup>
</Project>
```

Replace the placeholder with your game installation directory. It must contain `Assembly-CSharp.dll`, `UnityStubs.dll` and `Waylith.dll`. The project references these files locally with copying disabled. Do not add the game assemblies or your personal configuration to Git.

## Build and run automated checks

Run these commands from the framework solution directory:

```bash
dotnet build RimWeave.sln --configuration Debug
dotnet test RimWeave.sln --configuration Debug
dotnet build RimWeave.sln --configuration Release
dotnet test RimWeave.sln --configuration Release
```

Debug and Release currently share each mod's output directory. The last build determines which configuration you install. Build **Debug last** when you want the developer example commands.

## Install the mod directories

| Source directory | Installed mod | Package ID |
| --- | --- | --- |
| `mod/` | RimWeave Framework | `rimweave.framework` |
| `examples/RimWeave.Example/` | Optional developer example | `rimweave.example` |

Copy each complete directory into its own directory under RimWorld's `Mods` directory. Keep the framework and example separate. When using both, enable the framework before the example. The example declares its framework dependency in its own manifest.

The framework assembly is in `mod/Assemblies/`. This build may also produce its own symbols and XML API documentation there. Game DLLs must not be included in an installable mod.

## Verify the result

Loading the framework writes `[RimWeave] RimWeaveMod loaded!` through the game's native log. It does not create a separate operating-system console. Compilation alone does not prove that RimWorld loaded the correct assembly.

For the optional example, follow the exact steps in [Inspect and debug](../guides/debugging.md). Use a disposable colony for commands that mutate health state.
