import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/swiper-bundle.css';
import styles from './BookSwiper.module.css';
import { Pagination } from 'swiper/modules';

import { bookInfo } from '@shelflogr/shared';

import BookCard from './BookCard';
import { useHistory } from 'react-router';

const BookSwiper: React.FC<{
  books: Array<{ book: bookInfo; currentStatus: string | null }>;
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
        {books.map(
          (
            info: { book: bookInfo; currentStatus: string | null },
            index: number,
          ) => {
            return (
              <SwiperSlide key={index} className={styles.swiper}>
                <div
                  className={styles.cardContainer}
                  onClick={() => {
                    history.push(`/app/book`, {
                      information: info,
                    });
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <BookCard bookInfo={info.book} detailed={false} />
                </div>
              </SwiperSlide>
            );
          },
        )}
      </Swiper>
    </div>
  );
};

export default BookSwiper;
