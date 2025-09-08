function FindProxyForURL(url, host) {

  // ===== إعداد البروكسي =====
  var proxyIP = "91.106.109.12";

  // ===== ترتيب البورتات =====
  var gamePorts = [10491, 8085, 8011, 9030, 10612, 12235]; // للبنق الأمثل للعبة
  var otherPorts = [13748, 7700, 443, 8443, 13004, 14000, 17000, 20000, 20002]; // للإنترنت العادي

  // ===== دالة لاختيار أسرع بورت للعبة =====
  function buildGameProxy() {
    // PAC لا يدعم قياس السرعة فعليًا، لكن يمكن ترتيب البورتات حسب الأداء المعروف
    // البورت الأول في القائمة يعتبر الأسرع، والباقي Failover تلقائي
    var chain = [];
    for (var i = 0; i < gamePorts.length; i++) {
      chain.push("SOCKS5 " + proxyIP + ":" + gamePorts[i]);
    }
    return chain.join("; ");
  }

  // ===== دالة بناء بروكسي لباقي الإنترنت =====
  function buildOtherProxy() {
    var chain = [];
    for (var i = 0; i < otherPorts.length; i++) {
      chain.push("PROXY " + proxyIP + ":" + otherPorts[i]);
    }
    return chain.join("; ");
  }

  // ===== تحديد نطاقات اللعبة =====
  var gameDomains = [
    "pubgmobile.com", "*.pubgmobile.com",
    "igamecj.com", "*.igamecj.com",
    "*.tencent.com", "*.tencentgames.com", "*.qq.com",
    "*.gtimg.com", "*.qpic.cn", "*.gcloudsdk.com",
    "*.qcloud.com", "*.tencent-cloud.com", "*.tencentcloudapi.com", "*.myqcloud.com",
    "dlied*.qq.com", "dldir*.qq.com", "*.gamecenter.qq.com", "*.cmgame.com"
  ];

  for (var i = 0; i < gameDomains.length; i++) {
    var pat = gameDomains[i];
    if (pat.indexOf("*") >= 0) {
      if (shExpMatch(host, pat)) return buildGameProxy();
    } else {
      if (dnsDomainIs(host, pat)) return buildGameProxy();
    }
  }

  // ===== حظر نطاقات .ir =====
  if (shExpMatch(host, "*.ir") || dnsDomainIs(host, "ir"))
    return "PROXY 0.0.0.0:9";

  // ===== فلترة IPs إيرانية =====
  var ip = dnsResolve(host);
  var iranCIDRs = [
    ["2.176.0.0", "255.240.0.0"],
    ["2.184.0.0", "255.248.0.0"],
    ["5.106.0.0", "255.254.0.0"],
    ["5.120.0.0", "255.252.0.0"],
    ["37.255.0.0", "255.255.0.0"],
    ["79.127.0.0", "255.255.128.0"],
    ["91.98.0.0",  "255.254.0.0"],
    ["185.110.0.0", "255.255.0.0"],
    ["185.49.0.0",  "255.255.0.0"],
    ["185.143.0.0", "255.255.0.0"],
    ["31.7.0.0",    "255.255.0.0"]
  ];

  if (ip) {
    for (var ir = 0; ir < iranCIDRs.length; ir++) {
      if (isInNet(ip, iranCIDRs[ir][0], iranCIDRs[ir][1]))
        return "PROXY 0.0.0.0:9";
    }
  }

  // ===== باقي الإنترنت العادي يمر عبر البروكسي على أفضل بورت متاح =====
  return buildOtherProxy();
}
