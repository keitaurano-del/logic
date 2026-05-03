package io.logic.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import io.logic.app.billing.InAppBillingPlugin

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(InAppBillingPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
