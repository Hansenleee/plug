export const getContentType = (contentType: string) => {
  return contentType?.split(';')?.[0];
};
