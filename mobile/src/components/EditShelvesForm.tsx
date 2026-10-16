import {
  IonIcon,
  IonAlert,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonList,
} from '@ionic/react';

import { book } from 'ionicons/icons';

import styles from './EditShelvesForm.module.css';

import { useState } from 'react';

import { useUserLists } from '../queryOptions/useUserLists';

const EditShelvesForm: React.FC<{
  onClose: () => void;
  onSuccess: (message: string) => void;
}> = ({ onClose, onSuccess }) => {
  const listsNamesQuery = useUserLists();

  if (listsNamesQuery.isSuccess) console.log(listsNamesQuery.data);

  return <p>Olá</p>;
};

export default EditShelvesForm;
