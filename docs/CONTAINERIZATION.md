# Konteynerleştirme Rehberi

Bu depodaki dört bağımsız Next.js 15 (App Router) uygulaması — **seoradar**, **konvertlab**, **terneon** ve **parselya** — Docker ile konteynerleştirilmiştir. Her uygulamanın kendi dizininde bir `Dockerfile`, `.dockerignore` ve tekil `docker-compose.yml` dosyası; depo kökünde ise dört hizmeti birden ayağa kaldıran ortak bir `docker-compose.yml` bulunur.

> Not: `rea/` dizini bu kurulumun dışındadır ve hiçbir compose dosyasında referans edilmez.

## Port Tablosu

| Uygulama   | Dizin         | Host Portu | Konteyner Portu | Yerel Adres               |
| ---------- | ------------- | ---------- | --------------- | ------------------------- |
| konvertlab | `konvertlab/` | 3001       | 3001            | http://localhost:3001     |
| seoradar   | `seoradar/`   | 3002       | 3002            | http://localhost:3002     |
| terneon    | `terneon/`    | 3003       | 3003            | http://localhost:3003     |
| parselya   | `parselya/`   | 3004       | 3004            | http://localhost:3004     |

## Image Mimarisi (3 Aşama)

Her `Dockerfile` üç aşamalı (multi-stage) bir yapı kullanır:

1. **deps** — `node:22-alpine` tabanlı; `package.json` (ve varsa `package-lock.json`) kopyalanır ve `npm install` çalıştırılır. Kaynak kod değiştiğinde bile bağımlılık katmanı önbellekten geldiği için bu aşama yeniden çalışmaz.
2. **builder** — `node_modules` deps aşamasından alınır, tüm kaynak koda kopyalanır ve `npm run build` ile Next.js üretim derlemesi (`.next/`) oluşturulur. `NEXT_TELEMETRY_DISABLED=1` ile telemetri kapatılır. Build öncesinde `mkdir -p /app/public` yapılarak `public/` dizininin varlığı garanti altına alınır; böylece runner aşamasındaki `COPY` her koşulda başarılı olur.
3. **runner** — yalnızca çalışma zamanı artefaktları (`package.json`, `node_modules`, `.next/`, `next.config.ts`, `public/`) kopyalanır; root yerine `nextjs` sistem kullanıcısıyla (`uid/gid 1001`) çalışır ve `npm start` (yani `next start`) ile ayağa kalkar.

### Neden `next start` + tam `node_modules`?

Next.js'in `output: 'standalone'` modu çok daha küçük imajlar üretir; ancak bu mod `next.config` dosyasında açıkça etkinleştirilmeyi gerektirir ve projelerde bu ayarın varlığı **varsayılmamıştır**. Standalone çıktısı olmadan `.next/standalone` dizini oluşmaz. Bu yüzden güvenli yol seçilmiş, `next start` komutunun ihtiyaç duyduğu tam `node_modules` ve `.next/` dizinleri imaja kopyalanmıştır. İmaj boyutu daha büyüktür fakat yapılandırma bağımsızdır ve her dört projede koşulsuz çalışır. İleride `output: 'standalone'` etkinleştirilirse runner aşaması küçültülebilir.

## Çalıştırma

### Tekil uygulama

Bir uygulamanın kendi dizininden çalıştırılması:

```bash
cd seoradar
docker compose up --build -d
docker compose logs -f seoradar
docker compose down
```

Diğer uygulamalar için aynı komutlar ilgili dizinde (`konvertlab/`, `terneon/`, `parselya/`) geçerlidir.

### Tümü birden (depo kökünden)

```bash
# Tümünü derle ve arka planda başlat
docker compose up --build -d

# Tek bir uygulamanın loglarını izle
docker compose logs -f seoradar

# Tek bir hizmeti yeniden derleyip kaldırma
docker compose up --build -d konvertlab

# Hepsini durdur ve konteynerleri kaldır
docker compose down

# Durum ve healthcheck görünümü
docker compose ps
```

Kök compose dosyası `saas` adlı bir bridge ağı kurar; dört hizmet de bu ağ üzerindedir ve birbirlerine isimleriyle (`http://seoradar:3002` gibi) erişebilir.

## Healthcheck Davranışı

Her imaj ve her compose hizmeti, `GET /` üzerine bir healthcheck tanımlar:

