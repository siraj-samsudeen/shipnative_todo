/**
 * Certificate Pinning Service
 *
 * SECURITY: Certificate pinning prevents MITM attacks by verifying
 * that the server's certificate matches a known public key.
 *
 * Note: This is a placeholder implementation. For production, you should:
 * 1. Install a certificate pinning library (e.g., react-native-cert-pinner)
 * 2. Configure your API domain's certificate public key hashes
 * 3. Enable pinning in production builds
 */

import { logger } from "../utils/Logger"

/**
 * Certificate pin configuration
 * Add your API domain's certificate public key hashes here
 * Format: SHA256 hash of the certificate's public key
 *
 * To get the hash:
 * openssl s_client -servername your-domain.com -connect your-domain.com:443 < /dev/null | \
 *   openssl x509 -pubkey -noout | \
 *   openssl pkey -pubin -outform der | \
 *   openssl dgst -sha256 -binary | \
 *   openssl enc -base64
 */
const CERTIFICATE_PINS: Record<string, string[]> = {
  // Example: Add your Supabase domain
  // "your-project.supabase.co": [
  //   "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", // Primary cert
  //   "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=", // Backup cert
  // ],
}

/**
 * Check if certificate pinning is enabled
 */
export function isCertificatePinningEnabled(): boolean {
  // Only enable in production
  return !__DEV__ && Object.keys(CERTIFICATE_PINS).length > 0
}

/**
 * Get certificate pins for a domain
 */
export function getCertificatePins(domain: string): string[] | null {
  return CERTIFICATE_PINS[domain] || null
}

type CertificateHashSource =
  | string
  | {
      publicKeyHash?: string
      certificateHash?: string
      hash?: string
    }
  | null
  | undefined

function normalizeCertificateHash(hash: string): string {
  return hash.replace(/^sha256\//, "").toLowerCase()
}

function extractCertificateHash(certificate: CertificateHashSource): string | null {
  if (!certificate) return null

  if (typeof certificate === "string") {
    return certificate
  }

  return certificate.publicKeyHash || certificate.certificateHash || certificate.hash || null
}

/**
 * Validate certificate pin.
 *
 * In production, this should:
 * 1. Extract the certificate from the connection
 * 2. Calculate its public key hash
 * 3. Compare against known pins
 * 4. Reject connection if no match
 */
export async function validateCertificatePin(
  domain: string,
  certificate: CertificateHashSource, // Certificate object or hash from pinning library
): Promise<boolean> {
  if (!isCertificatePinningEnabled()) {
    return true // Skip validation in development
  }

  const pins = getCertificatePins(domain)
  if (!pins || pins.length === 0) {
    logger.error("[CertificatePinning] Pinning enabled but no pins configured for domain", {
      domain,
    })
    return false
  }

  const certificateHash = extractCertificateHash(certificate)
  if (!certificateHash) {
    logger.error("[CertificatePinning] Missing certificate hash for validation", { domain })
    return false
  }

  const normalizedHash = normalizeCertificateHash(certificateHash)
  const matches = pins.some((pin) => normalizeCertificateHash(pin) === normalizedHash)

  if (!matches) {
    logger.error("[CertificatePinning] Certificate hash mismatch", { domain })
  }

  return matches
}

/**
 * Initialize certificate pinning
 * Call this during app initialization
 */
export function initializeCertificatePinning(): void {
  if (isCertificatePinningEnabled()) {
    logger.info("[CertificatePinning] Certificate pinning enabled", {
      domains: Object.keys(CERTIFICATE_PINS),
    })
  } else {
    if (__DEV__) {
      logger.debug("[CertificatePinning] Certificate pinning disabled (development mode)")
    } else {
      logger.warn("[CertificatePinning] Certificate pinning disabled - no pins configured")
    }
  }
}

/**
 * Certificate pinning configuration helper
 * Use this to add certificate pins for your API domains
 */
export const certificatePinning = {
  isEnabled: isCertificatePinningEnabled,
  getPins: getCertificatePins,
  validate: validateCertificatePin,
  initialize: initializeCertificatePinning,
}
