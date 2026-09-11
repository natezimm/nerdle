import { expect, test } from '@playwright/test';

const mockWordApi = async (page) => {
  let targetWord = 'react';

  await page.route('**/api/games/*/guesses', async (route) => {
    const { word } = route.request().postDataJSON();
    const won = word === targetWord;
    await route.fulfill({
      json: {
        valid: true,
        score: Array(targetWord.length).fill(won ? 'correct' : 'absent'),
        won,
        complete: won,
        attemptsRemaining: won ? 5 : 4,
        ...(won ? { answer: targetWord } : {}),
      },
    });
  });

  await page.route('**/api/games', async (route) => {
    const { wordLength = 5 } = route.request().postDataJSON();
    const words = {
      4: 'code',
      5: 'react',
      6: 'server',
    };
    targetWord = words[wordLength] ?? 'react';

    await route.fulfill({
      status: 201,
      json: { gameId: 'test-game', wordLength, maxAttempts: 6 },
    });
  });
};

const expectContained = (box, bounds, label) => {
  expect(box.left, `${label} left edge`).toBeGreaterThanOrEqual(bounds.left);
  expect(box.right, `${label} right edge`).toBeLessThanOrEqual(bounds.right);
  expect(box.top, `${label} top edge`).toBeGreaterThanOrEqual(bounds.top);
  expect(box.bottom, `${label} bottom edge`).toBeLessThanOrEqual(bounds.bottom);
};

const expectSeparated = (first, second, label) => {
  const separated =
    first.right <= second.left ||
    second.right <= first.left ||
    first.bottom <= second.top ||
    second.bottom <= first.top;
  expect(separated, label).toBe(true);
};

const windowStyleNames = {
  auto: 'Auto',
  macos: 'Mac',
  windows: 'Win',
  none: 'None',
};
const gameStyleNames = {
  tiles: 'Tiles',
  terminal: 'Grid',
  'full-terminal': 'Full',
};

const styleOption = (settings, groupName, name) =>
  settings
    .getByRole('group', { name: groupName, exact: true })
    .getByRole('button', { name, exact: true });

const expectStyleOptionsFit = async (settings) => {
  for (const [name, options] of [
    ['Game style', Object.values(gameStyleNames)],
    ['Window style', Object.values(windowStyleNames)],
  ]) {
    const group = settings.getByRole('group', { name, exact: true });
    await group.scrollIntoViewIfNeeded();
    const buttons = group.getByRole('button');
    await expect(buttons).toHaveText(options);
    const layout = await group.evaluate((element) => {
      const dialog = element.closest('[role="dialog"]');
      return {
        dialog: dialog.getBoundingClientRect().toJSON(),
        scrollWidth: dialog.scrollWidth,
        clientWidth: dialog.clientWidth,
        scrollLeft: dialog.scrollLeft,
        buttons: Array.from(element.querySelectorAll('button'), (button) =>
          button.getBoundingClientRect().toJSON()
        ),
      };
    });
    expect(
      layout.scrollWidth,
      `${name} has no horizontal overflow`
    ).toBeLessThanOrEqual(layout.clientWidth);
    expect(layout.scrollLeft, `${name} needs no horizontal scrolling`).toBe(0);
    for (const [index, box] of layout.buttons.entries()) {
      await expect(buttons.nth(index)).toBeInViewport({ ratio: 1 });
      expectContained(box, layout.dialog, `${name}: ${options[index]}`);
      expect(
        Math.abs(box.top - layout.buttons[0].top),
        `${name} stays in one row`
      ).toBeLessThanOrEqual(1);
      if (index > 0) {
        expect(box.left, `${name} reads left to right`).toBeGreaterThanOrEqual(
          layout.buttons[index - 1].right
        );
      }
    }
  }
};

