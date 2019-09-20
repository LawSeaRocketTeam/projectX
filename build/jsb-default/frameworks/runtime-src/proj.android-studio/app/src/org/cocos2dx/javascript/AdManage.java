package org.cocos2dx.javascript;

import android.content.Context;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.Toast;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.reward.RewardItem;
import com.google.android.gms.ads.reward.RewardedVideoAd;
import com.google.android.gms.ads.reward.RewardedVideoAdListener;

import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

public class AdManage  implements RewardedVideoAdListener  {
    private static final String AD_BANNER_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";//横幅广告ID
    private static final String AD_VIDEO_ID = "ca-app-pub-3940256099942544/5224354917";//激励视频广告ID
    private static final String APP_ID = "ca-app-pub-3940256099942544~3347511713";//应用ID

    private Context mainActive = null;
    private static AdManage mInstace = null;

    private AdView mAdView;
    private LinearLayout bannerLayout;

    private RewardedVideoAd rewardedVideoAd;

    private static boolean isVideoRewarded = false;
    private static boolean isVideoClose = false;

    public static AdManage getInstance() {
        if (null == mInstace) {
            mInstace = new AdManage();
        }
        return mInstace;
    }

    public void init(Context context) {
        this.mainActive = context;

        //初始化广告 SDK.
        MobileAds.initialize(context, APP_ID);

        //预加载激励视频广告
        rewardedVideoAd = MobileAds.getRewardedVideoAdInstance(context);
        rewardedVideoAd.setRewardedVideoAdListener(this);
        //loadRewardedVideoAd(AD_VIDEO_ID);

        //预加载banner广告
        //loadBannerAd();
    }

