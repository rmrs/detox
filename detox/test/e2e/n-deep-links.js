describe('Deep Links', () => {

  it('device.launchApp({{newInstance: true, url: url}) should launch app and trigger handling of deep links in app', async () => {
    const escapedUrl = 'detoxtesturlscheme://such-string?foo=1\\&bar=2';
    const url = 'detoxtesturlscheme://such-string?foo=1&bar=2';
    await device.launchApp({newInstance: true, url: escapedUrl});
    await expect(element(by.label(url))).toBeVisible();
  });

  it('device.openURL({url: url}) should trigger handling of deep links in app when app is in foreground', async () => {
    const url = 'detoxtesturlscheme://such-string?foo=1&bar=2';
    await device.launchApp({newInstance: true});
    await device.openURL({url});
    await expect(element(by.label(url))).toBeVisible();
  });

  it('device.launchApp({url: url}) should trigger handling of deep links in app when app is in background', async () => {
    const url = 'detoxtesturlscheme://such-string?foo=1&bar=2';
    await device.launchApp({newInstance: true});
    await device.sendToHome();
    await device.launchApp({newInstance: false, url});
    await expect(element(by.label(url))).toBeVisible();
  });

  it('device.launchApp({{newInstance: true, url: url}) should launch app and trigger handling of deep links in app', async () => {
    const url = 'detoxtesturlscheme://such-string?foo=1&bar=2';
    await device.launchApp({newInstance: true, url});
    await expect(element(by.label(url))).toBeVisible();
  });
});
