# ============================================================
# Logic — ProGuard rules
# ============================================================

# クラッシュレポートのためスタックトレースを読める状態に保つ
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ============================================================
# アノテーション全般（Capacitor プラグイン名解決に必須）
# ============================================================
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions

# ============================================================
# Capacitor / Cordova bridge
# ============================================================
-keep class com.getcapacitor.** { *; }
-keep class org.apache.cordova.** { *; }
-dontwarn com.getcapacitor.**
-dontwarn org.apache.cordova.**

# @CapacitorPlugin アノテーションが付いたクラスを完全保持
# （ProGuard がアノテーションを除去するとプラグイン名が解決できなくなる）
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }

# アプリ固有プラグイン
-keep class com.logicalthinking.app.** { *; }

# ============================================================
# WebView — JavaScript インターフェース & XML layout inflation
# ============================================================
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface

# CapacitorWebView は XML layout (capacitor_bridge_layout_main.xml) で参照される
# カスタム View クラス。ProGuard が難読化・削除すると inflate 時にクラスが見つからず
# BridgeActivity.onCreate が no_webview layout に fallback → WebView/JS が動かなくなる。
# コンストラクタを明示的に保持してクラスローダーが解決できるようにする。
-keep class com.getcapacitor.CapacitorWebView { *; }
-keep public class * extends android.webkit.WebView { *; }
-keepclassmembers class * extends android.webkit.WebView {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
}

# ============================================================
# Google Play Billing
# ============================================================
-keep class com.android.billingclient.** { *; }
-dontwarn com.android.billingclient.**

# ============================================================
# Google APIs / Auth
# ============================================================
-keep class com.google.** { *; }
-dontwarn com.google.**

# ============================================================
# Kotlin
# ============================================================
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# Kotlin serialization
-keepclassmembers class ** {
    @kotlinx.serialization.SerialName <fields>;
}

# ============================================================
# Kotlin Coroutines（billing-ktx が依存。これがないと即クラッシュ）
# ============================================================
# MainDispatcherFactory: Dispatchers.Main の解決に必須。
# ProGuard がこのクラスを削除すると ServiceLoader で見つけられず
# IllegalStateException → アプリが起動直後にクラッシュする。
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepnames class kotlinx.coroutines.android.AndroidExceptionPreHandler {}
-keepnames class kotlinx.coroutines.android.AndroidDispatcherFactory {}

# atomicfu（coroutines 内部の atomic 変数最適化）。volatile フィールドを保持しないと
# ConcurrentModificationException 等の不定クラッシュが起きる。
-keepclassmembernames class kotlinx.** {
    volatile <fields>;
}
-keepclassmembers class kotlin.coroutines.** { *; }

# ServiceLoader で読み込まれる coroutines のファクトリクラス
-keep class kotlinx.coroutines.internal.MainDispatcherFactory { *; }
-keep class kotlinx.coroutines.android.AndroidDispatcherFactory { *; }

# ============================================================
# Android エントリーポイント — Manifest 参照クラスを明示保持
# shrinkResources / R8 が Manifest の相対パス参照(.MainActivity 等)を
# EntryPoint として正しく解決できない問題を防ぐ
# ============================================================
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# ============================================================
# AndroidX / Support Library
# ============================================================
-keep class androidx.** { *; }
-dontwarn androidx.**

# ============================================================
# JSON / Reflection が必要なクラスを保護
# ============================================================
-keepclassmembers class * {
    public <init>(android.content.Context);
}
