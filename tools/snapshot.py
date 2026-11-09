"""Shared file-selection and fingerprint rules for documentation provenance."""

import hashlib
from pathlib import Path
import subprocess


def fingerprints(root, paths):
    return {path.relative_to(root).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
            for path in sorted(paths)}


def example_files(root):
    folder = root / "examples"
    return [*folder.glob("*.cs"), *folder.glob("*.csproj"), *(folder / "Recipes").rglob("*.cs")]


def framework_state(root):
    def git(*args):
        return subprocess.check_output(["git", *args], cwd=root, text=True).strip()

    files = git("ls-files", "--cached", "--others", "--exclude-standard", "--", "RimWeave").splitlines()
    digest = hashlib.sha256()
    for name in sorted(files):
        path = Path(root) / name
        digest.update(name.encode() + b"\0" + (path.read_bytes() if path.exists() else b"<deleted>") + b"\0")
    return {"framework_commit": git("rev-parse", "HEAD"),
            "working_tree": bool(git("status", "--porcelain")),
            "framework_source_sha256": digest.hexdigest()}
