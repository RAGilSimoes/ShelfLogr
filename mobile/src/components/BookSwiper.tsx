import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/swiper-bundle.css';
import styles from './BookSwiper.module.css';
import { Pagination } from 'swiper/modules';

import { bookInfo } from '@shelflogr/shared';

import BookInfo from './BookInfo';
import { useHistory } from 'react-router';

const BookSwiper: React.FC<{
  books: Array<bookInfo>;
}> = ({ books }) => {
  const history = useHistory();
  return (
    <div className={styles.trending}>
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        spaceBetween={50}
        slidesPerView={1}
      >
        {books.map((book: bookInfo, index: number) => {
          return (
            <SwiperSlide key={index}>
              <div
                onClick={() => {
                  history.push(`/app/book`, {
                    information: book,
                  });
                }}
                style={{ cursor: 'pointer' }}
              >
                <BookInfo bookInfo={book} detailed={false} />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default BookSwiper;
