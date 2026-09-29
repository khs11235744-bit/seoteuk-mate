#!/usr/bin/env python3
"""Seoteuk Mate local-only server.

- Binds only to 127.0.0.1.
- Serves this repository.
- Proxies /ollama/* only to local Ollama 127.0.0.1:11434.
- Proxies /flow/* only to local KHS Flow 127.0.0.1:13731.
- Never proxies to arbitrary or remote hosts.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
OLLAMA = "http://127.0.0.1:11434"
FLOW = "http://127.0.0.1:13731"


def local_get_json(url: str, timeout: float = 1.2):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return True, json.loads(r.read().decode("utf-8", "replace"))
    except Exception as exc:
        return False, {"error": str(exc)}


class Handler(SimpleHTTPRequestHandler):
    server_version = "SeoteukLocal/3.9"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        sys.stdout.write("[seoteuk-local] " + (fmt % args) + "\n")

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        if self.path.startswith(("/ollama/", "/flow/", "/health")) or self.path.split("?",1)[0].endswith((".html",".js",".css")):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, status: int, obj):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _proxy(self, upstream: str, strip_prefix: str):
        parsed = urlsplit(self.path)
        suffix = parsed.path[len(strip_prefix):]
        if not suffix.startswith("/"):
            suffix = "/" + suffix
        target = upstream + suffix
        if parsed.query:
            target += "?" + parsed.query

        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None
        headers = {"Content-Type": self.headers.get("Content-Type", "application/json")}
        method = self.command

        try:
            req = urllib.request.Request(target, data=body, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=180) as res:
                data = res.read()
                self.send_response(res.status)
                self.send_header("Content-Type", res.headers.get("Content-Type", "application/json"))
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as exc:
            data = exc.read() or json.dumps({"error": str(exc)}).encode()
            self.send_response(exc.code)
            self.send_header("Content-Type", exc.headers.get("Content-Type", "application/json"))
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as exc:
            self._json(502, {"error": str(exc), "upstream": upstream})

    def do_GET(self):
        if self.path == "/health":
            ollama_ok, ollama = local_get_json(OLLAMA + "/api/tags")
            flow_ok, flow = local_get_json(FLOW + "/api/status", 5.0)
            self._json(200, {
                "ok": True,
                "version": "3.9.0",
                "mode": "local-only",
                "root": str(ROOT),
                "ollama": {
                    "ok": ollama_ok,
                    "models": [x.get("name") for x in ollama.get("models", [])] if ollama_ok else [],
                },
                "flow": {
                    "ok": flow_ok,
                    "version": flow.get("version") if flow_ok else None,
                },
            })
            return
        if self.path.startswith("/ollama/"):
            return self._proxy(OLLAMA, "/ollama")
        if self.path.startswith("/flow/"):
            return self._proxy(FLOW, "/flow")
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/ollama/"):
            return self._proxy(OLLAMA, "/ollama")
        if self.path.startswith("/flow/"):
            return self._proxy(FLOW, "/flow")
        self._json(404, {"error": "local endpoint not found"})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8767)
    args = parser.parse_args()
    httpd = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"Seoteuk Mate Local-only: http://127.0.0.1:{args.port}/local.html")
    print("Bound to loopback only. Student data is not proxied to remote hosts.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
