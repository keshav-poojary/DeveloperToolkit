import { BadRequestException, Injectable } from '@nestjs/common';
import { isIP } from 'net';
import * as dns from 'dns/promises';
import * as tls from 'tls';
import axios from 'axios';

@Injectable()
export class NetworkService {
  async dnsLookup(domain: string, type: string): Promise<unknown[]> {
    try {
      switch (type.toUpperCase()) {
        case 'A':    return await dns.resolve4(domain);
        case 'AAAA': return await dns.resolve6(domain);
        case 'CNAME':return await dns.resolveCname(domain);
        case 'MX':   return await dns.resolveMx(domain);
        case 'NS':   return await dns.resolveNs(domain);
        case 'TXT':  return (await dns.resolveTxt(domain)).map(t => t.join(' '));
        case 'SOA':  return [await dns.resolveSoa(domain)];
        case 'SRV':  return await dns.resolveSrv(domain);
        case 'PTR':  return await dns.resolvePtr(domain);
        default:     return await dns.resolve(domain);
      }
    } catch (err: any) {
      throw new Error(`DNS lookup failed: ${err.message}`);
    }
  }

  async sslCheck(host: string): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const socket = tls.connect(443, host, { servername: host, rejectUnauthorized: false }, () => {
        const cert = socket.getPeerCertificate(true);
        const now = new Date();
        const validFrom = new Date(cert.valid_from);
        const validTo   = new Date(cert.valid_to);
        socket.end();
        resolve({
          subject:    cert.subject?.CN ?? 'N/A',
          issuer:     cert.issuer?.O ?? 'N/A',
          issuer_cn:  cert.issuer?.CN ?? 'N/A',
          valid_from: cert.valid_from,
          valid_to:   cert.valid_to,
          fingerprint:cert.fingerprint ?? 'N/A',
          bits:       cert.bits ?? 'N/A',
          protocol:   socket.getProtocol() ?? 'N/A',
          cipher:     socket.getCipher()?.name ?? 'N/A',
          valid:      now >= validFrom && now <= validTo,
          days_remaining: Math.floor((validTo.getTime() - now.getTime()) / 86400000),
        });
      });
      socket.on('error', (err) => reject(new Error(`SSL check failed: ${err.message}`)));
      socket.setTimeout(10000, () => { socket.destroy(); reject(new Error('Connection timed out')); });
    });
  }

  async httpHeaders(url: string): Promise<Record<string, unknown>> {
    try {
      const response = await axios.head(url, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: () => true,
      });
      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
      };
    } catch (err: any) {
      throw new Error(`Failed to fetch headers: ${err.message}`);
    }
  }

  async ipInfo(ip?: string): Promise<Record<string, unknown>> {
    try {
      let lookupTarget = ip?.trim();
      if (lookupTarget && !isIP(lookupTarget)) {
        try {
          const result = await dns.lookup(lookupTarget);
          lookupTarget = result.address;
        } catch (err: any) {
          throw new BadRequestException(`Unable to resolve hostname: ${lookupTarget}`);
        }
      }

      const url = lookupTarget ? `https://ipapi.co/${lookupTarget}/json/` : 'https://ipapi.co/json/';
      const { data } = await axios.get(url, { timeout: 10000 });
      if (data.error) throw new Error(data.reason ?? 'IP lookup failed');
      return {
        ip:           data.ip,
        city:         data.city,
        region:       data.region,
        country:      data.country_name,
        country_code: data.country_code,
        latitude:     data.latitude,
        longitude:    data.longitude,
        timezone:     data.timezone,
        org:          data.org,
        asn:          data.asn,
        map_url:      `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}&zoom=12`,
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new Error(`IP info failed: ${err.message}`);
    }
  }

  async whois(domain: string): Promise<{ raw: string }> {
    try {
      // Use whois via RDAP (REST-based WHOIS)
      const tld = domain.split('.').pop()?.toLowerCase();
      const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(domain)}`;
      const { data } = await axios.get(rdapUrl, { timeout: 15000 });
      const raw = this.formatRdap(data);
      return { raw };
    } catch (err: any) {
      // Fallback: basic info
      try {
        const { data } = await axios.get(`https://rdap.org/domain/${encodeURIComponent(domain)}`, { timeout: 15000 });
        return { raw: JSON.stringify(data, null, 2) };
      } catch {
        throw new Error(`WHOIS lookup failed: ${err.message}`);
      }
    }
  }

  private formatRdap(data: Record<string, unknown>): string {
    const lines: string[] = [];
    lines.push(`Domain Name: ${data.ldhName ?? data.handle ?? 'N/A'}`);
    if (data.status) lines.push(`Status: ${(data.status as string[]).join(', ')}`);
    if (data.events) {
      for (const evt of data.events as Record<string, string>[]) {
        lines.push(`${evt.eventAction}: ${evt.eventDate}`);
      }
    }
    if (data.nameservers) {
      for (const ns of data.nameservers as Record<string, string>[]) {
        lines.push(`Name Server: ${ns.ldhName}`);
      }
    }
    if (data.entities) {
      for (const ent of data.entities as Record<string, unknown>[]) {
        lines.push(`\n[${(ent.roles as string[])?.join(', ') ?? 'entity'}]`);
        const vcard = ent.vcardArray as unknown[];
        if (vcard?.[1]) {
          for (const field of vcard[1] as unknown[][]) {
            if (field[0] === 'fn') lines.push(`Name: ${field[3]}`);
            if (field[0] === 'org') lines.push(`Organization: ${field[3]}`);
            if (field[0] === 'email') lines.push(`Email: ${field[3]}`);
          }
        }
      }
    }
    return lines.join('\n');
  }
}
