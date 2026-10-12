export default function getQueryKeys(userID: string) {
  return [
    ['bookInfoISBN', userID],
    ['trendingCategoryBooks', userID],
    ['trendingBooks', userID],
    ['userList', userID],
    ['userProfile', userID],
    ['userReviews', userID],
    ['userBook', userID],
    ['userLists', userID],
  ];
}
