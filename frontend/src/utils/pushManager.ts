import axios from 'axios';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const subscribeToWebPush = async (token?: string | null) => {
    console.log('[WebPush] Start subscription process...');
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('[WebPush] Push messaging is not supported');
        return;
    }

    try {
        console.log('[WebPush] Registering Service Worker...');
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[WebPush] SW Registered. Requesting permission...');
        const permission = await Notification.requestPermission();
        console.log('[WebPush] Permission result:', permission);

        if (permission !== 'granted') {
            console.log('[WebPush] Push permission denied');
            return;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        console.log('[WebPush] VAPID Key available:', !!vapidPublicKey);
        if (!vapidPublicKey) {
            console.error('[WebPush] VAPID public key not found');
            return;
        }

        console.log('[WebPush] Converting key...');
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        
        console.log('[WebPush] Waiting for active Service Worker...');
        const readyRegistration = await navigator.serviceWorker.ready;

        console.log('[WebPush] Checking for existing subscription...');
        let subscription = await readyRegistration.pushManager.getSubscription();
        if (subscription) {
            console.log('[WebPush] Found old subscription, unsubscribing to refresh...');
            await subscription.unsubscribe();
        }

        try {
            console.log('[WebPush] Subscribing to push manager...');
            subscription = await readyRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });
            console.log('[WebPush] Subscription generated');
        } catch (subError: any) {
            console.error('[WebPush] Subscribe failed:', subError);
            if (subError.name === 'AbortError' || subError.message.includes('push service error')) {
                console.log('[WebPush] Attempting automatic recovery by unregistering Service Worker...');
                await readyRegistration.unregister();
                console.log('[WebPush] SW unregistered. Please refresh the page to try again.');
                return;
            }
            throw subError;
        }

        const subJson = subscription.toJSON();
        
        const authToken = token || localStorage.getItem('sector_madness_token') || localStorage.getItem('sector_madness_admin_token');
        console.log('[WebPush] Auth token available:', !!authToken);
        if (!authToken) {
            console.error('[WebPush] No auth token found, aborting backend save.');
            return;
        }

        console.log('[WebPush] Sending to backend...');
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/push/subscribe`, {
            endpoint: subJson.endpoint,
            keys: subJson.keys
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('[WebPush] Backend save successful!', res.data);

    } catch (error) {
        console.error('[WebPush] Failed to subscribe to web push:', error);
    }
};
