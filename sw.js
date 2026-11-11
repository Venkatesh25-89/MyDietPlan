// Network-first for the page itself, so a new upload shows on the very next open.
// Falls back to the saved copy when there is no internet.
const CACHE="my-diet-plan-v2";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET")return;
  const url=new URL(req.url);
  const isPage=req.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith("index.html");
  if(isPage){
    e.respondWith(fetch(req,{cache:"no-store"}).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res})
      .catch(()=>caches.match(req,{ignoreSearch:true}).then(hit=>hit||caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>{
    const net=fetch(req).then(res=>{if(res&&(res.ok||res.type==="opaque")){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res}).catch(()=>hit);
    return hit||net;
  }));
});
