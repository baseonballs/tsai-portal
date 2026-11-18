# Release TSAI-PORTAL.v0.4.3.beta — transcendental-sports.ai is the only customer-facing domain

**Ships with:** tsai-toolchain #983 (GoTrue redirect allow list and OAuth-edge callbacks gain the official hosts; legacy entries kept), applied by bifrost deploy stage 3 before this release.

## What changed
- #47: every link, origin and setting this app emits now uses `*.transcendental-sports.ai`.
- A request that arrives on a retired `tsai-spotlight.com` hostname gets a 308 to the same path on this app's official host. The decision uses the Host header only, never redirects an official host, takes the target from a fixed table, and is marked `Cache-Control: private, no-store`. The published manual refuses the retired domain.
- A guard test fails the suite if the retired domain reappears in shipped code.

## Backward compatibility
Nothing was removed: the legacy DNS records, GCP domain mappings, the legacy Resend domain and the legacy allow-list entries all stay, so existing links keep working and land on the official host.

## Before deploy
- tsai-toolchain #983 applied (stage 3). The Google OAuth client already lists the official callback URLs (owner, 2026-11-18).

## Verify behind the gate
- A legacy hostname answers 308 to the official host; the official host answers normally (503 while maintenance is on).
- Sign-in works on the official host.

## Known follow-ups
- Mail is still sent from the verified legacy domain until `transcendental-sports.ai` is verified in Resend (owner step).
