---
name: bdd-gherkin
description: How to write BDD/Gherkin tests in this repo — Cucumber-style .feature files paired with step definitions for the NestJS backend (jest-cucumber) and the Next.js frontend (@amiceli/vitest-cucumber). Use this skill whenever the user asks to add BDD tests, Gherkin scenarios, Cucumber-style tests, feature files, or behavior-driven tests to apis/albumcito-facilito-api or apps/albumcito-facilito-app — even if they just say "write a test for X in Given/When/Then form" or "add a scenario for Y" without naming Gherkin or Cucumber explicitly.
---

# BDD/Gherkin testing in this repo

Both packages already have BDD wired into their normal test runner — there is no
separate Cucumber CLI to install or run. A BDD test is always two files: a
Gherkin `.feature` file (the scenario, in plain language) and a step-definition
file (the code that makes each step happen), co-located next to the code they
cover, exactly like the existing plain unit tests already are.

Pick the section below for the package you're adding a scenario to. The two use
different libraries with different APIs — don't mix them up.

## Backend — NestJS (`apis/albumcito-facilito-api`)

**Library:** `jest-cucumber`, running on the existing Jest setup (`pnpm test` /
`pnpm --filter @albumcito-facilito/api test`). No separate command.

**Reference example:** `src/app.controller.feature` + `src/app.controller.bdd.spec.ts`.

**Naming:** `<subject>.feature` next to `<subject>.bdd.spec.ts`, inside `src/`
(Jest's `rootDir` is `src`, `testRegex` only matches `*.spec.ts`, so `.feature`
files are invisible to Jest and only ever read by `loadFeature`).

**Template:**

`src/<feature>.feature`:
```gherkin
Feature: <what this feature is for, one line>
  As a <role>
  I want <capability>
  So that <benefit>

  Scenario: <concrete scenario name>
    Given <starting state>
    When <action>
    Then <observable outcome>
```

`src/<feature>.bdd.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { SomeController } from './some.controller';
import { SomeService } from './some.service';

const feature = loadFeature('./<feature>.feature', { loadRelativePath: true });

defineFeature(feature, (test) => {
  let controller: SomeController;

  test('<concrete scenario name>', ({ given, when, then }) => {
    given('<starting state>', async () => {
      const app: TestingModule = await Test.createTestingModule({
        controllers: [SomeController],
        providers: [SomeService],
      }).compile();

      controller = app.get<SomeController>(SomeController);
    });

    when('<action>', () => {
      // exercise the controller/service here
    });

    then('<observable outcome>', () => {
      expect(/* ... */).toBe(/* ... */);
    });
  });
});
```

Key points:
- The scenario `test('<name>', ...)` string must match the `Scenario:` name in
  the `.feature` file **exactly**, and each `given`/`when`/`then` string must
  match its Gherkin line exactly (minus the keyword) — `jest-cucumber` matches
  by text, not by order alone, and throws a clear error naming the missing step
  if something doesn't line up. Prefer this over guessing wording — run the
  test once and let the error tell you the exact string it expected.
- Always pass `{ loadRelativePath: true }` to `loadFeature` so the path is
  resolved relative to the spec file itself, not to the process's cwd — this
  keeps the test runnable both from the package root and from the repo root
  via `pnpm --filter`.
- Multiple `Given`/`When`/`Then` in a row in Gherkin (`And`, `But`) map to the
  same `given`/`when`/`then` callback shape — call `given(...)` again for each
  `And` line under a Given, etc.
- For `Scenario Outline` / `Examples` tables, use `test.each` semantics as
  described in the jest-cucumber README — search for "outline" there if a
  scenario needs one; the two examples above cover the common case.
- Reuse the project's existing testing conventions (constructor DI via
  `Test.createTestingModule`, following `src/app.controller.spec.ts`) inside
  the step callbacks — a BDD spec is still just a Jest test underneath.

## Frontend — Next.js (`apps/albumcito-facilito-app`)

**Library:** `@amiceli/vitest-cucumber` (pinned to `^5.2.1` — later majors need
Vitest 4, this project is on Vitest 3), running on the existing Vitest setup
(`pnpm test` / `pnpm --filter @albumcito-facilito/app test`). No separate command.

**Reference example:** `app/page.feature` + `app/page.bdd.test.tsx`.

**Naming:** `<subject>.feature` next to `<subject>.bdd.test.tsx`, co-located
under `app/` with the route/component it covers. Vitest's default include
pattern only matches `*.test.*`/`*.spec.*`, so the step file must end in
`.test.tsx` (or `.spec.tsx`) — `.feature` files are never picked up as tests.

**Template:**

`app/<segment>/<feature>.feature`:
```gherkin
Feature: <what this feature is for, one line>
  As a <role>
  I want <capability>
  So that <benefit>

  Scenario: <concrete scenario name>
    Given <starting state>
    When <action>
    Then <observable outcome>
```

`app/<segment>/<feature>.bdd.test.tsx`:
```tsx
import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SomeComponent from "./some-component";

const feature = await loadFeature("./<feature>.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("<concrete scenario name>", ({ Given, When, Then }) => {
    Given("<starting state>", () => {
      render(<SomeComponent />);
    });

    When("<action>", () => {
      // simulate the interaction here (e.g. userEvent.click(...))
    });

    Then("<observable outcome>", () => {
      expect(screen.getByRole(/* ... */)).toBeDefined();
    });
  });
});
```

Key points:
- `loadFeature` resolves its path relative to the test file's own directory —
  a bare `"./<feature>.feature"` works as long as the two files sit side by
  side, matching the reference example.
- `Scenario`, `Given`/`When`/`Then`/`And` are Vitest `describe`/`test` under
  the hood — don't nest an extra `describe`/`test`/`it` inside them, and
  `vitest-cucumber` will error at run time if a Gherkin step or scenario in
  the `.feature` file has no matching callback (or vice versa), which is the
  main value over a hand-rolled `describe` block: it keeps the spec and the
  code from drifting apart silently.
- Use Testing Library exactly as in the project's plain tests
  (`app/page.test.tsx`) inside the step callbacks — `render`, `screen`, and
  `@testing-library/user-event` if interaction is needed (add it as a
  devDependency if the scenario needs clicks/typing and it isn't installed
  yet).
- For multiple scenarios in one feature, add more `Scenario(...)` blocks
  inside the same `describeFeature` callback; for `Background:` steps shared
  across scenarios, destructure `Background` alongside `Scenario` — see
  `Background` in `@amiceli/vitest-cucumber`'s docs for the exact shape.

## Both packages

- Run the whole suite as usual — `pnpm test` in the package, or
  `pnpm --filter @albumcito-facilito/api test` / `pnpm --filter @albumcito-facilito/app test`
  from the repo root. BDD specs run alongside plain unit tests, no extra flag.
- Write the `.feature` file first, in plain language, before writing any step
  code — that's the point of BDD: the scenario should be readable and
  reviewable by someone who never opens the step-definition file.
- Don't invent a separate `cucumber.js`/`cucumber.json` runner config for
  either package — that would require its own TypeScript/JSX compilation
  pipeline the project doesn't have, whereas both `jest-cucumber` and
  `@amiceli/vitest-cucumber` reuse the transform pipeline the existing
  Jest/Vitest configs already set up.
