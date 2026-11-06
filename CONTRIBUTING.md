# Contributing Guide

Language: English(Current Language) | [简体中文](https://github.com/nexfteam/Nexfep/blob/main/CONTRIBUTING-CN.md)

Thank you for considering contributing to Nexfep. Nexfep is a desktop application framework built on `@webviewjs/webview` and written in TypeScript. It is currently in early development. Both the codebase and the API are evolving, so please stay flexible when contributing, and feel free to join the discussion directly.

## How to Contribute

- **You already have an implementation plan**: submit a PR directly.
- **No plan yet**: open an Issue to discuss your idea or question, or browse existing Issues to find a direction you'd like to contribute to.
- **Minor fixes** (typos, broken links, etc.): submit a PR directly with a brief description.

## Development Environment

- **Node.js**: 24 or later. Download at [https://nodejs.org/en/download](https://nodejs.org/en/download).
- **pnpm**: recommended as the package manager; see installation instructions at [https://pnpm.io/installation](https://pnpm.io/installation).
- **Git**: any recent version; download at [https://git-scm.com/downloads](https://git-scm.com/downloads).

Clone the repository and install dependencies:

```bash
git clone https://github.com/nexfteam/Nexfep.git
cd Nexfep
pnpm install
```

Build:

```bash
pnpm compile
```

## PR Requirements

- In the description, state three things: **what you did, how to verify it, and whether it contains breaking changes**.
- **Use a type prefix in the title**: `fix:`, `feat:`, `chore:`, `refactor:`, etc., to make the nature of the change easy to identify.
- **If there is a related Issue, link it** (e.g. write `Closes #123` in the description).
- **One PR should do one thing**, avoiding mixing refactoring with new features.
- When opening a PR, it is recommended to check **“Allow edits and access to secrets by maintainers”**, so maintainers can fix details directly and avoid repeated round trips over small issues.

## Code Style

- **`any` may only be used for external input parameters whose types are uncertain**; internal code must never use `any`.
- Naming and formatting should **follow nearby code**; when there is no nearby code to reference, use the language's official recommended style.
- Before submitting, run `fmt:fix` and `lint:fix`. Note that `fmt` and `lint` only check and do not modify files; the `:fix` suffix is required to actually write changes.
- Since there is currently no automated testing, if you need to test or verify your changes, write a script for it. **Do not** commit test scripts to the repository.

## Bugs and Suggestions

Please search first to see whether a similar Issue already exists. When opening a new one, include as much as possible: **environment information, reproduction steps, expected behavior and actual behavior**. If you can write a reproduction script, attach it in the Issue body or comments. For feature suggestions, describe the problem you are addressing and the usage you expect.

## Communication, Discussion, and Response

- PR and Issue bodies **may be written in Chinese or English**. When using another language, please attach a Chinese or English translation. Maintainers will use translation tools for unfamiliar languages, but translations may be inaccurate; to reduce misunderstandings, please prefer Chinese or English.
- When reading someone else's PR or Issue, you may use translation tools if the language is unfamiliar. When commenting on a PR or Issue, it is recommended to use the same language as the body to reduce barriers.
- Nexfep is maintained by maintainers in their spare time, and **no response time is guaranteed**. It is normal for a PR, Issue, or review to wait several weeks; please be patient. Polite pings are welcome, but they usually won't speed things up, and may go unnoticed if notifications are buried.

## Non-Negotiable Rules

- **Malicious code is strictly prohibited**: including but not limited to backdoors, data theft, destructive operations, undisclosed remote requests, or hidden behavior. Such contributions will be rejected outright.
- **Avoid offensive language**: insults, discrimination, or other inappropriate content should be avoided in code, comments, commit messages, and documentation. If the code itself is of good quality, maintainers may remove such content directly or ask the author to remove it, without rejecting the entire PR.
- If you find such issues in others' contributions, you may comment on the corresponding PR or Issue to point out the problem and remind both the author and maintainers. Maintainers will pay attention to it when reviewing the PR.

## License

Nexfep is licensed under the MIT License. By submitting a contribution, you agree that your code will be released under the same license.