- Alpine tabanlı imajlarda `curl` bulunmadığından `wget -qO- http://127.0.0.1:<port>/` kullanılır.
- 30 saniyede bir denenir, 5 saniye zaman aşımı vardır, 20 saniyelik `start_period` boyunca başarısızlıklar sayılmaz ve 5 ardışık başarısızlıktan sonra konteyner `unhealthy` işaretlenir.
- `docker compose ps` çıktısında `(healthy)` / `(unhealthy)` durumu izlenebilir. `unhealthy` durumunun kendiliğinden yeniden başlatma tetiklemediğini unutmayın; orkestratör (Swarm/Kubernetes) katmanı bunu değerlendirir.

## Üretim Notları

- **Ters vekil ve TLS:** Bu konteynerler TLS sonlandırmaz. Üretimde önlerine nginx, Caddy veya bir yük dengeleyici koyun; TLS sertifikalarını bu katmanda sonlandırın ve konteynerlere `X-Forwarded-Proto` / `X-Forwarded-For` başlıklarını iletin.
- **Build cache (BuildKit):** CI'da derleme önbelleğini verimli kullanmak için:

  ```dockerfile
  RUN --mount=type=cache,target=/root/.npm npm install --no-audit --no-fund
  ```

- **buildx:** Çok platformlu (ör. `linux/amd64` + `linux/arm64`) imaj üretimi için `docker buildx build --platform linux/amd64,linux/arm64 -t <tag> --push .` kullanın.
- **Registry'e gönderme örneği:**

  ```bash
  docker build -t registry.example.com/seoradar:1.0.0 ./seoradar
  docker push registry.example.com/seoradar:1.0.0
  ```

- **İmaj imzası ve immutabilite:** `:latest` yerine değişmez (immutable) sürüm etiketleri veya SHA özetli etiketler kullanın; imaj bütünlüğü için `docker trust sign` / cosign ile imzalayın.
- **Kaynak limitleri (örnek):**

  ```yaml
  services:
    seoradar:
      deploy:
        resources:
          limits:
            cpus: "1.0"
            memory: 512M
  ```

  `docker compose up` bu `deploy.resources.limits` değerlerini uygular (Swarm gerekmez).

## Windows / WSL2 Notları

- **Satır sonları:** Windows'ta dosyalar CRLF ile kaydedilebilir; kabuk betikleri ve Dockerfile'larda sorun çıkmaması için depo köküne bir `.gitattributes` eklenmesi önerilir:

  ```
  * text=auto eol=lf
  *.bat text eol=crlf
  Dockerfile text eol=lf
  ```

- **Dosya izinleri:** WSL2 dosya sistemi (drvfs) üzerinde izinler farklı yorumlanabilir; performans ve izin tutarlılığı için depoyu WSL2 içindeki bir dizinde (ör. `~/projects/saas`) tutmak önerilir.
- Docker Desktop'ın **Settings → Resources** bölümünden Docker'a ayrılan CPU/RAM'i artırmak büyük Next.js derlemeleri için gerekli olabilir.

## Yaygın Hatalar

| Belirti | Neden | Çözüm |
| --- | --- | --- |
| `EADDRINUSE` / port çakışması | Host portunda (3001–3004) başka bir süreç ya da yerel `npm run dev` çalışıyor | `netstat -ano \| findstr :3001` ile süreci bulun ve kapatın, ya da compose dosyasındaki host portunu değiştirin |
| Build sırasında OOM (`JavaScript heap out of memory`, derleme aniden çıkıyor) | Node'un varsayılan heap limiti büyük derlemeler için yetmiyor | Derleme öncesi `NODE_OPTIONS=--max-old-space-size=4096` ortam değişkenini builder aşamasına ekleyin veya Docker Desktop RAM ayarını yükseltin |
| Çalışma zamanında dosya/module bulunamıyor (derleme beklenenden farklı davranıyor) | `.dockerignore` bir kaynak dosyayı dışarıda bıraktı | İlgili deseni `.dockerignore`dan çıkarın; imaja girmesi gereken kaynak dosyaların dışlanmadığından emin olun |
| Konteyner `unhealthy` | Uygulama `start_period` içinde ayağa kalkmadı ya da `/` hata döndürüyor | `docker compose logs -f <hizmet>` ile loglara bakın; `start_period`/`retries` değerlerini gerektiği gibi artırın |
