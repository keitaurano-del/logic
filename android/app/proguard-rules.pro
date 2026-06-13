# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# =====================================================================
# LR-6: R8/ProGuard keep ルール（安全側に広めに）
# minifyEnabled true / shrinkResources true 有効化に伴い、reflection や
# JNI / WebView 連携で参照されるクラスがストリップ・難読化されないよう保護する。
# =====================================================================

# ---- スタックトレースを Play Console で読めるよう行番号情報を保持 ----
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature,InnerClasses,EnclosingMethod,Exceptions

# ---- Google Play Billing（課金: ClassNotFound を避けるため全保持）----
-keep class com.android.billingclient.** { *; }
-keep interface com.android.billingclient.** { *; }
-dontwarn com.android.billingclient.**

# ---- Capacitor 本体 / Cordova ブリッジ ----
# @PluginMethod / @JavascriptInterface 等は reflection / JS bridge から呼ばれるため保持。
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep class org.apache.cordova.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public <methods>;
}
# JS から WebView 経由で呼ばれる JavascriptInterface を保持。
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ---- Capacitor / Cordova プラグイン（package.json の依存）----
# LocalNotifications / TextToSpeech / App / Dialog / Haptics / Keyboard /
# Share / SplashScreen / StatusBar / ActionSheet / Health 等。
-keep class com.capacitorjs.** { *; }
-keep class ee.forgr.** { *; }
-keep class com.getcapacitor.community.** { *; }
-keep class com.capgo.** { *; }

# ---- 認証 / Supabase（WebView JS 側で完結するが、念のため keep 名を残す）----
# 認証ロジックは JS 層 (@supabase/supabase-js) で動作し native クラスは持たないが、
# 将来 native 認証プラグインを足した場合の事故防止としてアプリ自身のモデルは保持。
-keep class com.logicalthinking.app.** { *; }

# ---- AndroidX / Kotlin メタデータ ----
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keep class androidx.core.** { *; }

# ---- enum の values()/valueOf() は reflection で参照されることがある ----
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ---- Parcelable CREATOR を保持 ----
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}
