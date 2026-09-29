import os, re, json, pathlib
from datetime import datetime
import feedparser, html2text
from bs4 import BeautifulSoup

FEED = os.environ["SUBSTACK_FEED"]
OUT = pathlib.Path("_posts")
OUT.mkdir(exist_ok=True)

conv = html2text.HTML2Text()
conv.body_width = 0
conv.unicode_snob = True

IMG_HOSTS = ("substackcdn.com", "substack-post-media")

def clean(html):
    soup = BeautifulSoup(html, "html.parser")

    # 購読ウィジェットを除去
    for el in soup.select(".subscription-widget-wrap-editor, .subscription-widget-wrap"):
        el.decompose()

    # 画像ブロックを単純な <img> に置き換え（画像以外へのリンクは維持）
    for box in soup.select("div.captioned-image-container"):
        img = box.find("img")
        if not img or not img.get("src"):
            box.decompose()
            continue
        new_img = soup.new_tag("img", src=img["src"], alt=img.get("alt") or "")
        a = box.find("a", class_="image-link")
        href = a.get("href") if a else None
        node = new_img
        if href and not any(h in href for h in IMG_HOSTS):
            link = soup.new_tag("a", href=href)
            link.append(new_img)
            node = link
        p = soup.new_tag("p")
        p.append(node)
        cap = box.find("figcaption")
        if cap and cap.get_text(strip=True):
            em = soup.new_tag("em")
            em.string = cap.get_text(strip=True)
            p.append(soup.new_tag("br"))
            p.append(em)
        box.replace_with(p)

    # YouTube はプレースホルダーにして、変換後に iframe へ戻す
    for yt in soup.select("div.youtube-wrap"):
        vid = yt.get("id", "").replace("youtube2-", "")
        p = soup.new_tag("p")
        p.string = f"@@YT:{vid}@@"
        yt.replace_with(p)

    return str(soup)

def restore_youtube(md):
    def repl(m):
        vid = m.group(1).replace("\\", "")
        return (
            f'<iframe width="560" height="315" '
            f'src="https://www.youtube-nocookie.com/embed/{vid}" '
            f'frameborder="0" allowfullscreen loading="lazy"></iframe>'
        )
    return re.sub(r"@@YT:([\w\\-]+)@@", repl, md)

print("FEED =", repr(FEED))
if not FEED:
    raise SystemExit("SUBSTACK_FEED is empty: Repository variables に登録されているか確認してください")

feed = feedparser.parse(FEED, agent="Mozilla/5.0 (compatible; blog-sync)")
print("status:", feed.get("status"), "| entries:", len(feed.entries),
      "| bozo:", feed.get("bozo"), feed.get("bozo_exception"))
if not feed.entries:
    raise SystemExit("No entries fetched")

for e in feed.entries:
    d = datetime(*e.published_parsed[:6])
    slug = e.link.rstrip("/").split("/")[-1]
    path = OUT / f"{d:%Y-%m-%d}-{slug}.md"
    if path.exists():
        continue

    html = e.content[0].value if "content" in e else e.summary
    body = conv.handle(clean(html))
    body = restore_youtube(body)
    body = re.sub(r"\n{3,}", "\n\n", body).strip()

    front = [
        "---",
        "layout: post",
        f"title: {json.dumps(e.title.strip(), ensure_ascii=False)}",
        f"date: {d:%Y-%m-%d %H:%M:%S} +0000",
        f"canonical_url: {e.link}",
    ]
    if e.get("summary"):
        front.append(f"description: {json.dumps(e.summary.strip(), ensure_ascii=False)}")
    if e.get("enclosures"):
        front.append(f"image: {e.enclosures[0].href}")
    front.append("---")

    path.write_text("\n".join(front) + "\n\n" + body + "\n", encoding="utf-8")
    print("added", path)
