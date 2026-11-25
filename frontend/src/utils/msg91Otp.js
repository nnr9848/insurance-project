/**
 * Centralized MSG91 OTP Widget Utility
 * Handles WhatsApp, SMS, Email & Voice 4-digit OTP verification via MSG91 SendOTP.
 */

export const MSG91_CONFIG = {
  widgetId: '366b78695955393733323532',
  tokenAuth: '592795ThlSyisg09zf6b068890P1',
};

let scriptLoadingPromise = null;

/**
 * Dynamically loads MSG91 verification script with automatic CDN fallback
 */
export function loadMsg91Script() {
  if (typeof window !== 'undefined' && typeof window.initSendOTP === 'function') {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const urls = [
      'https://verify.msg91.com/otp-provider.js',
      'https://verify.phone91.com/otp-provider.js'
    ];
    let index = 0;

    function attempt() {
      const script = document.createElement('script');
      script.src = urls[index];
      script.async = true;
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        index++;
        if (index < urls.length) {
          attempt();
        } else {
          reject(new Error('Failed to load MSG91 OTP script from primary and fallback CDNs.'));
        }
      };
      document.head.appendChild(script);
    }

    attempt();
  });

  return scriptLoadingPromise;
}

/**
 * Opens MSG91 interactive OTP verification widget
 * @param {Object} options
 * @param {string} options.phoneNumber - Optional 10-digit Indian mobile number
 * @param {Function} options.onSuccess - Callback receiving { token, phoneNumber, raw }
 * @param {Function} options.onFailure - Callback receiving error object
 */
export async function openMsg91OtpWidget({ phoneNumber = '', onSuccess, onFailure }) {
  try {
    await loadMsg91Script();

    const cleanDigits = (phoneNumber || '').replace(/\D/g, '').slice(-10);
    const identifier = cleanDigits ? `91${cleanDigits}` : '';

    const configuration = {
      widgetId: MSG91_CONFIG.widgetId,
      tokenAuth: MSG91_CONFIG.tokenAuth,
      identifier: identifier,
      exposeMethods: false,
      success: (data) => {
        // MSG91 returns the verified access token
        const token = typeof data === 'string' ? data : (data?.token || data?.message || JSON.stringify(data));
        if (onSuccess) {
          onSuccess({
            token,
            phoneNumber: cleanDigits,
            raw: data
          });
        }
      },
      failure: (error) => {
        console.warn('[MSG91 OTP] Verification cancelled or failed:', error);
        if (onFailure) {
          onFailure(error);
        }
      }
    };

    if (typeof window.initSendOTP === 'function') {
      window.initSendOTP(configuration);
    } else {
      throw new Error('MSG91 initSendOTP function not found on window object.');
    }
  } catch (err) {
    console.error('[MSG91 OTP] Failed to initialize widget:', err);
    if (onFailure) {
      onFailure(err);
    }
  }
}