    /*
       加载google banner广告
     */
    public void loadBannerAd() {
        bannerLayout = new LinearLayout(this.mainActive);
        bannerLayout.setOrientation(LinearLayout.VERTICAL);

        // Create a banner ad. The ad size and ad unit ID must be set before calling loadAd.
        mAdView = new AdView(this.mainActive);
        mAdView.setAdSize(AdSize.SMART_BANNER);
        mAdView.setAdUnitId(AD_BANNER_UNIT_ID);

        // Create an ad request.
        AdRequest.Builder adRequestBuilder = new AdRequest.Builder();

        // Optionally populate the ad request builder.
        adRequestBuilder.addTestDevice(AdRequest.DEVICE_ID_EMULATOR);

        // Add the AdView to the view hierarchy.
        bannerLayout.addView(mAdView);

        // Start loading the ad.
        mAdView.loadAd(adRequestBuilder.build());

        AppActivity activity = (AppActivity)this.mainActive;
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.WRAP_CONTENT);
        params.gravity=Gravity.BOTTOM;
        activity.addContentView(bannerLayout,params);
        bannerLayout.setVisibility(View.INVISIBLE);

    }

    /*
       显示google banner广告
     */
    public static void showBannerAd(){
        AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        //一定要确保在UI线程操作
        mActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AdManage.getInstance().bannerLayout.setVisibility(View.VISIBLE);
            }
        });
    }

    /*
       隐藏google banner广告
     */
    public static void hideBannerAd(){
        AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        //一定要确保在UI线程操作
        mActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AdManage.getInstance().bannerLayout.setVisibility(View.INVISIBLE);
            }
        });
    }
    /*
        预加载google视频广告
         */
    public static void loadRewardedVideoAd(final String _id) {
        //一定要确保在UI线程操作
        final AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        mActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
            if (!AdManage.getInstance().rewardedVideoAd.isLoaded()) {
                Toast.makeText(AdManage.getInstance().mainActive, "loadRewardedVideoAd", Toast.LENGTH_SHORT).show();
                AdManage.getInstance().rewardedVideoAd.loadAd(_id, new AdRequest.Builder().build());
            }
            }
        });
    }

    /*
    显示视频广告
     */
    public static void showRewardedVideo() {
        AdManage.getInstance().isVideoRewarded = false;
        AdManage.getInstance().isVideoClose = false;

        final AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        //一定要确保在UI线程操作
        mActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (AdManage.getInstance().rewardedVideoAd.isLoaded()) {
                    Toast.makeText(mActivity, "rewardedVideoAd.show()", Toast.LENGTH_SHORT).show();
                    AdManage.getInstance().rewardedVideoAd.show();
                }
                else{
                    Toast.makeText(mActivity, "not rewardedVideoAd.isLoaded()", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    @Override
    public void onRewardedVideoAdLeftApplication() {
        Toast.makeText(this.mainActive, "onRewardedVideoAdLeftApplication", Toast.LENGTH_SHORT).show();
        final AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        mActivity.runOnGLThread(new Runnable() {
            @Override
            public void run(){
                Cocos2dxJavascriptJavaBridge.evalString("cc.vv.adMgr.onRewardedVideoAdLeftApplication()");
            }
        });
    }

    @Override
    public void onRewardedVideoAdClosed() {
        AdManage.getInstance().isVideoClose = true;
        //预加载下一个视频广告
        //loadRewardedVideoAd();
        final AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        mActivity.runOnGLThread(new Runnable() {
            @Override
            public void run(){
                Cocos2dxJavascriptJavaBridge.evalString("cc.vv.adMgr.onRewardedVideoAdClosed()");
            }
        });
    }

    @Override
    public void onRewardedVideoAdFailedToLoad(int errorCode) {
        Toast.makeText(mainActive, "onRewardedVideoAdFailedToLoad errCode = " + errorCode, Toast.LENGTH_SHORT).show();
        final AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        final int code = errorCode;
        mActivity.runOnGLThread(new Runnable() {
            @Override
            public void run(){
                Cocos2dxJavascriptJavaBridge.evalString("cc.vv.adMgr.onRewardedVideoAdFailedToLoad('"+ code +"')");
            }
        });
    }

    @Override
    public void onRewardedVideoAdLoaded() {
        Toast.makeText(mainActive, "onRewardedVideoAdLoaded", Toast.LENGTH_SHORT).show();
        final AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        mActivity.runOnGLThread(new Runnable() {
            @Override
            public void run(){
                Cocos2dxJavascriptJavaBridge.evalString("cc.vv.adMgr.onRewardedVideoAdLoaded()");
            }
        });
    }

    @Override
    public void onRewardedVideoAdOpened() {
        Toast.makeText(mainActive, "onRewardedVideoAdOpened", Toast.LENGTH_SHORT).show();
        final AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        mActivity.runOnGLThread(new Runnable() {
            @Override
            public void run(){
                Cocos2dxJavascriptJavaBridge.evalString("cc.vv.adMgr.onRewardedVideoAdOpened()");
            }
        });
    }

    @Override
    public void onRewarded(RewardItem reward) {
        AdManage.getInstance().isVideoRewarded = true;
        final AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        mActivity.runOnGLThread(new Runnable() {
            @Override
            public void run(){
                Cocos2dxJavascriptJavaBridge.evalString("cc.vv.adMgr.onRewarded()");
            }
        });
    }

    @Override
    public void onRewardedVideoStarted() {
        Toast.makeText(mainActive, "onRewardedVideoStarted", Toast.LENGTH_SHORT).show();
        final AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        mActivity.runOnGLThread(new Runnable() {
            @Override
            public void run(){
                Cocos2dxJavascriptJavaBridge.evalString("cc.vv.adMgr.onRewardedVideoStarted()");
            }
        });
    }

    @Override
    public void onRewardedVideoCompleted() {
        Toast.makeText(mainActive, "onRewardedVideoCompleted", Toast.LENGTH_SHORT).show();
        final AppActivity mActivity = (AppActivity)AdManage.getInstance().mainActive;
        mActivity.runOnGLThread(new Runnable() {
            @Override
            public void run(){
                Cocos2dxJavascriptJavaBridge.evalString("cc.vv.adMgr.onRewardedVideoCompleted()");
            }
        });
    }

    //用于cocos监听视频广告播放完成
    public static boolean videoRewardedListener(){
        return AdManage.getInstance().isVideoRewarded;
    }

    //用于cocos监听视频广告播放关闭
    public static boolean videoCloseListener(){
        return AdManage.getInstance().isVideoClose;
    }

    public void onResume() {
        //mAdView.resume();
        rewardedVideoAd.resume(this.mainActive);
    }

    public void onPause() {
        //mAdView.pause();
        rewardedVideoAd.pause(this.mainActive);
    }

    public void onDestroy() {
        //mAdView.destroy();
        rewardedVideoAd.destroy(this.mainActive);
    }

}

