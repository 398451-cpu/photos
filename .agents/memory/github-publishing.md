---
name: GitHub publishing
description: Reliable publishing behavior for this workspace's connected GitHub repository.
---

Local HTTPS Git push is not authenticated in this workspace, while the connected GitHub integration can publish through the Git Data API.

**Why:** Direct `git push` fails with invalid credentials even when the GitHub integration is healthy.

**How to apply:** For a full current-state publish, create blobs from the local files, create one tree from the remote `main` tree, create a commit, and update `refs/heads/main` through the connected GitHub client. Normalize `git diff --name-only` output for carriage returns before reading paths.