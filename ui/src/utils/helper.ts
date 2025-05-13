export const transformQuery2Obj = (query: string) => {
  const queryList = query.split('&');

  return queryList.reduce((obj, queryStr) => {
    const [key, value] = queryStr.split('=');

    return {
      ...obj,
      [key]: value,
    };
  }, {});
};
