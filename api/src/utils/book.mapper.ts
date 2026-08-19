import type { bookInfo } from '@shelflogr/shared';

export const formatGoogleBook = (
  googleVolumeInfo: any,
  isbn: string,
): bookInfo => {
  function cleanCategories() {
    if (googleVolumeInfo.mainCategory) {
      let categoriesSet = new Set<string>();

      const splitMainCategory = googleVolumeInfo.mainCategory.split(' / ');

      googleVolumeInfo.mainCategory = splitMainCategory[0];

      const secondaryCategories = splitMainCategory.slice(1);

      for (const category of secondaryCategories) {
        categoriesSet.add(category);
      }

      for (const line of googleVolumeInfo.categories) {
        const splitLine = line.split(' / ');

        for (const index of splitLine) {
          categoriesSet.add(index);
        }
      }
      categoriesSet.delete(splitMainCategory[0]);
      googleVolumeInfo.categories = Array(...categoriesSet);
    } else {
      let categoriesArray = [];
      for (const line of googleVolumeInfo.categories) {
        const splitLine = line.split(' / ');

        for (const index of splitLine) {
          categoriesArray.push(index);
        }
      }

      let wordCount: any = {};

      for (const category of categoriesArray) {
        if (category in wordCount) {
          wordCount[category] += 1;
        } else {
          wordCount[category] = 1;
        }
      }

      const entries = Object.entries(wordCount);
      const sortedEntries = entries.sort((a: any, b: any) => b[1] - a[1]);

      if (sortedEntries.length > 0) {
        googleVolumeInfo.mainCategory = sortedEntries[0]![0];

        googleVolumeInfo.categories = sortedEntries
          .slice(1)
          .map((entry) => entry[0]);
      }
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

  const maxSecondaryCategoriesIndex = 6;

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
        ? openLibraryVolumeInfo.subjects.slice(1, maxSecondaryCategoriesIndex)
        : [],

    cover: openLibraryVolumeInfo.cover?.medium || '',

    language: openLibraryVolumeInfo.language || '',
    modified: true,
  };
};
