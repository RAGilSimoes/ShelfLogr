import type { bookInfo } from '@shelflogr/shared';

export const formatGoogleBook = (
  googleVolumeInfo: any,
  isbn: string,
): bookInfo => {
  function cleanCategories() {
    if (googleVolumeInfo.mainCategory) {
      const mainCategory = googleVolumeInfo.mainCategory.split(' / ');

      if (mainCategory.length > 1) {
        googleVolumeInfo.mainCategory = mainCategory[0];

        googleVolumeInfo.categories = googleVolumeInfo.categories || [];
        googleVolumeInfo.categories.push(...mainCategory.slice(1));
      }
    } else if (
      googleVolumeInfo.categories &&
      googleVolumeInfo.categories.length >= 1
    ) {
      googleVolumeInfo.mainCategory = googleVolumeInfo.categories[0];

      googleVolumeInfo.categories = googleVolumeInfo.categories.slice(1);
    } else {
      googleVolumeInfo.mainCategory = '';
    }
  }

  cleanCategories();

  return {
    isbn: isbn,
    title: googleVolumeInfo.title || '',

    authors: googleVolumeInfo.authors || [''],

    publisher: googleVolumeInfo.publisher || '',
    publishedDate: googleVolumeInfo.publishedDate || '',
    description: googleVolumeInfo.description || '',
    pageCount: googleVolumeInfo.pageCount || 0,

    mainCategory: googleVolumeInfo.mainCategory,
    categories: googleVolumeInfo.categories || [],
    cover: googleVolumeInfo.imageLinks?.thumbnail || '',

    language: googleVolumeInfo.language || '',
    modified: true,
  };
};

export const formatOpenLibraryBook = (
  openLibraryVolumeInfo: any,
  isbn: string,
): bookInfo => {
  function cleanAuthors() {
    let authors = [];
    if (openLibraryVolumeInfo.authors) {
      for (const author of openLibraryVolumeInfo.authors) {
        authors.push(author.name);
      }
    }
    openLibraryVolumeInfo.authors = authors;
  }

  function cleanCategories() {
    let categories = [];
    if (openLibraryVolumeInfo.subjects) {
      for (const category of openLibraryVolumeInfo.subjects) {
        categories.push(category.name);
      }
    }
    openLibraryVolumeInfo.subjects = categories;
  }

  cleanAuthors();
  cleanCategories();

  return {
    isbn: isbn,
    title: openLibraryVolumeInfo.title || '',

    authors:
      openLibraryVolumeInfo.authors?.length > 0
        ? openLibraryVolumeInfo.authors
        : [''],

    publisher: openLibraryVolumeInfo.publishers?.[0]?.name || '',
    publishedDate: openLibraryVolumeInfo.publish_date || '',
    description: openLibraryVolumeInfo.description || '',
    pageCount: openLibraryVolumeInfo.number_of_pages || 0,

    mainCategory:
      openLibraryVolumeInfo.subjects?.length > 0
        ? openLibraryVolumeInfo.subjects[0]
        : '',
    categories:
      openLibraryVolumeInfo.subjects?.length > 1
        ? openLibraryVolumeInfo.subjects.slice(1)
        : [],

    cover: openLibraryVolumeInfo.cover?.medium || '',

    language: openLibraryVolumeInfo.language || '',
    modified: true,
  };
};
