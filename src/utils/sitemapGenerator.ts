import { supabase } from '@/lib/supabase';

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface ImageSitemapUrl {
  loc: string;
  caption?: string;
  title?: string;
  geo_location?: string;
  license?: string;
}

export class SitemapGenerator {
  private baseUrl = 'https://abbaquar.org';
  private currentDate = new Date().toISOString().split('T')[0];

  // Static pages
  private getStaticPages(): SitemapUrl[] {
    return [
      {
        loc: `${this.baseUrl}/`,
        lastmod: this.currentDate,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: `${this.baseUrl}/about-us`,
        lastmod: this.currentDate,
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/activities`,
        lastmod: this.currentDate,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/events`,
        lastmod: this.currentDate,
        changefreq: 'daily',
        priority: 0.9
      },
      {
        loc: `${this.baseUrl}/gallery`,
        lastmod: this.currentDate,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        loc: `${this.baseUrl}/contact`,
        lastmod: this.currentDate,
        changefreq: 'monthly',
        priority: 0.6
      }
    ];
  }

  // Fetch events from database
  private async getEvents(): Promise<SitemapUrl[]> {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('id, title, updated_at, start_date')
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching events for sitemap:', error);
        return [];
      }

      return events?.map(event => ({
        loc: `${this.baseUrl}/events/${event.id}`,
        lastmod: event.updated_at ? new Date(event.updated_at).toISOString().split('T')[0] : this.currentDate,
        changefreq: 'weekly' as const,
        priority: 0.7
      })) || [];
    } catch (error) {
      console.error('Error fetching events for sitemap:', error);
      return [];
    }
  }

  // Fetch activities from database
  private async getActivities(): Promise<SitemapUrl[]> {
    try {
      const { data: activities, error } = await supabase
        .from('activities')
        .select('id, title, updated_at')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching activities for sitemap:', error);
        return [];
      }

      return activities?.map(activity => ({
        loc: `${this.baseUrl}/activities/${activity.id}`,
        lastmod: activity.updated_at ? new Date(activity.updated_at).toISOString().split('T')[0] : this.currentDate,
        changefreq: 'monthly' as const,
        priority: 0.6
      })) || [];
    } catch (error) {
      console.error('Error fetching activities for sitemap:', error);
      return [];
    }
  }

  // Generate main sitemap XML
  public async generateSitemap(): Promise<string> {
    const staticPages = this.getStaticPages();
    const events = await this.getEvents();
    const activities = await this.getActivities();

    const allUrls = [...staticPages, ...events, ...activities];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return xml;
  }

  // Generate image sitemap
  public async generateImageSitemap(): Promise<string> {
    try {
      const { data: images, error } = await supabase
        .from('gallery')
        .select('id, title, description, image_url, created_at')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching images for sitemap:', error);
        return '';
      }

      const imageUrls: ImageSitemapUrl[] = images?.map(image => ({
        loc: `${this.baseUrl}${image.image_url}`,
        caption: image.description || image.title,
        title: image.title,
        geo_location: 'Cape Town, Western Cape, South Africa',
        license: 'https://creativecommons.org/licenses/by-nc/4.0/'
      })) || [];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${this.baseUrl}/gallery</loc>
${imageUrls.map(img => `    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:caption>${img.caption || ''}</image:caption>
      <image:title>${img.title || ''}</image:title>
      <image:geo_location>${img.geo_location}</image:geo_location>
      <image:license>${img.license}</image:license>
    </image:image>`).join('\n')}
  </url>
</urlset>`;

      return xml;
    } catch (error) {
      console.error('Error generating image sitemap:', error);
      return '';
    }
  }

  // Generate sitemap index
  public generateSitemapIndex(): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${this.baseUrl}/sitemap.xml</loc>
    <lastmod>${this.currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${this.baseUrl}/sitemap-images.xml</loc>
    <lastmod>${this.currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

    return xml;
  }
}

// Export singleton instance
export const sitemapGenerator = new SitemapGenerator();
