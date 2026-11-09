#!/usr/bin/env python3
"""Export reviewable API metadata from a local framework checkout with game references."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

import yaml
from snapshot import example_files, fingerprints, framework_state

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY = "https://github.com/0n3m0r3/rimweave"


def output(*args, cwd):
    return subprocess.check_output(args, cwd=cwd, text=True).strip()


def normalize(value, revision, dirty):
    if isinstance(value, list):
        return [normalize(item, revision, dirty) for item in value]
    if not isinstance(value, dict):
        return value
    result = {}
    for key, item in value.items():
        if key.endswith(".vb"):
            continue
        if key == "langs":
            result[key] = ["csharp"]
        elif key == "source":
            # Local changes shift source lines. Do not publish misleading GitHub links.
            if not dirty and item.get("remote"):
                remote = dict(item["remote"], branch=revision)
                result[key] = dict(item, remote=remote, path=remote["path"])
        elif key == "inheritedMembers":
            # Document our contract, not an inventory of inherited game internals.
            result[key] = [member for member in item if member.startswith("RimWeave.")]
        else:
            result[key] = normalize(item, revision, dirty)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("framework", type=Path, help="Path to the framework repository")
    parser.add_argument("--allow-worktree", action="store_true", help="Allow an explicitly unpublished preview")
    args = parser.parse_args()
    framework = args.framework.resolve()
    project = framework / "RimWeave/RimWeave.csproj"
    if not project.is_file():
        parser.error("The framework project was not found.")
    state = framework_state(framework)
    revision = state["framework_commit"]
    dirty = state["working_tree"]
    if dirty and not args.allow_worktree:
        parser.error("The framework checkout has changes. Commit them or use --allow-worktree for a preview.")

    subprocess.run(["dotnet", "build", str(project), "--configuration", "Release", "--nologo",
                    "--verbosity", "minimal", "-warnaserror"], cwd=framework, check=True)
    example_hashes = fingerprints(ROOT, example_files(ROOT))
    example_run = subprocess.run(["dotnet", "run", "--project", "examples/DocumentationExamples.csproj",
                                  "--configuration", "Release", f"-p:FrameworkDir={framework}"],
                                 cwd=ROOT, check=True, text=True, capture_output=True)
    match = re.search(r"Documentation examples passed: (\d+) checks\.", example_run.stdout)
    if not match:
        raise ValueError("The executable examples did not report their verification result.")
    print(example_run.stdout.strip(), flush=True)
    local = ROOT / ".local"
    local.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="api-export-", dir=local) as directory:
        temporary = Path(directory)
        generated = temporary / "api"
        config = {"metadata": [{
            "src": [{"src": str(framework), "files": ["RimWeave/RimWeave.csproj"]}],
            "dest": str(generated), "filter": str(ROOT / "tools/api-filter.yml"),
            "properties": {"Configuration": "Release"}
        }]}
        config_path = temporary / "docfx.json"
        config_path.write_text(json.dumps(config, indent=2) + "\n")
        subprocess.run(["dotnet", "tool", "run", "docfx", "--", "metadata", str(config_path),
                        "--warningsAsErrors"], cwd=ROOT, check=True)
        destination = ROOT / "api"
        destination.mkdir(exist_ok=True)
        files = {}
        rendered = {}
        count = 0
        for path in sorted(generated.glob("*.yml")):
            data = normalize(yaml.safe_load(path.read_text()), revision, dirty)
            if path.name == "toc.yml":
                data["items"].insert(0, {"name": "API overview", "href": "index.md"})
            else:
                count += sum(1 for item in data.get("items", []) if item.get("uid"))
            header = path.read_text().splitlines()[0] + "\n"
            content = header + yaml.safe_dump(data, sort_keys=False, allow_unicode=True, width=110)
            if str(framework) in content or str(ROOT) in content:
                raise ValueError("A generated API file still contains a machine-specific path.")
            target = destination / path.name
            rendered[target] = content
            files[target.relative_to(ROOT).as_posix()] = hashlib.sha256(content.encode()).hexdigest()
        if framework_state(framework) != state or fingerprints(ROOT, example_files(ROOT)) != example_hashes:
            raise ValueError("Source files changed during export; rerun against a consistent checkout.")
        previous = destination / "snapshot.json"
        if previous.is_file():
            # Remove only stale files owned by the previous generated snapshot.
            for name in json.loads(previous.read_text())["files"]:
                path = ROOT / name
                if path.parent == destination and path.suffix == ".yml" and path not in rendered:
                    path.unlink(missing_ok=True)
        for target, content in rendered.items():
            target.write_text(content)

    tool_version = output("dotnet", "tool", "run", "docfx", "--", "--version", cwd=ROOT).split("+")[0]
    manifest = {
        "schema_version": 1, "channel": "preview", "framework_repository": REPOSITORY,
        **state,
        "target_framework": "net10.0", "rimworld_line": "1.7", "docfx_version": tool_version,
        "api_items": count, "files": files,
        "examples": {"checks_passed": int(match.group(1)), "native_recipes": "compiled_only", "files": example_hashes}
    }
    (ROOT / "api/snapshot.json").write_text(json.dumps(manifest, indent=2) + "\n")
    includes = ROOT / "includes"
    includes.mkdir(exist_ok=True)
    state = "Uncommitted documentation preview" if dirty else "Committed preview"
    (includes / "version.md").write_text(
        f"**{state}.** Framework baseline: [{revision[:7]}]({REPOSITORY}/commit/{revision}). "
        "Target: RimWorld 1.7 / .NET 10. The API is experimental.\n"
        + ("\nSource links are omitted until the framework documentation changes are committed.\n" if dirty else "")
    )
    print(f"Exported {count} API items; working-tree preview={dirty}; baseline={revision[:7]}.")


if __name__ == "__main__":
    main()
