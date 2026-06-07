package com.squeezefeed.app;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Log.d("SQUEEZE_TEST", "MainActivity executed");

        WebView webView = this.bridge.getWebView();
        WebSettings settings = webView.getSettings();

        settings.setMixedContentMode(
                WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        );

        Log.d("SQUEEZE_TEST", "Mixed content enabled");
    }
}