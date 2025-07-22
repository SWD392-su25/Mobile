// In utils/file.js or wherever you have this file
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../config/firebase"; // Make sure this path is correct

/**
 * Uploads a file from a local React Native asset to a specified folder in Firebase Storage.
 *
 * @param {object} asset - The asset object from Expo Image Picker (e.g., result.assets[0]).
 * @param {string} folderName - The destination folder in Firebase Storage (e.g., 'event-proofs').
 * @returns {Promise<string>} The public download URL of the uploaded file.
 */
const uploadFile = async (asset, folderName) => {
  if (!asset?.uri) {
    throw new Error("Invalid file asset provided. No URI found.");
  }

  // 1. Convert the local file URI to a Blob. This is essential for React Native.
  const response = await fetch(asset.uri);
  const blob = await response.blob();

  // 2. Create a unique filename to prevent overwriting files.
  // We combine a timestamp and the original filename (if available) or a random string.
  const uriParts = asset.uri.split('/');
  const originalFileName = uriParts[uriParts.length - 1];
  const uniqueFileName = `${new Date().getTime()}_${originalFileName}`;

  // 3. Create a valid, non-root Firebase Storage reference.
  const storageRef = ref(storage, `${folderName}/${uniqueFileName}`);

  // 4. Upload the Blob to Firebase Storage
  const snapshot = await uploadBytes(storageRef, blob);

  // 5. Get the public download URL for the uploaded file
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
};

export default uploadFile;