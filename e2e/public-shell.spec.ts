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
