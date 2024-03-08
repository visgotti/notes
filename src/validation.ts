export const noteContentError = (content: string) => {
  if(content.length < 20) {
    return `note must be at least 20 characters long`;
  }
  if(content.length > 300) {
    return `note must not be greater than 300 characters long`;
  }
  return null;
}