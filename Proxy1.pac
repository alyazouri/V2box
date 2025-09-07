// proxy.pac – Jordan Advanced Low-Ping (PUBG TCP+UDP + Web)

// Proxy endpoints
var SOCKS_PROXY_PRIMARY   = "SOCKS5 91.106.109.12:20000"; // أفضل لبينغ منخفض للأردن
var SOCKS_PROXY_SECONDARY = "SOCKS5 91.106.109.12:20001"; // احتياطي
var HTTP_PROXY            = "PROXY 91.106.109.12:8080";
var HTTPS_PROXY           = "PROXY 91.106.109.12:8080";

// Domains
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

var cdnDomains = [
    ".amazonaws.com",
    ".cloudfront.net",
    ".azureedge.net",
    ".googleusercontent.com",
    ".fastly.net",
    ".akamaiedge.net",
    ".ggpht.com"
];

function FindProxyForURL(url, host) {
    // 1. Bypass localhost & LAN
    if (isPlainHostName(host) || dnsDomainIs(host, ".local") ||
        shExpMatch(host, "10.*") || shExpMatch(host, "172.*") ||
        shExpMatch(host, "192.168.*") || shExpMatch(host, "127.*")) {
        return "DIRECT";
    }

    // 2. Game domains → TCP/UDP عبر الأردني أولاً
    for (var i = 0; i < gameDomains.length; i++) {
        if (dnsDomainIs(host, gameDomains[i])) {
            return "SOCKS5 91.106.109.12:20000; SOCKS5 91.106.109.12:20001; HTTPS 91.106.109.12:8080; HTTP 91.106.109.12:8080; DIRECT";
        }
    }

    // 3. CDN & asset hosts → HTTPS/HTTP محلي أولاً
    for (var j = 0; j < cdnDomains.length; j++) {
        if (dnsDomainIs(host, cdnDomains[j])) {
            return "HTTPS 91.106.109.12:8080; HTTP 91.106.109.12:8080; DIRECT";
        }
    }

    // 4. Web traffic fallback → HTTPS أولاً
    if (url.substring(0, 6) === "https:") return "HTTPS 91.106.109.12:8080; SOCKS5 91.106.109.12:20000; DIRECT";
    if (url.substring(0, 5) === "http:")  return "HTTP 91.106.109.12:8080; SOCKS5 91.106.109.12:20000; DIRECT";

    // 5. Default → SOCKS5 الأردني ثم DIRECT
    return "SOCKS5 91.106.109.12:20000; DIRECT";
}
