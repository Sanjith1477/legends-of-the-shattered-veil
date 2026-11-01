import { Capacitor } from '@capacitor/core';

export function isAndroidNativeApp() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function exitAndroidNativeApp() {
  if (!isAndroidNativeApp()) return false;
  const { App } = await import('@capacitor/app');
  await App.exitApp();
  return true;
}
