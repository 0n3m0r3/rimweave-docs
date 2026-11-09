# RimWeave Developer Documentation

The English documentation website for [RimWeave](https://github.com/0n3m0r3/rimweave), a library for RimWorld mod authors. It explains the framework through examples and provides integration guides and a generated C# API reference.

The site is built with DocFX and maintained separately from the framework. It is currently a local preview; no public site is available yet.

## Run locally

Install .NET SDK 10.0.114 and Python 3. From this directory:

```bash
dotnet tool restore
python3 tools/build.py
python3 tools/serve.py
```

Open <http://127.0.0.1:8087/rimweave-docs/> and keep the terminal open. Stop the server with Ctrl+C. To reopen the existing preview, run `python3 tools/serve.py` again; rebuild after changing the documentation. Previewing the exported documentation requires no RimWorld installation.

Instructions for updating the API, checking examples and publishing belong in the site's [maintenance guide](compatibility/contributing.md).

## License

Original documentation and tooling are licensed under [MIT](LICENSE).
