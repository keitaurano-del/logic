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
# WebView — JavaScript インターフェース
# ============================================================
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface

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
