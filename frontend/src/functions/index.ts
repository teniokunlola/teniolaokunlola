import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../api/firebaseConfig';

export async function uploadToFirebaseStorage(file: File, path: string): Promise<string> {
  const storage = getStorage(app);
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
