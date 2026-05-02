package io.logic.app.billing

import android.app.Activity
import android.content.Context
import android.util.Log
import com.android.billingclient.api.*
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.*

/**
 * Capacitor plugin for Google Play Billing (SCRUM-116)
 * Handles in-app purchases and subscription management.
 */
@CapacitorPlugin(name = "InAppBillingPlugin")
class InAppBillingPlugin : Plugin(), PurchasesUpdatedListener, BillingClientStateListener {

    companion object {
        private const val TAG = "InAppBilling"
    }

    private var billingClient: BillingClient? = null
    private var productDetailsMap: MutableMap<String, ProductDetails> = mutableMapOf()
    private val scope = CoroutineScope(Dispatchers.Main + Job())

    override fun load() {
        Log.d(TAG, "Plugin loaded")
    }

    /**
     * Initialize the billing client.
     */
    @com.getcapacitor.annotation.CapacitorPluginMethod()
    fun initialize(call: PluginCall) {
        try {
            val context = context ?: run {
                call.reject("Context not available")
                return
            }

            if (billingClient != null) {
                val result = JSObject()
                result.put("success", true)
                call.resolve(result)
                return
            }

            billingClient = BillingClient.newBuilder(context)
                .setListener(this)
                .enablePendingPurchases()
                .build()

            billingClient?.startConnection(object : BillingClientStateListener {
                override fun onBillingSetupFinished(billingResult: BillingResult) {
                    Log.d(TAG, "Billing setup finished: ${billingResult.responseCode}")
                    val result = JSObject()
                    result.put("success", billingResult.responseCode == BillingClient.BillingResponseCode.OK)
                    call.resolve(result)
                }

                override fun onBillingServiceDisconnected() {
                    Log.w(TAG, "Billing service disconnected")
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Initialize failed", e)
            call.reject("Initialization failed: ${e.message}")
        }
    }

    /**
     * Fetch product details from Google Play.
     */
    @com.getcapacitor.annotation.CapacitorPluginMethod()
    fun getProducts(call: PluginCall) {
        val productIds = call.getArray("productIds")?.toList<String>() ?: emptyList()
        if (productIds.isEmpty()) {
            val result = JSObject()
            result.put("products", JSArray())
            call.resolve(result)
            return
        }

        scope.launch {
            try {
                val productList = productIds.map { ProductReference(it, "subs") }
                val queryProductDetailsParams = QueryProductDetailsParams.newBuilder()
                    .setProductList(productList)
                    .build()

                billingClient?.queryProductDetailsAsync(queryProductDetailsParams) { billingResult, productDetailsList ->
                    try {
                        if (billingResult.responseCode != BillingClient.BillingResponseCode.OK) {
                            Log.w(TAG, "queryProductDetails failed: ${billingResult.responseCode}")
                            val result = JSObject()
                            result.put("products", JSArray())
                            call.resolve(result)
                            return@queryProductDetailsAsync
                        }

                        val products = JSArray()
                        productDetailsList?.forEach { productDetails ->
                            val obj = JSObject()
                            obj.put("productId", productDetails.productId)
                            obj.put("title", productDetails.title)
                            obj.put("description", productDetails.description)

                            val subscription = productDetails.subscriptionOfferDetails?.firstOrNull()
                            if (subscription != null) {
                                val pricingPhase = subscription.pricingPhases.pricingPhaseList.firstOrNull()
                                if (pricingPhase != null) {
                                    obj.put("priceAmountMicros", pricingPhase.priceAmountMicros)
                                    obj.put("priceCurrencyCode", pricingPhase.priceCurrencyCode)
                                    obj.put("price", formatPrice(pricingPhase.priceAmountMicros, pricingPhase.priceCurrencyCode))

                                    // Store for later use
                                    productDetailsMap[productDetails.productId] = productDetails
                                }
                            }
                            products.put(obj)
                        }

                        val result = JSObject()
                        result.put("products", products)
                        call.resolve(result)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error processing product details", e)
                        call.reject("Error processing products: ${e.message}")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "getProducts failed", e)
                call.reject("getProducts failed: ${e.message}")
            }
        }
    }

    /**
     * Launch purchase flow.
     */
    @com.getcapacitor.annotation.CapacitorPluginMethod()
    fun purchaseProduct(call: PluginCall) {
        val productId = call.getString("productId") ?: run {
            call.reject("productId is required")
            return
        }

        val activity = activity ?: run {
            call.reject("Activity not available")
            return
        }

        try {
            val productDetails = productDetailsMap[productId]
            if (productDetails == null) {
                call.reject("Product not found: $productId")
                return
            }

            val subscription = productDetails.subscriptionOfferDetails?.firstOrNull()
            if (subscription == null) {
                call.reject("No subscription offer found for: $productId")
                return
            }

            val billingFlowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(
                    listOf(
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(productDetails)
                            .setOfferToken(subscription.offerToken)
                            .build()
                    )
                )
                .build()

            val result = billingClient?.launchBillingFlow(activity, billingFlowParams)
            if (result?.responseCode != BillingClient.BillingResponseCode.OK) {
                call.reject("Launch billing flow failed: ${result?.responseCode}")
            }
            // Result will be handled in onPurchasesUpdated
        } catch (e: Exception) {
            Log.e(TAG, "purchaseProduct failed", e)
            call.reject("Purchase failed: ${e.message}")
        }
    }

    /**
     * Restore previous purchases.
     */
    @com.getcapacitor.annotation.CapacitorPluginMethod()
    fun restorePurchases(call: PluginCall) {
        scope.launch {
            try {
                queryPurchases("subs", call)
            } catch (e: Exception) {
                Log.e(TAG, "restorePurchases failed", e)
                call.reject("Restore failed: ${e.message}")
            }
        }
    }

    /**
     * Query purchase history.
     */
    @com.getcapacitor.annotation.CapacitorPluginMethod()
    fun queryPurchaseHistory(call: PluginCall) {
        val productType = call.getString("productType", "subs")
        scope.launch {
            try {
                queryPurchases(productType, call)
            } catch (e: Exception) {
                Log.e(TAG, "queryPurchaseHistory failed", e)
                call.reject("Query failed: ${e.message}")
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Private Methods
    // ─────────────────────────────────────────────────────────────

    private suspend fun queryPurchases(productType: String, call: PluginCall) {
        val billingClient = billingClient ?: run {
            call.reject("Billing client not initialized")
            return
        }

        try {
            val result = billingClient.queryPurchasesAsync(QueryPurchasesParams.newBuilder()
                .setProductType(productType)
                .build())

            val purchases = JSArray()
            result.purchasesList?.forEach { purchase ->
                if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                    val obj = JSObject()
                    obj.put("purchaseToken", purchase.purchaseToken)
                    obj.put("productId", purchase.products[0])
                    obj.put("orderId", purchase.orderId)
                    obj.put("purchaseTime", purchase.purchaseTime)
                    purchases.put(obj)
                }
            }

            val response = JSObject()
            response.put("purchases", purchases)
            call.resolve(response)
        } catch (e: Exception) {
            Log.e(TAG, "queryPurchases failed", e)
            call.reject("Query failed: ${e.message}")
        }
    }

    private fun formatPrice(priceAmountMicros: Long, currencyCode: String): String {
        return "¥${priceAmountMicros / 1_000_000}"
    }

    // ─────────────────────────────────────────────────────────────
    // Listeners
    // ─────────────────────────────────────────────────────────────

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: MutableList<Purchase>?) {
        Log.d(TAG, "onPurchasesUpdated: ${billingResult.responseCode}")
        // Purchases are typically handled by the TypeScript layer after retrieving via restorePurchases
    }

    override fun onBillingServiceDisconnected() {
        Log.w(TAG, "Billing service disconnected")
    }

    override fun onBillingAvailable() {
        Log.d(TAG, "Billing available")
    }

    override fun onSetupFinished(billingResult: BillingResult) {
        Log.d(TAG, "Setup finished: ${billingResult.responseCode}")
    }

    override fun onBillingSetupFinished(billingResult: BillingResult) {
        Log.d(TAG, "Billing setup finished: ${billingResult.responseCode}")
    }
}

// Extension function to convert JSArray to List
inline fun <reified T> JSArray.toList(): List<T> {
    val list = mutableListOf<T>()
    for (i in 0 until length()) {
        try {
            list.add(get(i) as T)
        } catch (e: Exception) {
            Log.e("JSArray", "Error converting element $i", e)
        }
    }
    return list
}
