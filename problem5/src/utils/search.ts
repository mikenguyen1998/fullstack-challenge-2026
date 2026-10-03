function normalizeSearch(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu thanh, dấu mũ
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function slugify(input: string): string {
  return normalizeSearch(input)
    .replace(/[^a-z0-9\s-]/g, '') // drop punctuation
    .replace(/[\s-]+/g, '-') // spaces -> dash
    .replace(/^-|-$/g, ''); // trim dashes
}

export { normalizeSearch, slugify };
