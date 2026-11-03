import type { SecurityHeadersAnalysis, SecurityHeaderItem } from "@/types";

export interface HeaderConfigSpec {
  key: string;
  nginxDirective: string;
  nextConfigHeader: { key: string; value: string };
  apacheDirective: string;
  defaultVal: string;
}

export const SECURITY_HEADER_SPECS: Record<string, HeaderConfigSpec> = {
  hsts: {
    key: "Strict-Transport-Security",
    defaultVal: "max-age=63072000; includeSubDomains; preload",
    nginxDirective: 'add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;',
    nextConfigHeader: {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    apacheDirective: 'Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"',
  },
  csp: {
    key: "Content-Security-Policy",
    defaultVal: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    nginxDirective: "add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;\" always;",
    nextConfigHeader: {
      key: "Content-Security-Policy",
      value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    },
    apacheDirective: "Header always set Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;\"",
  },
  xFrameOptions: {
    key: "X-Frame-Options",
    defaultVal: "DENY",
    nginxDirective: 'add_header X-Frame-Options "DENY" always;',
    nextConfigHeader: {
      key: "X-Frame-Options",
      value: "DENY",
    },
    apacheDirective: 'Header always set X-Frame-Options "DENY"',
  },
  xContentTypeOptions: {
    key: "X-Content-Type-Options",
    defaultVal: "nosniff",
    nginxDirective: 'add_header X-Content-Type-Options "nosniff" always;',
    nextConfigHeader: {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    apacheDirective: 'Header always set X-Content-Type-Options "nosniff"',
  },
  referrerPolicy: {
    key: "Referrer-Policy",
    defaultVal: "strict-origin-when-cross-origin",
    nginxDirective: 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
    nextConfigHeader: {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    apacheDirective: 'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
  },
  permissionsPolicy: {
    key: "Permissions-Policy",
    defaultVal: "camera=(), microphone=(), geolocation=()",
    nginxDirective: 'add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;',
    nextConfigHeader: {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    apacheDirective: 'Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
  },
};

export function getTargetHeaderKeys(
  security: SecurityHeadersAnalysis,
  onlyMissing: boolean
): string[] {
  const keys = Object.keys(SECURITY_HEADER_SPECS);
  if (!onlyMissing) return keys;

  return keys.filter((k) => {
    const item = security.headers[k as keyof typeof security.headers] as SecurityHeaderItem | undefined;
    return !item || !item.present;
  });
}

/**
 * Nginx için nginx.conf sunucu bloğu yapılandırma kodunu üretir.
 */
export function generateNginxSnippet(
  security: SecurityHeadersAnalysis,
  onlyMissing = true
): string {
  const targetKeys = getTargetHeaderKeys(security, onlyMissing);
  if (targetKeys.length === 0) {
    return "# Tebrikler! Tüm güvenlik başlıkları sunucunuzda zaten tanımlı.";
  }

  const lines = targetKeys.map((k) => `    ${SECURITY_HEADER_SPECS[k].nginxDirective}`);

  return `# ============================================================
# SeoRadar HTTP Güvenlik Başlıkları — Nginx Yapılandırması
# Dosya: /etc/nginx/conf.d/default.conf veya /etc/nginx/sites-available/
# 'server { ... }' bloğunun içine ekleyin:
# ============================================================

server {
    # ... mevcut server ayarlarınız ...

    # Güvenlik Başlıkları (${onlyMissing ? "Eksik Olanlar" : "Tam Liste"})
${lines.join("\n")}
}`;
}

/**
 * Next.js (next.config.js / next.config.mjs) için headers() fonksiyonunu üretir.
 */
export function generateNextJsSnippet(
  security: SecurityHeadersAnalysis,
  onlyMissing = true
): string {
  const targetKeys = getTargetHeaderKeys(security, onlyMissing);
  if (targetKeys.length === 0) {
    return "// Tebrikler! Tüm güvenlik başlıkları projenizde zaten tanımlı.";
  }

  const headerItems = targetKeys.map((k) => {
    const spec = SECURITY_HEADER_SPECS[k];
    return `          {
            key: '${spec.nextConfigHeader.key}',
            value: '${spec.nextConfigHeader.value.replace(/'/g, "\\'")}',
          },`;
  });

  return `// ============================================================
// SeoRadar HTTP Güvenlik Başlıkları — Next.js Yapılandırması
// Dosya: next.config.js (veya next.config.mjs)
// ============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Tüm sayfalara ve API rotalarına uygula
        source: '/:path*',
        headers: [
${headerItems.join("\n")}
        ],
      },
    ];
  },
};

module.exports = nextConfig;`;
}

/**
 * Apache için .htaccess / httpd.conf mod_headers yapılandırma kodunu üretir.
 */
export function generateApacheSnippet(
  security: SecurityHeadersAnalysis,
  onlyMissing = true
): string {
  const targetKeys = getTargetHeaderKeys(security, onlyMissing);
  if (targetKeys.length === 0) {
    return "# Tebrikler! Tüm güvenlik başlıkları sunucunuzda zaten tanımlı.";
  }

  const lines = targetKeys.map((k) => `    ${SECURITY_HEADER_SPECS[k].apacheDirective}`);

  return `# ============================================================
# SeoRadar HTTP Güvenlik Başlıkları — Apache (.htaccess)
# Web kök dizinindeki .htaccess dosyasına ekleyin
# (mod_headers modülü etkin olmalıdır: a2enmod headers)
# ============================================================

<IfModule mod_headers.c>
    # Güvenlik Başlıkları (${onlyMissing ? "Eksik Olanlar" : "Tam Liste"})
${lines.join("\n")}
</IfModule>`;
}
