export default function getQueryKeys(userID: string) {
  return [
    ['bookInfoISBN', userID],
    ['trendingCategoryBooks', userID],
    ['trendingBooks', userID],
    ['userShelf', userID],
    ['userProfile', userID],
    ['userReviews', userID],
    ['userBook', userID],
    ['userShelves', userID],
    ['trendingListBooks', userID],
  ];
}
