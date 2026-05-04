package io.logic.app

import android.os.Bundle
import androidx.core.view.WindowCompat
import com.getcapacitor.BridgeActivity
import io.logic.app.billing.InAppBillingPlugin

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(InAppBillingPlugin::class.java)
        super.onCreate(savedInstanceState)
        // Edge-to-Edge: required on API 35+, harmless on older versions.
        // Status/navigation bar insets are handled in CSS via env(safe-area-inset-*).
        WindowCompat.setDecorFitsSystemWindows(window, false)
    }
}
