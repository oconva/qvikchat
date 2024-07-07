import {
  initializeApp,
  app,
  AppOptions,
  credential as firebaseCredential,
} from "firebase-admin";

/**
 * Method to get the Firebase app instance.
 * @param params App options for initializing the Firebase app.
 * @returns instance of the Firebase app.
 */
export const getFirebaseApp = (params?: AppOptions): app.App =>
  initializeApp(params);

/**
 * Firebase service account credential.
 */
export const credential = {
  ...firebaseCredential,
};
