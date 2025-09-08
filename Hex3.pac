// proxy.pac
// ملف PAC مبسّط ومُحسّن للبينق: محاولات قليلة (قليلة fallback)، تدوير بورت ثابت لكل host لتقليل التغيّر.
// عدّل PROXY_IP وGAME_PORTS/OTHER_PORTS وMAX_* حسب حاجتك.

function FindProxyForURL(url, host) {
  // ======== إعدادات (عدّل هنا) ========
  var PROXY_IP = "91.106.109.12";           // عنوان البروكسي الرئيسي
  var GAME_PORTS = [10491, 8085, 8011, 9030, 10612, 12235];
  var OTHER_PORTS = [13748, 7700, 443, 8443, 13004, 14000, 17000];
  var MAX_SOCKS = 2;        // عدد محاولات SOCKS للألعاب (قليل = أسرع استجابة)
  var MAX_PROXY = 2;        // عدد محاولات PROXY للترافيك العام
  var USE_SOCKS5 = true;    // ضع false لو بيئتك لا تدعم SOCKS5
  var ADD_PROXY_FALLBACK = true; // أضف PROXY قصير كـ fallback بعد SOCKS
  var PREFER_DIRECT_LOCAL = true; // تجاوز البروكسي للـ localhost وRFC1918

  // ======== نطاقات الألعاب (قابلة للتعديل) ========
  var GAME_DOMAINS = [
    "pubgmobile.com", "*.pubgmobile.com",
    "igamecj.com", "*.igamecj.com",
    "*.tencent.com", "tencentgames.com", "*.qq.com",
    "*.gtimg.com", "*.qpic.cn", "*.gcloudsdk.com",
    "*.qcloud.com", "*.tencent-cloud.com", "*.tencentcloudapi.com",
    "*.myqcloud.com", "dlied*.qq.com", "dldir*.qq.com",
    "*.gamecenter.qq.com", "*.cmgame.com"
  ];

  // ======== دوال مساعدة خفيفة ========
  var dnsCache = {};
  function dnsResolveOnce(h) {
    if (dnsCache[h] !== undefined) return dnsCache[h];
    var r = dnsResolve(h);
    dnsCache[h] = r;
    return r;
  }

  function simpleHash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h = h & h;
    }
    return Math.abs(h);
  }

  function rotateArray(arr, n) {
    if (!arr || arr.length === 0) return arr;
    n = n % arr.length;
    var out = [];
    for (var i = 0; i < arr.length; i++) out.push(arr[(i + n) % arr.length]);
    return out;
  }

  function buildChain(host, ports, proto, maxItems) {
    if (!ports || ports.length === 0) return proto + " " + PROXY_IP;
    var offset = simpleHash(host) % ports.length;
    var rotated = rotateArray(ports, offset);
    var items = [];
    for (var i = 0; i < maxItems && i < rotated.length; i++) {
      items.push(proto + " " + PROXY_IP + ":" + rotated[i]);
    }
    return items.join("; ");
  }

  function matchAny(hostname, patterns) {
    for (var i = 0; i < patterns.length; i++) {
      if (shExpMatch(hostname, patterns[i])) return true;
    }
    return false;
  }

  // ======== تجاوز الشبكات المحلية وlocalhost ========
  if (PREFER_DIRECT_LOCAL) {
    if (isPlainHostName(host) || dnsDomainIs(host, "localhost")) return "DIRECT";
    var resolved = dnsResolveOnce(host);
    if (resolved) {
      if (isInNet(resolved, "10.0.0.0", "255.0.0.0") ||
          isInNet(resolved, "172.16.0.0", "255.240.0.0") ||
          isInNet(resolved, "192.168.0.0", "255.255.0.0")) {
        return "DIRECT";
      }
    }
  }

  // ======== توجيه نطاقات الألعاب لبروكسي SOCKS (قليل الفالباك لتحسين البينق) ========
  if (matchAny(host, GAME_DOMAINS)) {
    var socksProto = USE_SOCKS5 ? "SOCKS5" : "SOCKS";
    var socksChain = buildChain(host, GAME_PORTS, socksProto, MAX_SOCKS);
    if (ADD_PROXY_FALLBACK) {
      var proxyFallback = buildChain(host, GAME_PORTS, "PROXY", 1);
      return socksChain + (proxyFallback ? "; " + proxyFallback : "");
    }
    return socksChain;
  }

  // ======== باقي الترافيك يمر عبر سلسلة PROXY قصيرة ========
  return buildChain(host, OTHER_PORTS, "PROXY", MAX_PROXY);
}
