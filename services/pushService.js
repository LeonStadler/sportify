const PUBLIC_KEY = process.env.WEB_PUSH_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || null;
const PRIVATE_KEY = process.env.WEB_PUSH_PRIVATE_KEY || process.env.VAPID_PRIVATE_KEY || null;
const SUBJECT = process.env.WEB_PUSH_SUBJECT || process.env.VAPID_SUBJECT || 'mailto:support@sportify.app';
const TTL = Number(process.env.WEB_PUSH_TTL_SECONDS ?? 0) || 60;

const isConfigured = Boolean(PUBLIC_KEY && PRIVATE_KEY);
let webPushModule = null;
let loadPromise = null;

const loadWebPush = async () => {
  if (!isConfigured) {
    return null;
  }

  if (webPushModule) {
    return webPushModule;
  }

  if (!loadPromise) {
    loadPromise = import('web-push')
      .then((module) => {
        const webpush = module.default ?? module;
        if (webpush && typeof webpush.setVapidDetails === 'function') {
          webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
        }
        webPushModule = webpush;
        return webpush;
      })
      .catch((error) => {
        console.warn('[Push Service] web-push module is not available:', error.message);
        webPushModule = null;
        return null;
      })
      .finally(() => {
        loadPromise = null;
      });
  }

  return loadPromise;
};

export const getPublicKey = () => (isConfigured ? PUBLIC_KEY : null);

export const isPushConfigured = () => isConfigured;

export const sendPushNotification = async (subscription, payload) => {
  if (!isConfigured) {
    return { success: false, error: new Error('web-push-not-configured') };
  }

  const webpush = await loadWebPush();
  if (!webpush) {
    return { success: false, error: new Error('web-push-module-missing') };
  }

  try {
    await webpush.sendNotification(subscription, payload, { TTL });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const __internal = { loadWebPush };
