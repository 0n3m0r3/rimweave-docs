#!/usr/bin/env python3
"""Check snapshot integrity, local HTML links, and publication boundaries."""

import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit
from snapshot import example_files, fingerprints

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, content):
        super().__init__()
        self.ids = set()
        self.links = []
        self.feed(content)

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if attributes.get("id"):
            self.ids.add(attributes["id"])
        if tag == "a" and attributes.get("name"):
            self.ids.add(attributes["name"])
        for key in ("href", "src"):
            if attributes.get(key):
                self.links.append(attributes[key])


def check(publish_ready=False):
    snapshot = json.loads((ROOT / "api/snapshot.json").read_text())
    assert re.fullmatch(r"[0-9a-f]{40}", snapshot["framework_commit"]), "Invalid framework revision"
    expected = snapshot["files"]
    actual = {p.relative_to(ROOT).as_posix() for p in (ROOT / "api").glob("*.yml")}
    assert actual == set(expected), "Generated API file list differs from its manifest"
    for name, digest in expected.items():
        assert hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == digest, f"Modified API snapshot: {name}"
    tool = json.loads((ROOT / ".config/dotnet-tools.json").read_text())["tools"]["docfx"]["version"]
    assert snapshot["docfx_version"] == tool, "Snapshot and pinned DocFX versions differ"
    assert fingerprints(ROOT, example_files(ROOT)) == snapshot["examples"]["files"], "Re-export after changing an example"
    assert snapshot["framework_commit"] in (ROOT / "includes/version.md").read_text(), "Version text is stale"
    if publish_ready:
        assert not snapshot["working_tree"], "Commit the framework changes and re-export the API before publishing"

    site = ROOT / "_site"
    built_snapshot = json.loads((site / "api/snapshot.json").read_text())
    assert built_snapshot == snapshot, "Rebuild the site after changing the API snapshot"
    pages = {p.resolve(): Page(p.read_text()) for p in site.rglob("*.html")}
    assert (site / "index.html").resolve() in pages, "Home page missing"
    assert (site / "index.json").is_file(), "Search index missing"
    errors = []
    checked = 0
    for path, page in pages.items():
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc or link in ("#", ""):
                continue
            target = ((site / unquote(url.path).lstrip("/")) if url.path.startswith("/")
                      else path.parent / unquote(url.path)) if url.path else path
            target = target.resolve()
            if not target.is_relative_to(site.resolve()):
                errors.append(f"{path.name}: link escapes site: {link}")
                continue
            if target.is_dir():
                target /= "index.html"
            checked += 1
            if not target.is_file():
                errors.append(f"{path.relative_to(site.resolve())}: missing target {link}")
            elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
                errors.append(f"{path.name}: missing anchor {link}")

    forbidden = re.compile(
        r"https?://(?:orbit|internal)\.[^\s\"<>]+|\b[A-Z]{2,12}-\d+\b|"
        r"/home/[^/\s]+/|/mnt/[a-z]/Users/|[A-Za-z]:\\+Users\\+")
    for path in site.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() in (".dll", ".exe", ".pdb"):
            errors.append(f"Binary in static site: {path.name}")
        if path.suffix.lower() in (".html", ".json", ".yml", ".xml", ".md"):
            if forbidden.search(path.read_text(errors="replace")):
                errors.append(f"Private reference in static output: {path.name}")
    assert not errors, "\n".join(errors[:40])
    print(f"Checked {len(pages)} HTML pages and {checked} local links; API/example snapshots and publication boundaries passed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--publish-ready", action="store_true")
    check(parser.parse_args().publish_ready)
