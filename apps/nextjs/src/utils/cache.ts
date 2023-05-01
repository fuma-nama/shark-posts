export function updateInfiniteData<Page extends { timestamp: Date }[]>(
  pages: Page[],
  target: Date,
  update: (page: Page) => Page,
): Page[] {
  return pages.map((page) =>
    page.length !== 0 &&
    target <= page[0].timestamp &&
    target >= page[page.length - 1].timestamp
      ? update(page)
      : page,
  );
}
