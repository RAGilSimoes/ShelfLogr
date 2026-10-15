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

const EditShelvesForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return <p>Olá</p>;
};

export default EditShelvesForm;
