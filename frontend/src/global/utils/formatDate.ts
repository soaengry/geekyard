export const formatDate = (
  dateStr: string,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', options ?? {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
