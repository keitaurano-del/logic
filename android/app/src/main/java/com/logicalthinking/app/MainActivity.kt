package com.logicalthinking.app

import android.os.Bundle
import androidx.core.view.WindowCompat
import com.getcapacitor.BridgeActivity
// 診断用: billing プラグインを一時無効化してクラッシュ原因を切り分ける
// import com.logicalthinking.app.billing.InAppBillingPlugin

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // 診断用: billing が原因かを確認するため一時コメントアウト
        // registerPlugin(InAppBillingPlugin::class.java)
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
    }
}
