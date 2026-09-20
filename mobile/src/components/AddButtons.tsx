import {
  IonIcon,
  IonAlert,
  IonButton,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';

import { book } from 'ionicons/icons';

import styles from './AddButtons.module.css';

import { useState } from 'react';

import { useUserLists } from '../queryOptions/useUserLists';

const AddButtons: React.FC<{
  onAddBook: (
    requiredList: string,
    formattedListNames: Array<string>,
    optionalLists?: Array<string>,
  ) => void;
}> = ({ onAddBook }) => {
  const [isAddAlertOpen, setIsAddAlertOpen] = useState<boolean>(false);

  const listsNamesQuery = useUserLists();

  const [requiredListID, setRequiredListID] = useState<string>('');
  const [requiredListName, setRequiredListName] = useState<string>('');

  const [optionalListsID, setOptionalListsID] = useState<string[]>([]);

  if (listsNamesQuery.isSuccess) {
    const lists: Array<{
      id: string;
      name: string;
      is_system: boolean;
      quantity: number;
    }> = listsNamesQuery.data.lists;

    const systemLists = lists.filter((list) => list.is_system === true);
    const extraLists = lists.filter((list) => list.is_system === false);

    const extraListsNames = extraLists
      .filter((item) => optionalListsID.includes(item.id))
      .map((item) => item.name);

    const listsNamesArray = [requiredListName, ...extraListsNames];

    return (
      <>
        <IonAlert
          isOpen={isAddAlertOpen}
          header={'Confirm Action'}
          message={`Are you sure you want to add this book to the following lists?\n\n
            ${listsNamesArray.map((item) => '• ' + item).join('\n')}`}
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
                onAddBook(requiredListID, listsNamesArray, optionalListsID);
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
            const listName = systemLists.find(
              (list) => list.id === e.detail.value,
            )!.name;

            const formattedName =
              listName.charAt(0).toUpperCase() + listName.slice(1);
            setRequiredListID(e.detail.value);
            setRequiredListName(formattedName);
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
