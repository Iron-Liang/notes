# 不适合使用 expo 的情况

1.  expo apps 不支持后台运行，无法使用后台地理位置，播放声音，推送消息。
2.  不支持所有的 iOS 或则 Android APIS，比如蓝牙。无法完全支持 WebRTC。
3.  应用的体积无法控制，iOS 大概 33mb，android 大概 20mb。
4.  使用类似 OneSignal 推送服务替代`Push Notification service/API`。
5.  JS and assets managed by Expo require connectivity to Google Cloud Platform and AWS.
