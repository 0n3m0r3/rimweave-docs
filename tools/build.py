#!/usr/bin/env python3
"""Build and validate the static documentation without game assemblies."""

from pathlib import Path
import shutil
import subprocess
from search import adapt_search

ROOT = Path(__file__).resolve().parents[1]

if __name__ == "__main__":
    site = ROOT / "_site"
    if site.exists():
        shutil.rmtree(site)
    subprocess.run(["dotnet", "tool", "run", "docfx", "--", "build", "docfx.json",
                    "--warningsAsErrors"], cwd=ROOT, check=True)
    adapt_search(ROOT)
    # DocFX's build manifest contains absolute machine paths and is not a runtime asset.
    manifest = site / "manifest.json"
    if manifest.exists():
        local = ROOT / ".local"
        local.mkdir(exist_ok=True)
        shutil.move(manifest, local / "docfx-build-manifest.json")
    subprocess.run(["python3", "tools/check.py"], cwd=ROOT, check=True)