const expectHeaderFits = async (page, viewport, trimSelector) => {
  await expect(page.locator(trimSelector)).toBeVisible();
  const layout = await page.locator('.header').evaluate(
    (header, trim) => ({
      header: header.getBoundingClientRect().toJSON(),
      parts: ['.brand-title', '.stats-button', '.settings-button', trim].map(
        (selector) => ({
          selector,
          box: header.querySelector(selector).getBoundingClientRect().toJSON(),
        })
      ),
      scrollWidth: document.documentElement.scrollWidth,
    }),
    trimSelector
  );
  expect(layout.scrollWidth).toBeLessThanOrEqual(viewport.width);
  expectContained(
    layout.header,
    { left: 0, top: 0, right: viewport.width, bottom: viewport.height },
    'Header'
  );
  for (const [index, part] of layout.parts.entries()) {
    expectContained(part.box, layout.header, part.selector);
    for (const other of layout.parts.slice(index + 1)) {
      const separated =
        part.box.right <= other.box.left ||
        other.box.right <= part.box.left ||
        part.box.bottom <= other.box.top ||
        other.box.bottom <= part.box.top;
      expect(separated, `${part.selector} clears ${other.selector}`).toBe(true);
    }
  }
};

test.describe('nerdle client', () => {
  test.beforeEach(async ({ page }) => {
    await mockWordApi(page);
  });

  test('loads the game shell and controls', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Nerdle/);
    await expect(page.getByRole('heading', { name: 'Nerdle' })).toBeVisible();
    await expect(page.getByRole('main', { name: 'Nerdle game' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Statistics' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
    await expect(page.locator('.letter')).toHaveCount(30);
  });

  test('opens settings and changes word length', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();

    await page.getByRole('button', { name: '4' }).click();
    await expect(page.locator('.letter')).toHaveCount(24);

    await page.getByRole('button', { name: 'Close settings' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Settings' })
    ).not.toBeVisible();
  });

  test('switches and remembers window and board styles on a narrow screen', async ({
    page,
  }) => {
    const viewport = { width: 320, height: 568 };
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('.board-status')).toHaveText('guess 01 / 06');

    for (const letter of ['R', 'E', 'A']) {
      await page.getByRole('button', { name: letter, exact: true }).click();
    }
    const currentLetters = page.locator('.word-row').first().locator('.letter');
    await expect(currentLetters).toHaveText(['r', 'e', 'a', '', '']);

    const settings = page.getByRole('dialog', { name: 'Settings' });
    const setStyles = async (windowStyle, boardStyle) => {
      await page.getByRole('button', { name: 'Settings', exact: true }).click();
      await expect(settings).toBeVisible();
      await styleOption(
        settings,
        'Window style',
        windowStyleNames[windowStyle]
      ).click();
      await styleOption(
        settings,
        'Game style',
        gameStyleNames[boardStyle]
      ).click();
      await expect(
        styleOption(settings, 'Window style', windowStyleNames[windowStyle])
      ).toHaveAttribute('aria-pressed', 'true');
      await expect(
        styleOption(settings, 'Game style', gameStyleNames[boardStyle])
      ).toHaveAttribute('aria-pressed', 'true');
      await expectStyleOptionsFit(settings);
      await expect(page.getByRole('main')).toHaveAttribute(
        'data-window-style',
        windowStyle
      );
      await expect(page.locator('.game-content')).toHaveAttribute(
        'data-board-style',
        boardStyle === 'tiles' ? 'tiles' : 'terminal'
      );
      await settings.getByRole('button', { name: 'Close settings' }).click();
      await expect(settings).not.toBeVisible();
    };

    await setStyles('windows', 'terminal');
    await expect(currentLetters).toHaveText(['r', 'e', 'a', '', '']);
    await expectHeaderFits(page, viewport, '.windows-controls');

    await page.reload();
    await expect(page.getByRole('main')).toHaveAttribute(
      'data-window-style',
      'windows'
    );
    await expect(page.locator('.game-content')).toHaveAttribute(
      'data-board-style',
      'terminal'
    );
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(settings).toBeVisible();
    await expect(styleOption(settings, 'Window style', 'Win')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(styleOption(settings, 'Game style', 'Grid')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await settings.getByRole('button', { name: 'Close settings' }).click();
    await expect(settings).not.toBeVisible();

    await setStyles('macos', 'tiles');
    await expectHeaderFits(page, viewport, '.terminal-dots');
    await expect(page.locator('.windows-controls')).not.toBeVisible();

    await setStyles('none', 'full-terminal');
    await expect(page.getByRole('main')).toHaveAttribute(
      'data-app-style',
      'terminal'
    );
    await expect(page.locator('.terminal-dots')).not.toBeVisible();
  });

  test('plays in full terminal mode and returns to tiles on a narrow screen', async ({
    page,
  }) => {
    const viewport = { width: 320, height: 568 };
    const viewportBounds = {
      left: 0,
      top: 0,
      right: viewport.width,
      bottom: viewport.height,
    };
    await page.setViewportSize(viewport);
    await page.goto('/');

    const settings = page.getByRole('dialog', { name: 'Settings' });
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await styleOption(settings, 'Window style', 'Win').click();
    await styleOption(settings, 'Game style', 'Full').click();
    await settings.getByRole('button', { name: 'Close settings' }).click();
    await expect(page.getByRole('main')).toHaveAttribute(
      'data-app-style',
      'terminal'
    );
    await expect(page.locator('.game-content')).toHaveAttribute(
      'data-board-style',
      'terminal'
    );
    await expectHeaderFits(page, viewport, '.windows-controls');

    await page.reload();
    await expect(page.getByRole('main')).toHaveAttribute(
      'data-app-style',
      'terminal'
    );
    await expect(page.getByRole('main')).toHaveAttribute(
      'data-window-style',
      'windows'
    );
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(styleOption(settings, 'Game style', 'Full')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(styleOption(settings, 'Window style', 'Win')).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    const expectDialogFits = async (dialog, label) => {
      const layout = await dialog.evaluate((element) => ({
        dialog: element.getBoundingClientRect().toJSON(),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }));
      expectContained(layout.dialog, viewportBounds, `${label} dialog`);
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
      for (const control of await dialog.getByRole('button').all()) {
        await control.scrollIntoViewIfNeeded();
        await expect(control).toBeInViewport({ ratio: 1 });
        const bounds = await control.evaluate((element) =>
          element.getBoundingClientRect().toJSON()
        );
        expectContained(bounds, layout.dialog, `${label} control`);
      }
    };
    await expectDialogFits(settings, 'Settings');
    await expectStyleOptionsFit(settings);
    await settings.getByRole('button', { name: 'Close settings' }).click();

    for (const letter of ['R', 'E', 'A', 'C', 'T']) {
      await page.getByRole('button', { name: letter, exact: true }).click();
    }
    await page.getByRole('button', { name: 'Enter' }).click();
    await expect(page.getByText(/Congratulations/)).toBeVisible({
      timeout: 4_000,
    });
    await expect(page.locator('.board-status')).toHaveText('solved ✓');

    await page.getByRole('button', { name: 'Statistics', exact: true }).click();
    const statistics = page.getByRole('dialog', { name: 'Statistics' });
    await expect(statistics).toBeVisible();
    await expectDialogFits(statistics, 'Statistics');
    await expect(
      statistics
        .locator('.stat-item')
        .filter({ hasText: 'Played' })
        .locator('.stat-value')
    ).toHaveText('1');
    await statistics.getByRole('button', { name: 'Close statistics' }).click();
    await expect(statistics).not.toBeVisible();

    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await styleOption(settings, 'Game style', 'Tiles').click();
    await settings.getByRole('button', { name: 'Close settings' }).click();
    await expect(settings).not.toBeVisible();
    await expect(page.getByRole('main')).toHaveAttribute(
      'data-app-style',
      'default'
    );
    await expect(page.locator('.game-content')).toHaveAttribute(
      'data-board-style',
      'tiles'
    );
    await expect(page.locator('.word-row').first()).toContainText('react');
  });

  for (const viewport of [
    { width: 320, height: 400 },
    { width: 320, height: 568 },
    { width: 390, height: 664 },
    { width: 568, height: 320 },
    { width: 720, height: 668 },
  ]) {
    for (const boardStyle of ['tiles', 'terminal', 'full-terminal']) {
      test(`fits ${boardStyle} and controls at ${viewport.width} × ${viewport.height}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.addInitScript((style) => {
          localStorage.setItem('boardStyle', style);
          localStorage.setItem('windowStyle', 'windows');
          if (!localStorage.getItem('wordLength')) {
            localStorage.setItem('wordLength', '4');
          }
        }, boardStyle);
        await page.goto('/');
        const viewportBounds = {
          left: 0,
          top: 0,
          right: viewport.width,
          bottom: viewport.height,
        };

        for (const wordLength of [4, 5, 6]) {
          await test.step(`${wordLength}-letter mode`, async () => {
            if (wordLength !== 4) {
              await page.evaluate((length) => {
                localStorage.setItem('wordLength', String(length));
              }, wordLength);
              await page.reload();
            }
            await expect(page.locator('.letter')).toHaveCount(6 * wordLength);
            await expect(page.locator('.board-status')).toHaveText(
              'guess 01 / 06'
            );
            await page.evaluate(() => document.fonts.ready);

            const layout = await page.evaluate(() => {
              const bounds = (selector) =>
                document
                  .querySelector(selector)
                  .getBoundingClientRect()
                  .toJSON();
              const allBounds = (selector) =>
                Array.from(document.querySelectorAll(selector), (element) =>
                  element.getBoundingClientRect().toJSON()
                );
              return {
                main: bounds('.game-container'),
                header: bounds('.header'),
                board: bounds('.game-content'),
                keyboard: bounds('.keyboard'),
                footer: bounds('.site-footer'),
                keys: allBounds('.keyboard .key'),
                tiles: allBounds('.letter'),
                scrollWidth: document.documentElement.scrollWidth,
                scrollHeight: document.documentElement.scrollHeight,
              };
            });

            expect(layout.scrollWidth).toBeLessThanOrEqual(viewport.width);
            expect(layout.scrollHeight).toBeLessThanOrEqual(viewport.height);
            for (const part of [
              'main',
              'header',
              'board',
              'keyboard',
              'footer',
            ]) {
              expectContained(layout[part], viewportBounds, part);
            }
            expectSeparated(layout.board, layout.header, 'Board clears header');
            expectSeparated(
              layout.board,
              layout.keyboard,
              'Board clears keyboard'
            );
            expectSeparated(
              layout.keyboard,
              layout.footer,
              'Keyboard clears footer'
            );
            for (const [index, key] of layout.keys.entries()) {
              expectContained(key, viewportBounds, `Key ${index + 1}`);
            }
            for (const [index, tile] of layout.tiles.entries()) {
              const label = `Tile ${index + 1}`;
              expect(tile.width, `${label} is visible`).toBeGreaterThan(0);
              expect(
                Math.abs(tile.width - tile.height),
                `${label} is square`
              ).toBeLessThanOrEqual(1);
              expectContained(tile, viewportBounds, label);
              expectContained(tile, layout.board, `${label} in board`);
              expectSeparated(tile, layout.header, `${label} clears header`);
              expectSeparated(
                tile,
                layout.keyboard,
                `${label} clears keyboard`
              );
            }
          });
        }

        if (viewport.height <= 400) {
          for (const name of ['Settings', 'Statistics']) {
            await test.step(`${name} fits the short screen`, async () => {
              await page.getByRole('button', { name, exact: true }).click();
              const dialog = page.getByRole('dialog', { name, exact: true });
              await expect(dialog).toBeVisible();
              const close = dialog.getByRole('button', {
                name: `Close ${name.toLowerCase()}`,
              });
              await expect(close).toBeVisible();
              const dialogBounds = await dialog.evaluate((element) =>
                element.getBoundingClientRect().toJSON()
              );
              const closeBounds = await close.evaluate((element) =>
                element.getBoundingClientRect().toJSON()
              );
              expectContained(dialogBounds, viewportBounds, `${name} dialog`);
              expectContained(
                closeBounds,
                dialogBounds,
                `${name} close button`
              );
              await close.click();
              await expect(dialog).not.toBeVisible();
            });
          }
        }
      });
    }
  }

  test('accepts a winning keyboard guess', async ({ page }) => {
    await page.goto('/');

    for (const letter of ['R', 'E', 'A', 'C', 'T']) {
      await page.getByRole('button', { name: letter, exact: true }).click();
    }

    await expect(page.locator('.word-row').first()).toContainText('react');

    await page.getByRole('button', { name: 'Enter' }).click();

    await expect(page.getByText(/Congratulations/)).toBeVisible({
      timeout: 4_000,
    });
  });
});
