# PuteraMY — Shared Agent Development Instructions

These instructions apply to development work in this repository.

## Shared agent skills

Canonical reference: https://github.com/PuteraMY/PuteraMY-Agent-Skills

Before starting a substantive engineering, design, security, testing, or deployment task:
1. Inspect the available skills in the shared repository, especially `.agents/skills/*/SKILL.md`.
2. Select only the skills relevant to the current task; do not blindly apply every skill.
3. If the agent environment supports installing or registering skills, use its supported mechanism. Otherwise, read the relevant SKILL.md instructions and apply them as guidance.
4. Do not claim a skill is installed, automatically discovered, or executed unless verified.
5. If the shared repository is unavailable, proceed using repository-local instructions and report that limitation; do not block unrelated work.

Relevant skills include: `frontend-design`, `design-system`, `fullstack-development`, `database-architecture`, `security-audit`, `automated-testing`, `performance-optimization`, and `deployment-qa`.

## Engineering standards

- Continue the existing project; do not rebuild or replace it without explicit approval.
- Inspect the codebase, dependencies, scripts, and existing tests before editing.
- Preserve working functionality and follow the repository's established stack and conventions.
- Prioritize clear UX, accessibility, responsive design, maintainability, security, and performance.
- Never expose secrets, credentials, or sensitive data.
- Test changes using the checks actually available; distinguish tested results from assumptions.
- Avoid unnecessary dependencies, paid services, database migrations, and unrelated changes.
- Prefer reviewable branches or pull requests for substantial work.
- Obtain approval before destructive operations, production deployment, or changes that incur cost.
- Document what changed, verification performed, and remaining limitations.

These are repository-level instructions for compatible agents, not a guarantee that every AI session will automatically load external skills.
