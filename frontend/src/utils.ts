// utils.ts
export const getCsrfToken = (): string | undefined => {
    const name = 'csrftoken';
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith(name + '=')) {
          return decodeURIComponent(trimmedCookie.substring(name.length + 1));
        }
      }
    }
    return undefined;
  };
  