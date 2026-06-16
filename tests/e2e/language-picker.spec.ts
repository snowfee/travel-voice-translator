import { expect, test } from '@playwright/test';

test('language index can jump backward after jumping forward', async ({ page }) => {
  await page.goto('/conversation');

  const routeButtons = page.locator('.route-stop-trigger');
  await expect(routeButtons).toHaveCount(2);
  await routeButtons.nth(1).click();

  const picker = page.locator('.language-picker');
  const pickerBody = page.locator('.language-picker-body');
  const indexNav = page.locator('.language-index');

  await expect(picker).toBeVisible();
  await expect(indexNav).toBeVisible();

  const indexButtons = indexNav.locator('button');
  await expect(indexButtons).toContainText(['#', 'A', 'B', 'D', 'J']);

  const jButton = indexNav.getByRole('button', { name: 'J' });
  const dButton = indexNav.getByRole('button', { name: 'D' });

  await jButton.click();

  await expect
    .poll(async () => {
      return await page.evaluate(() => {
        const body = document.querySelector('.language-picker-body');
        const target = document.querySelector('#language-index-J');
        if (!body || !target) {
          return null;
        }

        const bodyRect = body.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        return Math.round(targetRect.top - bodyRect.top);
      });
    })
    .toBeLessThan(48);

  const stateAfterJ = await page.evaluate(() => {
    const body = document.querySelector('.language-picker-body');
    const target = document.querySelector('#language-index-J');
    if (!body || !target) {
      return null;
    }

    const bodyRect = body.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return {
      scrollTop: body.scrollTop,
      topDelta: Math.round(targetRect.top - bodyRect.top),
      url: location.href,
    };
  });

  await dButton.click();

  await expect
    .poll(async () => {
      return await page.evaluate(() => {
        const body = document.querySelector('.language-picker-body');
        const target = document.querySelector('#language-index-D');
        if (!body || !target) {
          return null;
        }

        const bodyRect = body.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        return Math.round(targetRect.top - bodyRect.top);
      });
    })
    .toBeLessThan(48);

  const stateAfterD = await page.evaluate(() => {
    const body = document.querySelector('.language-picker-body');
    const target = document.querySelector('#language-index-D');
    if (!body || !target) {
      return null;
    }

    const bodyRect = body.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return {
      scrollTop: body.scrollTop,
      topDelta: Math.round(targetRect.top - bodyRect.top),
      url: location.href,
    };
  });

  expect(stateAfterJ).not.toBeNull();
  expect(stateAfterD).not.toBeNull();
  expect(stateAfterJ?.topDelta).toBeLessThan(48);
  expect(stateAfterD?.topDelta).toBeLessThan(48);
  expect(stateAfterD?.url).not.toContain('#language-index-');
  await expect(page).toHaveURL(/\/conversation$/);
});
