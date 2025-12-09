import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import api from '../api/axiosConfig';
import { Loader2, Gift, AlertCircle, Play, Check, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Official Google IMA Test Tags (Mixed Formats)
const AD_TAGS = [
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirectlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonly&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=',
];

const AdWatchModal = ({ isOpen, onClose, targetPlan }) => {
  const { user, login } = useAuth();

  const [progress, setProgress] = useState(0);
  const [totalNeeded, setTotalNeeded] = useState(20);
  const [adStatus, setAdStatus] = useState('idle'); // idle, loading, playing, verifying, error
  const [success, setSuccess] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentTagLabel, setCurrentTagLabel] = useState('');

  // Refs
  const adContainerRef = useRef(null);
  const videoContentRef = useRef(null);
  const adsLoaderRef = useRef(null);
  const adsManagerRef = useRef(null);
  const displayContainerRef = useRef(null);

  // 1. Initialize
  useEffect(() => {
    if (!window.google || !window.google.ima) {
      const script = document.createElement('script');
      script.src = '//imasdk.googleapis.com/js/sdkloader/ima3.js';
      script.async = true;
      script.onload = () => setSdkLoaded(true);
      document.body.appendChild(script);
    } else {
      setSdkLoaded(true);
    }

    const needed = targetPlan === 'premium' ? 50 : 20;
    setTotalNeeded(needed);

    if (isOpen) {
      if (user?.subscription?.targetUpgradePlan?.toLowerCase() === targetPlan.toLowerCase()) {
        setProgress(user.subscription.adWatchProgress || 0);
      } else {
        setProgress(0);
      }
    }

    return () => cleanupAds();
  }, [targetPlan, isOpen]);

  const cleanupAds = () => {
    try {
      if (adsManagerRef.current) {
        adsManagerRef.current.destroy();
        adsManagerRef.current = null;
      }
      if (adsLoaderRef.current) {
        adsLoaderRef.current.contentComplete();
        adsLoaderRef.current = null;
      }
      if (displayContainerRef.current) {
        displayContainerRef.current.destroy();
        displayContainerRef.current = null;
      }
    } catch (e) { console.warn(e); }
  };

  // 2. Play Ad Logic
  const requestAds = (retry = false) => {
    if (!sdkLoaded || !window.google) return;
    setErrorMsg('');
    cleanupAds();

    setAdStatus('loading');
    const google = window.google;

    try {
      displayContainerRef.current = new google.ima.AdDisplayContainer(
        adContainerRef.current,
        videoContentRef.current
      );

      displayContainerRef.current.initialize();

      adsLoaderRef.current = new google.ima.AdsLoader(displayContainerRef.current);

      adsLoaderRef.current.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        (e) => onAdsManagerLoaded(e),
        false
      );

      adsLoaderRef.current.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        (e) => onAdError(e, retry),
        false
      );

      const randomTag = AD_TAGS[Math.floor(Math.random() * AD_TAGS.length)];
      setCurrentTagLabel(randomTag.includes('skippable') ? 'Skippable Ad' : 'Standard Ad');

      const timestamp = new Date().getTime();
      const adsRequest = new google.ima.AdsRequest();
      adsRequest.adTagUrl = randomTag + timestamp;

      adsRequest.linearAdSlotWidth = 640;
      adsRequest.linearAdSlotHeight = 360;
      adsRequest.nonLinearAdSlotWidth = 640;
      adsRequest.nonLinearAdSlotHeight = 150;

      adsLoaderRef.current.requestAds(adsRequest);
    } catch (e) {
      console.error("Setup Error:", e);
      setAdStatus('error');
      setErrorMsg('Player failed to initialize.');
    }
  };

  const onAdsManagerLoaded = (adsManagerLoadedEvent) => {
    const google = window.google;
    const adsRenderingSettings = new google.ima.AdsRenderingSettings();

    adsManagerRef.current = adsManagerLoadedEvent.getAdsManager(videoContentRef.current, adsRenderingSettings);

    adsManagerRef.current.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, (e) => onAdError(e, false));
    adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.COMPLETE, onAdComplete);
    adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdComplete);
    adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.SKIPPED, onAdComplete);
    adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.STARTED, () => setAdStatus('playing'));

    try {
      adsManagerRef.current.setVolume(0);
      adsManagerRef.current.init(640, 360, google.ima.ViewMode.NORMAL);
      adsManagerRef.current.start();
    } catch (adError) {
      onAdError(adError, false);
    }
  };

  const onAdError = (event, isRetry) => {
    const error = event.getError ? event.getError() : event;
    console.warn("Ad Error:", error);

    if (!isRetry) {
      requestAds(true); // Retry once
    } else {
      setAdStatus('error');
      const code = error.getErrorCode ? error.getErrorCode() : 0;
      if (code === 1009 || code === 400 || !code) {
        setErrorMsg('Ad blocked. Please disable AdBlock.');
      } else {
        setErrorMsg('Ad failed to load. Please try again.');
      }
      cleanupAds();
    }
  };

  const onAdComplete = async () => {
    if (adStatus === 'verifying') return;
    setAdStatus('verifying');
    cleanupAds();

    try {
      const res = await api.post('/user/subscription/watch-ad', { targetPlan });

      setProgress(res.data.progress);
      login({ ...user, subscription: res.data.subscription });

      if (res.data.upgraded) {
        setSuccess(true);
      } else {
        setTimeout(() => setAdStatus('idle'), 500);
      }
    } catch (err) {
      console.error(err);
      setAdStatus('error');
      setErrorMsg('Failed to save progress.');
    }
  };

  const handleClose = () => {
    if (adStatus === 'playing' || adStatus === 'verifying') return;
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Unlock ${targetPlan} Plan`}>
      {success ? (
        <div className="text-center py-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100"
          >
            <Gift size={40} className="text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Upgrade Complete!</h2>
          <p className="text-slate-500 mb-6">You have successfully unlocked the {targetPlan} plan.</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Start Using Features
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 mb-2">
              Watch {totalNeeded} video ads to upgrade for free
            </p>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progress / totalNeeded) * 100}%` }}
                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600 z-10">
                 {((progress / totalNeeded) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="flex justify-between items-end mt-4 px-4">
              <span className="text-3xl font-bold text-slate-800">
                {progress}
              </span>
              <span className="text-slate-400 font-medium mb-1">
                Target: {totalNeeded}
              </span>
            </div>
          </div>

          {/* --- VIDEO CONTAINER (LIGHT THEME) --- */}
          <div className="relative aspect-video bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
            <video ref={videoContentRef} className="w-full h-full" />
            <div ref={adContainerRef} className="absolute inset-0 w-full h-full" />

            {/* Overlays */}
            {adStatus !== 'playing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-[2px] z-20 transition-all duration-300">

                {/* IDLE STATE */}
                {adStatus === 'idle' && (
                  <button
                    onClick={() => requestAds(false)}
                    disabled={!sdkLoaded}
                    className="flex flex-col items-center justify-center space-y-3 group/btn"
                  >
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center shadow-sm border border-blue-100 group-hover/btn:scale-110 transition-transform duration-300">
                      <Play size={36} className="text-blue-600 ml-1 fill-blue-600" />
                    </div>
                    <span className="text-blue-700 font-bold text-sm bg-blue-50 px-5 py-2 rounded-full border border-blue-100 group-hover/btn:bg-blue-100 transition-colors">
                      {progress === 0 ? "Start Watching" : "Watch Next Ad"}
                    </span>
                  </button>
                )}

                {/* LOADING STATE */}
                {adStatus === 'loading' && (
                  <div className="text-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-3 inline-block">
                      <Loader2 className="text-blue-600 animate-spin" size={32} />
                    </div>
                    <p className="text-slate-600 text-sm font-medium">Connecting to ad server...</p>
                  </div>
                )}

                {/* VERIFYING STATE */}
                {adStatus === 'verifying' && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                      <Check className="text-green-600" size={32} />
                    </div>
                    <p className="text-slate-700 text-sm font-bold">Ad Verified!</p>
                    <p className="text-slate-500 text-xs">Saving your progress...</p>
                  </div>
                )}

                {/* ERROR STATE */}
                {adStatus === 'error' && (
                  <div className="text-center px-6 py-4 bg-red-50 rounded-xl border border-red-100 mx-4">
                     <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
                     <p className="text-red-800 text-sm mb-1 font-bold">Unable to Play Ad</p>
                     <p className="text-red-600/80 text-xs mb-4 max-w-[200px] mx-auto leading-relaxed">
                       {errorMsg || "Please disable ad blockers and try again."}
                     </p>
                     <button
                        onClick={() => setAdStatus('idle')}
                        className="text-xs bg-white text-red-700 px-4 py-2 rounded-lg font-bold border border-red-100 hover:bg-red-50 transition-colors"
                     >
                       Try Again
                     </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="text-center h-6 flex items-center justify-center">
            {adStatus === 'playing' ? (
               <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                 <Tag size={12} className="text-blue-600" />
                 <p className="text-xs text-blue-700 font-medium animate-pulse">
                   Playing Ad...
                 </p>
               </div>
            ) : (
               <p className="text-[11px] text-slate-400">
                 Powered by Google Ad Manager.
               </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AdWatchModal;
