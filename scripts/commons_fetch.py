import json, sys, urllib.parse, urllib.request, os, re, time
UA = "TributeSiteBot/1.0 (personal non-commercial tribute; https://example.org)"
API = "https://commons.wikimedia.org/w/api.php"
OUT = os.path.join(os.path.dirname(__file__), "..", "assets-src", "cand")

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read()

def search(q, n=6, width=1920):
    params = dict(action="query", format="json", generator="search", gsrnamespace=6,
                  gsrsearch=q, gsrlimit=n, prop="imageinfo",
                  iiprop="url|size|extmetadata|mime", iiurlwidth=width,
                  iiextmetadatafilter="LicenseShortName|Artist|Credit|ImageDescription")
    d = json.loads(get(API + "?" + urllib.parse.urlencode(params)))
    pages = sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    res = []
    for p in pages:
        ii = p["imageinfo"][0]
        if ii.get("mime") not in ("image/jpeg", "image/png"): continue
        md = ii.get("extmetadata", {})
        strip = lambda s: re.sub(r"<[^>]+>", "", s or "").strip()
        res.append(dict(title=p["title"], w=ii["width"], h=ii["height"],
                        thumb=ii.get("thumburl"), page=ii.get("descriptionurl"),
                        license=strip(md.get("LicenseShortName", {}).get("value")),
                        artist=strip(md.get("Artist", {}).get("value"))[:120]))
    return res

if __name__ == "__main__":
    queries = json.loads(sys.argv[1])
    manifest = {}
    for key, q in queries.items():
        try:
            rs = search(q)
        except Exception as e:
            print("ERR", key, e); continue
        manifest[key] = []
        for i, r in enumerate(rs[:5]):
            fn = f"{key}-{i}.jpg"
            try:
                data = get(r["thumb"])
                open(os.path.join(OUT, fn), "wb").write(data)
                r["file"] = fn
                manifest[key].append(r)
                print(key, i, r["w"], "x", r["h"], r["license"], "|", r["title"][:80], "|", r["artist"][:50])
            except Exception as e:
                print("DLERR", key, i, e)
            time.sleep(0.3)
    path = os.path.join(OUT, "manifest.json")
    old = json.load(open(path)) if os.path.exists(path) else {}
    old.update(manifest)
    json.dump(old, open(path, "w"), indent=1)
