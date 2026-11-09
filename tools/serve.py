#!/usr/bin/env python3
"""Preview the site under the same subdirectory shape as GitHub Pages."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "/rimweave-docs/"


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/", PREFIX.rstrip("/")):
            self.send_response(302)
            self.send_header("Location", PREFIX)
            self.end_headers()
            return
        if not self.path.startswith(PREFIX):
            self.send_error(404)
            return
        self.path = "/" + self.path[len(PREFIX):]
        super().do_GET()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8087)
    args = parser.parse_args()
    assert (ROOT / "_site/index.html").is_file(), "Build the site before previewing it."
    handler = partial(Handler, directory=str(ROOT / "_site"))
    print(f"Preview: http://localhost:{args.port}{PREFIX}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", args.port), handler).serve_forever()
