// proxy.pac – Gold Edition (PUBG + Web)
var HTTP_PROXY  = "PROXY 91.106.109.12:8080";
var SOCKS_PROXY = "SOCKS5 91.106.109.12:1080";

function FindProxyForURL(url, host) {

  // 1. تجاوز الشبكة المحلية
  if (
    isPlainHostName(host) ||
    dnsDomainIs(host, "localhost") ||
    isInNet(host, "10.0.0.0", "255.0.0.0") ||
    isInNet(host, "172.16.0.0", "255.240.0.0") ||
    isInNet(host, "192.168.0.0", "255.255.0.0") ||
    shExpMatch(host, "127.*")
  ) {
    return "DIRECT";
  }

  // 2. دومينات الألعاب → SOCKS
  var gameDomains = [
    "pubgmobile.com",
    "pubg.com",
    "tencent.com",
    "tencentgames.com",
    "tencentcloudapi.com",
    "tencentyun.com",
    "garena.com",
    "bilibiligame.net",
    "akamaized.net"
  ];
  for (var i=0;i<gameDomains.length;i++){
    if(shExpMatch(host,"*."+gameDomains[i])||host==gameDomains[i]){
      return SOCKS_PROXY + "; " + HTTP_PROXY + "; DIRECT";
    }
  }

  // 3. CDN & assets → HTTP
  var cdnDomains = [
    "amazonaws.com",
    "cloudfront.net",
    "azureedge.net",
    "googleusercontent.com",
    "fastly.net",
    "akamaiedge.net",
    "ggpht.com"
  ];
  for(var j=0;j<cdnDomains.length;j++){
    if(shExpMatch(host,"*."+cdnDomains[j])||host==cdnDomains[j]){
      return HTTP_PROXY + "; DIRECT";
    }
  }

  // 4. Web fallback
  if(url.substring(0,6)==="https:") return HTTP_PROXY + "; " + SOCKS_PROXY + "; DIRECT";
  if(url.substring(0,5)==="http:") return HTTP_PROXY + "; " + SOCKS_PROXY + "; DIRECT";

  // 5. Default
  return SOCKS_PROXY + "; " + HTTP_PROXY + "; DIRECT";
}
