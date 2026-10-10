class DefaultExtension extends MProvider {
  constructor() {
    super();
    this.baseUrl = "https://reanime.to";
  }

  getHeaders(url) {
    return {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": this.baseUrl + "/",
      "Accept": "application/json, text/plain, */*"
    };
  }

  get supportsLatest() {
    return true;
  }

  async getPopular(page) {
    try {
      const url = `${this.baseUrl}/api/anime/popular?page=${page}`;
      const response = await new Client().get(url, this.getHeaders(url));
      if (response.statusCode !== 200) return { list: [], hasNextPage: false };

      const data = JSON.parse(response.body);
      const list = (data.results || data.anime || []).map(item => ({
        name: item.title || item.name,
        imageUrl: item.poster || item.image || item.cover,
        link: JSON.stringify({ id: item.id || item.slug, title: item.title })
      }));

      return {
        list: list,
        hasNextPage: data.hasNextPage || page < (data.totalPages || 1)
      };
    } catch (e) {
      return { list: [], hasNextPage: false };
    }
  }

  async getLatestUpdates(page) {
    try {
      const url = `${this.baseUrl}/api/anime/recent?page=${page}`;
      const response = await new Client().get(url, this.getHeaders(url));
      if (response.statusCode !== 200) return { list: [], hasNextPage: false };

      const data = JSON.parse(response.body);
      const list = (data.results || data.anime || []).map(item => ({
        name: item.title || item.name,
        imageUrl: item.poster || item.image || item.cover,
        link: JSON.stringify({ id: item.id || item.slug, title: item.title })
      }));

      return {
        list: list,
        hasNextPage: data.hasNextPage || page < (data.totalPages || 1)
      };
    } catch (e) {
      return { list: [], hasNextPage: false };
    }
  }

  async search(query, page, filters) {
    try {
      const url = `${this.baseUrl}/api/anime/search?q=${encodeURIComponent(query)}&page=${page}`;
      const response = await new Client().get(url, this.getHeaders(url));
      if (response.statusCode !== 200) return { list: [], hasNextPage: false };

      const data = JSON.parse(response.body);
      const list = (data.results || data.anime || []).map(item => ({
        name: item.title || item.name,
        imageUrl: item.poster || item.image || item.cover,
        link: JSON.stringify({ id: item.id || item.slug, title: item.title })
      }));

      return {
        list: list,
        hasNextPage: data.hasNextPage || false
      };
    } catch (e) {
      return { list: [], hasNextPage: false };
    }
  }

  async getDetail(url) {
    const item = JSON.parse(url);
    const detailUrl = `${this.baseUrl}/api/anime/info/${item.id}`;
    
    try {
      const response = await new Client().get(detailUrl, this.getHeaders(detailUrl));
      const data = JSON.parse(response.body);

      const episodes = (data.episodes || []).map((ep, index) => ({
        name: ep.title ? `${ep.number}화 - ${ep.title}` : `${ep.number || (index + 1)}화`,
        url: JSON.stringify({ episodeId: ep.id || ep.episodeId, animeId: item.id }),
        scanlator: ep.type || "SUB"
      }));

      return {
        name: data.title || item.title,
        link: url,
        imageUrl: data.poster || data.image || item.imageUrl,
        description: data.description || data.synopsis || "정보 없음",
        author: "ReAnime",
        status: data.status === "Ongoing" ? 0 : 1,
        genre: data.genres || [],
        episodes: episodes
      };
    } catch (e) {
      return {
        name: item.title,
        link: url,
        imageUrl: "",
        description: "",
        episodes: []
      };
    }
  }

  async getVideoList(url) {
    const item = JSON.parse(url);
    const streamUrl = `${this.baseUrl}/api/anime/watch/${item.episodeId}`;

    try {
      const response = await new Client().get(streamUrl, this.getHeaders(streamUrl));
      if (response.statusCode !== 200) return [];

      const data = JSON.parse(response.body);
      const sources = data.sources || [];
      const videoList = [];

      for (const source of sources) {
        if (source.url) {
          videoList.push({
            url: source.url,
            originalUrl: source.url,
            quality: source.quality || "Auto · ReAnime",
            headers: this.getHeaders(source.url)
          });
        }
      }

      return videoList;
    } catch (e) {
      return [];
    }
  }

  async getPageList(url) { return []; }
  getFilterList() { return []; }
  getSourcePreferences() { return []; }
}