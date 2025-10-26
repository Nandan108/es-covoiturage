export const appendNotice = (path: string, notice: string) => {
  const divider = path.includes("?") ? "&" : "?";
  return `${path}${divider}notice=${encodeURIComponent(notice)}`;
};
