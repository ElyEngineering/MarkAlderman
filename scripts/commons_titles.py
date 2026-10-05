import json, sys, urllib.parse, urllib.request, os, re, time
UA = "TributeSiteBot/1.0 (personal non-commercial tribute; https://example.org)"
API = "https://commons.wikimedia.org/w/api.php"
OUT = os.path.join(os.path.dirname(__file__), "..", "assets-src")
def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r: return r.read()
picks = json.loads(sys.argv[1])  # key -> [title, width]
credits = {}
cp = os.path.join(OUT, "credits.json")
if os.path.exists(cp): credits = json.load(open(cp))
for key, (title, width) in picks.items():
    p = dict(action="query", format="json", titles=title, prop="imageinfo",
             iiprop="url|size|extmetadata", iiurlwidth=width,
             iiextmetadatafilter="LicenseShortName|LicenseUrl|Artist")
    d = json.loads(get(API + "?" + urllib.parse.urlencode(p)))
    pg = list(d["query"]["pages"].values())[0]
    if "imageinfo" not in pg:
        print("MISSING", key, title); continue
    ii = pg["imageinfo"][0]; md = ii.get("extmetadata", {})
    strip = lambda s: re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s or "")).strip()
    url = ii.get("thumburl") or ii["url"]
    data = get(url); open(os.path.join(OUT, key + ".jpg"), "wb").write(data)
    credits[key] = dict(title=pg["title"], page=ii["descriptionurl"],
        license=strip(md.get("LicenseShortName", {}).get("value")),
        licenseUrl=strip(md.get("LicenseUrl", {}).get("value")),
        artist=strip(md.get("Artist", {}).get("value"))[:100])
    print(key, len(data), credits[key]["license"], "|", credits[key]["artist"])
    time.sleep(0.4)
json.dump(credits, open(cp, "w"), indent=1)
