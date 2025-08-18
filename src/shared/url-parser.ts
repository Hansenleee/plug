export class UrlParser {
  static appendSearch(
    url: string,
    search: Array<{ key: string; value: string }> | Record<string, string>
  ) {
    const searchList = Array.isArray(search)
      ? search.map(({ key, value }) => [key, value])
      : Object.entries(search);

    const searchQuery = searchList.reduce((str, [key, value]) => `${str}${key}=${value}&`, '');
    const searchQueryWithoutLastStr = searchQuery.substring(0, searchQuery.length - 1);

    if (!searchQueryWithoutLastStr) {
      return url;
    }

    const separateString = url.includes('?') ? '&' : '?';

    return url + separateString + searchQueryWithoutLastStr;
  }
}
