package com.logicalthinking.app.billing

import android.util.Log
import com.android.billingclient.api.*
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
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

    override fun handleOnDestroy() {
        scope.cancel()
        try {
            billingClient?.endConnection()
        } catch (e: Exception) {
            Log.w(TAG, "endConnection on destroy failed", e)
        }
        billingClient = null
        super.handleOnDestroy()
    }

    @PluginMethod
    fun initialize(call: PluginCall) {
        val context = context ?: run { call.reject("Context not available"); return }

        val existing = billingClient
        if (existing != null) {
            if (existing.isReady) {
                call.resolve(JSObject().apply { put("success", true) })
                return
            }
            // 接続中または切断中のクライアントは破棄してから再生成する
            try { existing.endConnection() } catch (_: Exception) {}
        }

        billingClient = BillingClient.newBuilder(context)
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
            )
            .enableAutoServiceReconnection()
            .build()

        startBillingConnection(call)
    }

    /**
     * BillingClient への接続を開始する。
     * - 初回 initialize() からは `initialCall` を渡し、成功/失敗を JS 側に解決する
     * - 以後の切断は Billing Library の自動再接続に任せる
     */
    private fun startBillingConnection(initialCall: PluginCall?) {
        val client = billingClient ?: run {
            initialCall?.reject("Billing client not initialized")
            return
        }
        client.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                val ok = result.responseCode == BillingClient.BillingResponseCode.OK
                Log.d(TAG, "Setup finished: ${result.responseCode}")
                initialCall?.resolve(JSObject().apply { put("success", ok) })
            }

            override fun onBillingServiceDisconnected() {
                Log.w(TAG, "Service disconnected; Billing Library will reconnect on the next API call")
            }
        })
    }

    @PluginMethod
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

        val client = billingClient ?: run {
            call.reject("Billing client not initialized")
            return
        }

        client.queryProductDetailsAsync(params) { result, productDetailsResult ->
            if (result.responseCode != BillingClient.BillingResponseCode.OK) {
                Log.w(TAG, "queryProductDetails failed: ${result.responseCode}")
                call.resolve(JSObject().apply { put("products", JSArray()) })
                return@queryProductDetailsAsync
            }

            val products = JSArray()
            productDetailsResult.productDetailsList.forEach { pd ->
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

    @PluginMethod
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

        val billingClientSnapshot = billingClient ?: run {
            pendingPurchaseCall = null
            call.reject("Billing client not initialized")
            return
        }

        val result = billingClientSnapshot.launchBillingFlow(activity, params)
        if (result.responseCode != BillingClient.BillingResponseCode.OK) {
            pendingPurchaseCall = null
            call.reject("Failed to launch billing flow: ${result.responseCode}")
        }
        // 購入結果は onPurchasesUpdated で処理される
    }

    @PluginMethod
    fun restorePurchases(call: PluginCall) {
        scope.launch { queryPurchases(BillingClient.ProductType.SUBS, call) }
    }

    @PluginMethod
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

        if (purchase.purchaseState != Purchase.PurchaseState.PURCHASED) {
            pending.reject("購入が完了していません (state=${purchase.purchaseState})")
            return
        }

        // acknowledgePurchase: Google Play は 3 日以内に acknowledge しないと自動返金するため必須
        // acknowledge 完了を待ってから JS に結果を返す（fire-and-forget 解消）
        scope.launch {
            if (!purchase.isAcknowledged) {
                val ackOk = acknowledgeWithRetry(purchase.purchaseToken)
                if (!ackOk) {
                    Log.e(TAG, "acknowledgePurchase failed after retries: token=${purchase.purchaseToken}")
                    // acknowledge 失敗でも購入自体は成功しているため JS には成功を返すが警告ログを残す
                }
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
    }

    // ── Private ───────────────────────────────────────────────────

    private suspend fun queryPurchases(productType: String, call: PluginCall) {
        val client = billingClient ?: run { call.reject("Billing client not initialized"); return }

        try {
            val (_, purchasesList) = suspendCancellableCoroutine { cont ->
                client.queryPurchasesAsync(
                    QueryPurchasesParams.newBuilder().setProductType(productType).build()
                ) { billingResult, purchases ->
                    if (cont.isActive) cont.resumeWith(Result.success(Pair(billingResult, purchases)))
                }
            }

            val purchases = JSArray()
            val purchasedList: List<Purchase> = purchasesList
                .filter { purchase: Purchase -> purchase.purchaseState == Purchase.PurchaseState.PURCHASED }
            for (p in purchasedList) {
                    // restorePurchases で取得した未 acknowledge 購入を補填 acknowledge する
                    if (!p.isAcknowledged) {
                        val ackOk = acknowledgeWithRetry(p.purchaseToken)
                        if (!ackOk) {
                            Log.e(TAG, "acknowledge failed in queryPurchases for token=${p.purchaseToken}")
                        }
                    }
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

    /**
     * acknowledgePurchase をリトライ付きで実行する。
     * 失敗した場合は 500ms 待機して最大 [maxAttempts] 回まで再試行する。
     * @return 最終的に成功したか否か
     */
    private suspend fun acknowledgeWithRetry(
        purchaseToken: String,
        maxAttempts: Int = 3
    ): Boolean {
        val ackParams = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchaseToken)
            .build()

        repeat(maxAttempts) { attempt ->
            val client = billingClient
            if (client == null) {
                Log.w(TAG, "acknowledgeWithRetry: BillingClient is null, abort (attempt=${attempt + 1})")
                return false
            }

            val resultCode = suspendCancellableCoroutine<Int> { cont ->
                client.acknowledgePurchase(ackParams) { ackResult ->
                    if (cont.isActive) cont.resumeWith(Result.success(ackResult.responseCode))
                }
            }

            if (resultCode == BillingClient.BillingResponseCode.OK) {
                Log.d(TAG, "acknowledgePurchase succeeded (attempt=${attempt + 1}): token=$purchaseToken")
                return true
            }

            Log.w(TAG, "acknowledgePurchase failed (attempt=${attempt + 1}/$maxAttempts): responseCode=$resultCode, token=$purchaseToken")
            if (attempt < maxAttempts - 1) {
                delay(500L)
            }
        }

        Log.e(TAG, "acknowledgePurchase failed after $maxAttempts attempts: token=$purchaseToken")
        return false
    }
}

inline fun <reified T> JSArray.toList(): List<T> {
    val list = mutableListOf<T>()
    for (i in 0 until length()) {
        try { list.add(get(i) as T) } catch (_: Exception) {}
    }
    return list
}
