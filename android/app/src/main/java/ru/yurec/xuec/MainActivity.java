package ru.yurec.xuec;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.content.res.Configuration;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler;

public class MainActivity extends Activity {
    private static final int BG = Color.parseColor("#0B0B0C");
    private static final String ASSET_HOST = "appassets.androidplatform.net";
    private static final String HOME = "https://" + ASSET_HOST + "/assets/www/index.html";

    private WebView webView;
    private TextView status;
    private FrameLayout root;
    private WebViewAssetLoader assetLoader;
    private YurecOffline offline;
    private View customView;
    private WebChromeClient.CustomViewCallback customCallback;
    private boolean backBusy;
    private ValueCallback<Uri[]> filePathCallback;
    private static final int FILE_CHOOSE = 4201;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= 21) {
            getWindow().setStatusBarColor(BG);
            getWindow().setNavigationBarColor(BG);
        }

        root = new FrameLayout(this);
        root.setBackgroundColor(BG);

        webView = new WebView(this);
        webView.setBackgroundColor(BG);
        webView.setLayoutParams(new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        root.addView(webView);

        status = new TextView(this);
        status.setText("Открываю сборник…");
        status.setTextColor(Color.parseColor("#ECEAE4"));
        status.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        status.setTypeface(Typeface.SANS_SERIF);
        status.setGravity(Gravity.CENTER);
        status.setBackgroundColor(BG);
        status.setLayoutParams(new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        root.addView(status);

        setContentView(root);

        assetLoader = new WebViewAssetLoader.Builder()
                .setDomain(ASSET_HOST)
                .addPathHandler("/assets/", new AssetsPathHandler(this))
                .build();

        offline = new YurecOffline(this, webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setLoadsImagesAutomatically(true);
        settings.setBlockNetworkImage(false);
        if (Build.VERSION.SDK_INT >= 21) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        if (Build.VERSION.SDK_INT >= 33) {
            settings.setAlgorithmicDarkeningAllowed(false);
        }
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.addJavascriptInterface(offline, "YurecNative");
        webView.addOnLayoutChangeListener(new View.OnLayoutChangeListener() {
            @Override
            public void onLayoutChange(View v, int l, int t, int r, int b,
                                       int ol, int ot, int or, int ob) {
                if (r - l != or - ol) pushScreen();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                    filePathCallback = null;
                }
                filePathCallback = callback;
                Intent intent;
                try {
                    intent = params != null ? params.createIntent() : null;
                } catch (Exception e) {
                    intent = null;
                }
                if (intent == null) {
                    intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("*/*");
                }
                try {
                    startActivityForResult(intent, FILE_CHOOSE);
                } catch (Exception e) {
                    filePathCallback = null;
                    if (callback != null) callback.onReceiveValue(null);
                    return false;
                }
                return true;
            }

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) {
                    callback.onCustomViewHidden();
                    return;
                }
                customView = view;
                customCallback = callback;
                root.addView(view, new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT));
                webView.setVisibility(View.GONE);
            }

            @Override
            public void onHideCustomView() {
                hideCustom();
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                WebResourceResponse off = offline.serve(uri, request);
                if (off != null) return off;
                if (uri != null && ASSET_HOST.equals(uri.getHost())) {
                    return assetLoader.shouldInterceptRequest(uri);
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            @SuppressWarnings("deprecation")
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                Uri uri = Uri.parse(url);
                WebResourceResponse off = offline.serve(uri, null);
                if (off != null) return off;
                if (uri != null && ASSET_HOST.equals(uri.getHost())) {
                    return assetLoader.shouldInterceptRequest(uri);
                }
                return super.shouldInterceptRequest(view, url);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUrl(request.getUrl());
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(Uri.parse(url));
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                status.setVisibility(View.GONE);
                pushScreen();
            }

            @Override
            @SuppressWarnings("deprecation")
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                showError("Не удалось открыть страницу: " + description);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    CharSequence desc = error.getDescription();
                    showError("Не удалось открыть страницу: " + (desc == null ? "ошибка" : desc.toString()));
                }
            }
        });

        webView.loadUrl(bootHash(getIntent()));
    }

    private String bootHash(Intent intent) {
        if (wantsOpen(intent, "chat", "ru.yurec.xuec.CHAT")) return HOME + "#/chat";
        if (wantsOpen(intent, "citats", "ru.yurec.xuec.CITATS")) return HOME + "#/citats";
        return HOME;
    }

    private boolean wantsOpen(Intent intent, String extra, String action) {
        if (intent == null) return false;
        if (extra.equals(intent.getStringExtra("open"))) return true;
        return action.equals(intent.getAction());
    }

    private boolean wantsChat(Intent intent) {
        return wantsOpen(intent, "chat", "ru.yurec.xuec.CHAT");
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (webView == null) return;
        String js = null;
        if (wantsOpen(intent, "chat", "ru.yurec.xuec.CHAT")) {
            js = "(function(){try{location.hash='#/chat';if(window.paint)window.paint();}catch(e){}})()";
        } else if (wantsOpen(intent, "citats", "ru.yurec.xuec.CITATS")) {
            js = "(function(){try{location.hash='#/citats';if(window.paint)window.paint();}catch(e){}})()";
        }
        if (js != null) webView.evaluateJavascript(js, null);
    }

    private void pushScreen() {
        if (webView == null) return;
        DisplayMetrics dm = getResources().getDisplayMetrics();
        int px = webView.getWidth();
        if (px <= 0) px = dm.widthPixels;
        if (Build.VERSION.SDK_INT >= 30) {
            try {
                android.graphics.Rect bounds = getWindowManager().getCurrentWindowMetrics().getBounds();
                if (bounds.width() > 0) px = Math.max(px, bounds.width());
            } catch (Exception ignored) {
            }
        }
        float density = dm.density <= 0 ? 1f : dm.density;
        int css = Math.round(px / density);
        if (css < 1) css = Math.round(dm.widthPixels / density);
        final String js =
            "(function(){try{"
                + "var w=" + css + ";"
                + "window.YurecScreen={w:w};"
                + "document.documentElement.setAttribute('data-wide', w>=560?'1':'0');"
                + "if(window.YurecLayout)window.YurecLayout(w);"
                + "}catch(e){}})()";
        webView.evaluateJavascript(js, null);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        if (webView == null) return;
        webView.requestLayout();
        webView.post(new Runnable() {
            @Override
            public void run() {
                pushScreen();
            }
        });
    }

    private boolean hideCustom() {
        if (customView == null) return false;
        root.removeView(customView);
        customView = null;
        webView.setVisibility(View.VISIBLE);
        if (customCallback != null) {
            customCallback.onCustomViewHidden();
            customCallback = null;
        }
        return true;
    }

    private boolean handleUrl(Uri uri) {
        if (uri == null) {
            return true;
        }
        String host = uri.getHost();
        String scheme = uri.getScheme();
        if (ASSET_HOST.equals(host)) {
            return false;
        }
        if ("file".equals(scheme)) {
            return false;
        }
        if ("http".equals(scheme) || "https".equals(scheme)) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (Exception ignored) {
            }
            return true;
        }
        if ("tel".equals(scheme)) {
            try {
                startActivity(new Intent(Intent.ACTION_DIAL, uri));
            } catch (Exception ignored) {
            }
            return true;
        }
        if ("mailto".equals(scheme) || "sms".equals(scheme)
                || "smsto".equals(scheme) || "tg".equals(scheme)) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (Exception ignored) {
            }
            return true;
        }
        return true;
    }

    @Override
    @SuppressWarnings("deprecation")
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSE) {
            Uri[] uris = null;
            if (resultCode == RESULT_OK) {
                try {
                    uris = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                } catch (Exception ignored) {
                    if (data != null && data.getData() != null) {
                        uris = new Uri[]{ data.getData() };
                    }
                }
            }
            if (filePathCallback != null) {
                filePathCallback.onReceiveValue(uris);
                filePathCallback = null;
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    private void showError(final String message) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                status.setText(message);
                status.setVisibility(View.VISIBLE);
            }
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (hideCustom()) return;
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        if (backBusy) return;
        backBusy = true;
        webView.evaluateJavascript(
            "(function(){try{return window.yurecBack&&window.yurecBack()===true;}catch(e){return false;}})()",
            new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String value) {
                    backBusy = false;
                    if ("true".equals(value) || "\"true\"".equals(value)) return;
                    MainActivity.super.onBackPressed();
                }
            }
        );
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.evaluateJavascript(
                "(function(){try{if(window.yurecPause)window.yurecPause();}catch(e){}})()",
                null);
            webView.onPause();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
        if (offline != null) offline.flushBackup();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == YurecOffline.REQ_STORAGE && offline != null) {
            offline.flushBackup();
        }
    }

    @Override
    protected void onDestroy() {
        if (offline != null) offline.shutdown();
        if (filePathCallback != null) {
            filePathCallback.onReceiveValue(null);
            filePathCallback = null;
        }
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
