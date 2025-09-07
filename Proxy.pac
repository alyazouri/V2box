// proxy.pac – Jordan Optimized (PUBG Mobile TCP + Web)

// Proxy endpoints
// SOCKS5 للألعاب UDP/TCP، HTTP/HTTPS للويب
var SOCKS_PROXY_PRIMARY   = "SOCKS5 91.106.109.12:20000"; // أفضل لبينغ منخفض للأردن
var SOCKS_PROXY_SECONDARY = "SOCKS5 91.106.109.12:20001"; // احتياطي
var HTTP_PROXY            = "PROXY 91.106.109.12:8080";
var HTTPS_PROXY           = "PROXY 91.106.109.12:8080";

// Game TCP ports (توثيق، PAC لا يستخدم UDP)
var GAME_TCP_PORTS = [20000, 20001, 20003];

function FindProxyForURL(url, host) {
  // 1. Bypass localhost & LAN
  if (isPlainHostName(host) || dnsDomainIs(host, ".local") ||
      shExpMatch(host, "10.*") || shExpMatch(host, "172.*") ||
      shExpMatch(host, "192.168.*") || shExpMatch(host, "127.*")) {
    return "DIRECT";
  }

  // 2. Game domains → prefer SOCKS5 Jordan Primary
  var gameDomains = [
    ".pubgmobile.com",
    ".pubg.com",
    ".tencent.com",
    ".tencentgames.com",
    ".tencentcloudapi.com",
    ".tencentyun.com",
    ".garena.com",
    ".bilibiligame.net",
    ".akamaized.net"
  ];
  for (var i = 0; i < gameDomains.length; i++) {
    if (dnsDomainIs(host, gameDomains[i])) {
      return SOCKS_PROXY_PRIMARY + "; " + SOCKS_PROXY_SECONDARY + "; " + HTTPS_PROXY + "; " + HTTP_PROXY + "; DIRECT";
    }
  }

  // 3. CDN & asset hosts → prefer HTTPS/HTTP
  var cdnDomains = [
    ".amazonaws.com",
    ".cloudfront.net",
    ".azureedge.net",
    ".googleusercontent.com",
    ".fastly.net",
    ".akamaiedge.net",
    ".ggpht.com"
  ];
  for (var j = 0; j < cdnDomains.length; j++) {
    if (dnsDomainIs(host, cdnDomains[j])) {
      return HTTPS_PROXY + "; " + HTTP_PROXY + "; DIRECT";
    }
  }

  // 4. Web traffic fallback
  if (url.substring(0, 6) === "https:") return HTTPS_PROXY + "; " + SOCKS_PROXY_PRIMARY + "; DIRECT";
  if (url.substring(0, 5) === "http:")  return HTTP_PROXY + "; " + SOCKS_PROXY_PRIMARY + "; DIRECT";

  // 5. Default → SOCKS5 then DIRECT
  return SOCKS_PROXY_PRIMARY + "; DIRECT";
}
