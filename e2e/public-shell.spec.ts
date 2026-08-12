import { expect, test } from "@playwright/test";

test.describe("unauthenticated application boundary", () => {
  test("renders an accessible sign-in gate for protected routes", async ({
    page,
  }) => {
    await page.goto("/evaluation");

    await expect(
      page.getByRole("heading", { name: "Sign in to continue" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("provides a labeled main region and reachable sign-in control", async ({
    page,
  }) => {
    await page.goto("/");

    const main = page.getByRole("main");
    const signIn = page.getByRole("button", { name: "Sign in" });
    await expect(main).toHaveAttribute("aria-labelledby", "sign-in-gate-title");
    await expect(signIn).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(signIn).toBeFocused();

    const invalidLabels = await page
      .locator("[aria-labelledby]")
      .evaluateAll(elements =>
        elements
          .map(element => element.getAttribute("aria-labelledby"))
          .filter(
            (value): value is string =>
              Boolean(value) &&
              value.split(/\\s+/).some(id => !document.getElementById(id))
          )
      );
    expect(invalidLabels).toEqual([]);

    const unnamedControls = await page.locator("button, a[href]").evaluateAll(
      elements =>
        elements.filter(element => {
          const label = element.getAttribute("aria-label");
          const text = element.textContent?.trim();
          return !label && !text;
        }).length
    );
    expect(unnamedControls).toBe(0);
  });

  test("does not introduce horizontal overflow at the configured viewport", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Sign in to continue" })
    ).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
