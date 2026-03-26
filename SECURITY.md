# Security Policy

## Supported Versions

This project is currently in active development. Security fixes are applied to the latest version only.

## Reporting a Vulnerability

If you discover a security vulnerability in Slash Cards, please **do not open a public issue**.

Instead, report it privately by emailing the repository owner or opening a [GitHub private security advisory](https://github.com/BrettReifs/slash-cards/security/advisories/new).

Please include:
- A clear description of the vulnerability
- Steps to reproduce or a proof-of-concept
- The potential impact

You can expect an acknowledgement within a few days, and a fix or mitigation plan within a reasonable timeframe depending on severity.

## Scope

Slash Cards is intended for **local use only**. The HTTP server defaults to `127.0.0.1` and should not be exposed to the public internet without an additional auth/proxy layer.

Known non-issues:
- The app serves read-only slash command data and has no user authentication by design.
- There is no database, no file writes, and no shell execution.
