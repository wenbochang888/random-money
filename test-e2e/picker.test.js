const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });

  // 模拟 iPhone 12
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    hasTouch: true,
    isMobile: true,
  });

  const page = await ctx.newPage();
  const jsErrors = [];
  page.on('pageerror', e => jsErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') jsErrors.push(m.text()); });

  await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
  // 等待 Vue 渲染完成
  await page.waitForSelector('.activity-card', { timeout: 15000 });
  await page.screenshot({ path: '/tmp/t1-home.png' });

  // ① 点击第一张卡片（神秘人年龄猜测）
  await page.locator('.activity-card').first().click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/tmp/t2-game.png' });

  // ==================================================================
  // T1: picker-mobile 可见 (宽390px 应触发媒体查询)
  const mobileVis = await page.locator('.picker-mobile').isVisible();
  console.log(`[T1] picker-mobile 可见: ${mobileVis}   ${mobileVis ? '✅' : '❌'}`);

  // T2: picker-desktop 隐藏
  const deskHid = !(await page.locator('.picker-desktop').isVisible());
  console.log(`[T2] picker-desktop 隐藏: ${deskHid}   ${deskHid ? '✅' : '❌'}`);

  // T3: 有 2 个 scroll-picker-container
  const cntCnt = await page.locator('.scroll-picker-container').count();
  console.log(`[T3] scroll-picker-container: ${cntCnt}   ${cntCnt===2 ? '✅' : '❌'} (期望2)`);

  // T4: 有足够多的选项
  const itemCnt = await page.locator('.scroll-picker-item').count();
  console.log(`[T4] 选项总数: ${itemCnt}   ${itemCnt>=290 ? '✅' : '❌'} (期望≥290)`);

  // T5: 初始 transform=translateY(0px)
  await page.waitForSelector('.scroll-picker-content', { timeout: 5000 });
  const initT = await page.locator('.scroll-picker-content').first()
    .evaluate(el => el.style.transform);
  const t5ok = (initT === 'translateY(0px)' || initT === '');
  console.log(`[T5] 初始 transform: "${initT}"   ${t5ok ? '✅' : '❌'} (期望translateY(0px))`);

  // T6: 初始 6 个 active 项，全是 "0"
  const actTexts = await page.evaluate(() =>
    [...document.querySelectorAll('.scroll-picker-item.active')].map(e => e.textContent.trim())
  );
  const t6ok = actTexts.length === 6 && actTexts.every(t => t === '0');
  console.log(`[T6] active 项 [${actTexts}]   ${t6ok ? '✅' : '❌'} (期望6个0)`);

  // ==================================================================
  // T7: 模拟滑动年份列 2 格向上 (ITEM_H=44, delta=88)
  const colBox = await page.locator('.scroll-picker-column').first().boundingBox();
  if (colBox) {
    const cx = colBox.x + colBox.width / 2;
    const cy = colBox.y + colBox.height / 2;

    await page.evaluate(({ cx, cy, dy }) => {
      const el = document.querySelectorAll('.scroll-picker-column')[0];
      const mk = y => new Touch({ identifier: 7, target: el, clientX: cx, clientY: y });
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [mk(cy)], bubbles: true, cancelable: true }));
      for (let i = 1; i <= 6; i++) {
        el.dispatchEvent(new TouchEvent('touchmove', {
          touches: [mk(cy - dy * i / 6)], bubbles: true, cancelable: true
        }));
      }
      el.dispatchEvent(new TouchEvent('touchend', {
        changedTouches: [mk(cy - dy)], bubbles: true, cancelable: true
      }));
    }, { cx, cy, dy: 88 });

    await page.waitForTimeout(450);

    const afterT = await page.locator('.scroll-picker-content').first()
      .evaluate(el => el.style.transform);
    const afterActive = await page.evaluate(() =>
      document.querySelectorAll('.scroll-picker-column')[0]
        .querySelector('.scroll-picker-item.active')?.textContent.trim()
    );
    const t7ok = afterT === 'translateY(-88px)';
    const t8ok = afterActive === '2';
    console.log(`[T7] 滑动后 transform: "${afterT}"   ${t7ok ? '✅' : '❌'} (期望translateY(-88px))`);
    console.log(`[T8] 滑动后 active 值: "${afterActive}"   ${t8ok ? '✅' : '❌'} (期望2)`);

    await page.screenshot({ path: '/tmp/t3-swipe.png' });
  }

  // T9: JS 无错误
  console.log(`[T9] JS 错误: ${jsErrors.length}   ${jsErrors.length===0 ? '✅' : '❌'}`);
  jsErrors.forEach(e => console.log('  ⚠', e));

  await page.screenshot({ path: '/tmp/t4-final.png' });
  await browser.close();

  const all = [mobileVis, deskHid, cntCnt===2, itemCnt>=290, t5ok, t6ok];
  const pass = all.filter(Boolean).length;
  console.log(`\n总结: ${pass}/${all.length} 通过`);
})();
