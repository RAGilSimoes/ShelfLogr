import {
  IonIcon,
  IonAlert,
  IonButton,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';

import { book, bookmark } from 'ionicons/icons';

import styles from './AddButtons.module.css';

import { useState } from 'react';

import { useUserLists } from '../queryOptions/useUserLists';

const AddButtons: React.FC<{
  onAddBook: (requiredList: string, optionalLists?: Array<string>) => void;
}> = ({ onAddBook }) => {
  const [isAddAlertOpen, setIsAddAlertOpen] = useState<boolean>(false);

  const listsNames = useUserLists();

  const [requiredListID, setRequiredListID] = useState<string>('');
  const [requiredListName, setRequiredListName] = useState<string>('');

  const [optionalListsID, setOptionalListsID] = useState<string[]>([]);
  const [optionalListsName, setOptionalListsName] = useState<string[]>([]);

  if (listsNames.isSuccess) {
    const lists: Array<{
      id: string;
      name: string;
      is_system: boolean;
      quantity: number;
    }> = listsNames.data.lists;

    const systemLists = lists.filter((list) => list.is_system === true);
    const extraLists = lists.filter((list) => list.is_system === false);

    return (
      <>
        <IonAlert
          isOpen={isAddAlertOpen}
          header={'Confirm Action'}
          message={`Are you sure you want to add this book to the following lists?`}
          cssClass="custom-isbn-alert"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'alert-cancel-button',
            },
            {
              text: 'Confirm',
              role: 'confirm',
              cssClass: 'alert-confirm-button',
              handler: () => {
                onAddBook(requiredListID, optionalListsID);
              },
            },
          ]}
          onDidDismiss={() => {
            setIsAddAlertOpen(false);
          }}
          className={styles.alert}
        ></IonAlert>

        <IonSelect
          placeholder="List To Add"
          interfaceOptions={{ header: 'Choose A List' }}
          onIonChange={(e) => {
            setRequiredListID(e.detail.value);
            setRequiredListName(
              systemLists.find((list) => list.id === e.detail.value)!.name,
            );
          }}
          label="Status"
          multiple={false}
          value={requiredListID}
        >
          {systemLists.map(
            (
              list: {
                id: string;
                name: string;
                is_system: boolean;
                quantity: number;
              },
              index: number,
            ) => {
              return (
                <IonSelectOption key={index} value={list.id}>
                  {list.name.charAt(0).toUpperCase() + list.name.slice(1)}
                </IonSelectOption>
              );
            },
          )}
        </IonSelect>

        {extraLists.length > 0 && (
          <IonSelect
            placeholder="Extra List(s)"
            interfaceOptions={{ header: 'Choose The List(s)' }}
            onIonChange={(e) => {
              setOptionalListsID(e.detail.value);
            }}
            label="Optional Lists"
            multiple={true}
            value={optionalListsID}
          >
            {extraLists.map(
              (
                list: {
                  id: string;
                  name: string;
                  is_system: boolean;
                  quantity: number;
                },
                index: number,
              ) => {
                return (
                  <IonSelectOption key={index} value={list.id}>
                    {list.name.charAt(0).toUpperCase() + list.name.slice(1)}
                  </IonSelectOption>
                );
              },
            )}
          </IonSelect>
        )}

        <IonButton
          expand="block"
          shape="round"
          size="default"
          onClick={() => {
            setIsAddAlertOpen(true);
          }}
          className="ion-margin-top"
          color="primary"
          disabled={requiredListID === ''}
        >
          Add Book To List <IonIcon slot="end" icon={book}></IonIcon>
        </IonButton>
      </>
    );
  }
};

export default AddButtons;
