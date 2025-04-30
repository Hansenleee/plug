export class UrlParser {
  static appendSearch(
    url: string,
    search: Array<{ key: string; value: string }> | Record<string, string>
  ) {
    const searchList = Array.isArray(search)
      ? search.map(({ key, value }) => [key, value])
      : Object.entries(search);

    const searchQuery = searchList.reduce((str, [key, value]) => `${str}${key}=${value}&`, '');
    const separateString = url.includes('?') ? '&' : '?';

    return url + separateString + searchQuery.substring(0, searchQuery.length - 1);
  }
}
