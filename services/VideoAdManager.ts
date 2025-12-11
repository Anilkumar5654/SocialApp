import { Platform } from 'react-native';
import { api } from './api'; 

let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;
let isAdMobInitialized = false;

if (Platform.OS !== 'web') {
  try {
    const MobileAds = require('react-native-google-mobile-ads');
    InterstitialAd = MobileAds.InterstitialAd;
    AdEventType = MobileAds.AdEventType;
    TestIds = MobileAds.TestIds;

    MobileAds.mobileAds()
      .initialize()
      .then(() => {
        isAdMobInitialized = true;
        VideoAdManager.loadAd();
      })
      .catch(() => {});

  } catch (e) {
    // AdMob not supported on web
  }
}

// Replace with your Real Ad Unit ID in production
const AD_UNIT_ID = (TestIds) ? TestIds.INTERSTITIAL : 'ca-app-pub-3940256099942544/1033173712';

let interstitial: any = null;
let adLoaded = false;

export const VideoAdManager = {
  
  loadAd: () => {
    if (Platform.OS === 'web' || !InterstitialAd || !isAdMobInitialized) return;
    if (adLoaded) return; 

    interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      adLoaded = true;
    });

    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      adLoaded = false;
      VideoAdManager.loadAd(); 
    });

    interstitial.load();
  },

  showAd: async (currentVideo: any): Promise<boolean> => {
    return new Promise((resolve) => {
        
        if (Platform.OS === 'web' || !interstitial || !adLoaded) {
            VideoAdManager.loadAd();
            resolve(false);
            return;
        }

        const unsubscribe = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            unsubscribe(); 
            resolve(true);
        });

        VideoAdManager.trackImpression(currentVideo).catch(() => {});
        interstitial.show();
    });
  },

  trackImpression: async (video: any) => {
    if(!video || Platform.OS === 'web') return;
    try {
      await api.ads.trackImpression({ 
        video_id: video.id,
        creator_id: video.user?.id || video.user_id,
        ad_network: 'admob',
        revenue: 0.001 
      });
    } catch (error) {}
  }
};
