package io.logic.app.billing

import android.util.Log
import com.android.billingclient.api.*
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.CapacitorPluginMethod
import kotlinx.coroutines.*

@CapacitorPlugin(name = "InAppBillingPlugin")
class InAppBillingPlugin : Plugin(), PurchasesUpdatedListener {

    companion object {
        private const val TAG = "InAppBilling"
    }

    private var billingClient: BillingClient? = null
    private var productDetailsMap: MutableMap<String, ProductDetails> = mutableMapOf()
    private var pendingPurchaseCall: PluginCall? = null
    private val scope = CoroutineScope(Dispatchers.Main + Job())

    override fun load() {
        Log.d(TAG, "Plugin loaded")
    }

    @CapacitorPluginMethod
    fun initialize(call: PluginCall) {
        val context = context ?: run { call.reject("Context not available"); return }

        if (billingClient?.isReady == true) {
            call.resolve(JSObject().apply { put("success", true) })
            return
        }

        billingClient = BillingClient.newBuilder(context)
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
            )
            .build()

        billingClient!!.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                val ok = result.responseCode == BillingClient.BillingResponseCode.OK
                Log.d(TAG, "Setup finished: ${result.responseCode}")
                call.resolve(JSObject().apply { put("success", ok) })
            }

            override fun onBillingServiceDisconnected() {
                Log.w(TAG, "Service disconnected")
            }
        })
    }

    @CapacitorPluginMethod
    fun getProducts(call: PluginCall) {
        val productIds = call.getArray("productIds")?.toList<String>() ?: emptyList()
        if (productIds.isEmpty()) {
            call.resolve(JSObject().apply { put("products", JSArray()) })
            return
        }

        val productList = productIds.map { id ->
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(id)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        }

        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(productList)
            .build()

        billingClient?.queryProductDetailsAsync(params) { result, detailsList ->
            if (result.responseCode != BillingClient.BillingResponseCode.OK) {
                Log.w(TAG, "queryProductDetails failed: ${result.responseCode}")
                call.resolve(JSObject().apply { put("products", JSArray()) })
                return@queryProductDetailsAsync
            }

            val products = JSArray()
            detailsList.forEach { pd ->
                val offer = pd.subscriptionOfferDetails?.firstOrNull() ?: return@forEach
                val phase = offer.pricingPhases.pricingPhaseList.firstOrNull() ?: return@forEach

                productDetailsMap[pd.productId] = pd
                products.put(JSObject().apply {
                    put("productId", pd.productId)
                    put("title", pd.title)
                    put("description", pd.description)
                    put("price", "¥${phase.priceAmountMicros / 1_000_000}")
                    put("priceAmountMicros", phase.priceAmountMicros)
                    put("priceCurrencyCode", phase.priceCurrencyCode)
                })
            }

            call.resolve(JSObject().apply { put("products", products) })
        }
    }

    @CapacitorPluginMethod
    fun purchaseProduct(call: PluginCall) {
        val productId = call.getString("productId") ?: run { call.reject("productId required"); return }
        val activity = activity ?: run { call.reject("Activity not available"); return }

        val productDetails = productDetailsMap[productId] ?: run {
            call.reject("Product not found: $productId. Call getProducts() first.")
            return
        }

        val offer = productDetails.subscriptionOfferDetails?.firstOrNull() ?: run {
            call.reject("No subscription offer found for: $productId")
            return
        }

        pendingPurchaseCall = call

        val params = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(
                BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(productDetails)
                    .setOfferToken(offer.offerToken)
                    .build()
            ))
            .build()

        val result = billingClient?.launchBillingFlow(activity, params)
        if (result?.responseCode != BillingClient.BillingResponseCode.OK) {
            pendingPurchaseCall = null
            call.reject("Failed to launch billing flow: ${result?.responseCode}")
        }
        // 購入結果は onPurchasesUpdated で処理される
    }

    @CapacitorPluginMethod
    fun restorePurchases(call: PluginCall) {
        scope.launch { queryPurchases(BillingClient.ProductType.SUBS, call) }
    }

    @CapacitorPluginMethod
    fun queryPurchaseHistory(call: PluginCall) {
        val type = if (call.getString("productType") == "inapp")
            BillingClient.ProductType.INAPP else BillingClient.ProductType.SUBS
        scope.launch { queryPurchases(type, call) }
    }

    // ── PurchasesUpdatedListener ──────────────────────────────────

    override fun onPurchasesUpdated(result: BillingResult, purchases: MutableList<Purchase>?) {
        val pending = pendingPurchaseCall ?: return
        pendingPurchaseCall = null

        if (result.responseCode != BillingClient.BillingResponseCode.OK) {
            val msg = if (result.responseCode == BillingClient.BillingResponseCode.USER_CANCELED)
                "購入がキャンセルされました" else "購入に失敗しました: ${result.responseCode}"
            pending.reject(msg)
            return
        }

        val purchase = purchases?.firstOrNull() ?: run {
            pending.reject("購入情報が取得できませんでした")
            return
        }

        pending.resolve(JSObject().apply {
            put("success", true)
            put("purchase", JSObject().apply {
                put("purchaseToken", purchase.purchaseToken)
                put("productId", purchase.products.firstOrNull() ?: "")
                put("orderId", purchase.orderId ?: "")
                put("purchaseTime", purchase.purchaseTime)
                put("purchaseState", purchase.purchaseState)
            })
        })
    }

    // ── Private ───────────────────────────────────────────────────

    private suspend fun queryPurchases(productType: String, call: PluginCall) {
        val client = billingClient ?: run { call.reject("Billing client not initialized"); return }

        try {
            val result = client.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder().setProductType(productType).build()
            )

            val purchases = JSArray()
            result.purchasesList
                .filter { it.purchaseState == Purchase.PurchaseState.PURCHASED }
                .forEach { p ->
                    purchases.put(JSObject().apply {
                        put("purchaseToken", p.purchaseToken)
                        put("productId", p.products.firstOrNull() ?: "")
                        put("orderId", p.orderId ?: "")
                        put("purchaseTime", p.purchaseTime)
                        put("purchaseState", p.purchaseState)
                    })
                }

            call.resolve(JSObject().apply { put("purchases", purchases) })
        } catch (e: Exception) {
            Log.e(TAG, "queryPurchases failed", e)
            call.reject("Query failed: ${e.message}")
        }
    }
}

inline fun <reified T> JSArray.toList(): List<T> {
    val list = mutableListOf<T>()
    for (i in 0 until length()) {
        try { list.add(get(i) as T) } catch (_: Exception) {}
    }
    return list
}
