import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserAccount } from '../types/user';
import { Activity, Goal } from '../types/tracker';

export interface AuthResult {
  success: boolean;
  user?: UserAccount;
  error?: string;
}

/**
 * Register new user with strict unique username check in Firestore.
 */
export async function registerUserInFirestore(
  userData: Omit<UserAccount, 'id'>
): Promise<AuthResult> {
  try {
    if (!userData || !userData.username) {
      return {
        success: false,
        error: 'نام کاربری وارد نشده یا معتبر نیست.'
      };
    }
    const normalizedUsername = String(userData.username).trim().toLowerCase();

    // ✅ جلوگیری از ثبت‌نام با نام admin اگر قبلاً وجود داره
    if (normalizedUsername === 'admin') {
      const adminCheck = await getDoc(doc(db, 'usernames', 'admin'));
      if (adminCheck.exists()) {
        return {
          success: false,
          error: '❌ کاربر ادمین از قبل وجود دارد. نمی‌توانید با این نام ثبت‌نام کنید.'
        };
      }
    }

    // 1. Check unique username in Firestore 'usernames' collection
    const usernameDocRef = doc(db, 'usernames', normalizedUsername);
    const usernameSnap = await getDoc(usernameDocRef);

    if (usernameSnap.exists()) {
      return {
        success: false,
        error: 'این نام کاربری قبلاً ثبت شده است و متعلق به کاربر دیگری می‌باشد.'
      };
    }

    // Double check users collection query
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('username', '==', normalizedUsername));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return {
        success: false,
        error: 'این نام کاربری قبلاً ثبت شده است.'
      };
    }

    // 2. Create user document ID
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newUser: UserAccount = {
      id: userId,
      username: normalizedUsername,
      displayName: userData.displayName,
      password: userData.password,
      avatarColor: userData.avatarColor || 'teal',
      createdAt: nowIso,
      lastLoginAt: nowIso,
      loginCount: 1,
      role: normalizedUsername === 'admin' ? 'admin' : (userData.role || 'user')
    };

    // 3. Save unique username lock doc
    await setDoc(usernameDocRef, {
      uid: userId,
      username: normalizedUsername,
      createdAt: nowIso
    });

    // 4. Save user profile doc
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, newUser);

    return { success: true, user: newUser };
  } catch (err: unknown) {
    console.error('Registration error in Firestore:', err);
    return {
      success: false,
      error: 'خطا در ثبت‌نام کاربر در دیتابیس ابری. لطفاً مجدداً تلاش نمایید.'
    };
  }
}

/**
 * Authenticate user from Firestore database.
 */
export async function loginUserFromFirestore(
  username: string,
  password: string
): Promise<AuthResult> {
  try {
    if (!username) {
      return {
        success: false,
        error: 'لطفاً نام کاربری را وارد کنید.'
      };
    }
    const normalizedUsername = String(username).trim().toLowerCase();

    // Find username mapping or query user directly
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('username', '==', normalizedUsername));
    const querySnap = await getDocs(q);

    if (querySnap.empty) {
      return {
        success: false,
        error: 'کاربری با این نام کاربری در دیتابیس ثبت نشده است.'
      };
    }

    const userDoc = querySnap.docs[0];
    const user = userDoc.data() as UserAccount;

    if (user.password !== password) {
      return {
        success: false,
        error: 'رمز ورود وارد شده نادرست است.'
      };
    }

    // Update last login timestamp in Firestore
    const nowIso = new Date().toISOString();
    const updatedUser: UserAccount = {
      ...user,
      lastLoginAt: nowIso,
      loginCount: (user.loginCount || 0) + 1
    };

    await updateDoc(doc(db, 'users', user.id), {
      lastLoginAt: nowIso,
      loginCount: updatedUser.loginCount
    });

    return { success: true, user: updatedUser };
  } catch (err: unknown) {
    console.error('Login error in Firestore:', err);
    return {
      success: false,
      error: 'خطا در برقراری ارتباط با دیتابیس. لطفاً اتصال اینترنت خود را بررسی کنید.'
    };
  }
}

/**
 * Get all registered users from Firestore database.
 */
export async function fetchAllUsersFromFirestore(): Promise<UserAccount[]> {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const usersList: UserAccount[] = [];
    snap.forEach(docSnap => {
      usersList.push(docSnap.data() as UserAccount);
    });
    return usersList;
  } catch (err) {
    console.error('Fetch users error:', err);
    return [];
  }
}

/**
 * Sync user's activities & goals with Firestore.
 */
export async function saveUserDataToFirestore(
  userId: string,
  activities: Activity[],
  goals: Goal[],
  categories: string[]
) {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        activitiesData: JSON.stringify(activities),
        goalsData: JSON.stringify(goals),
        categoriesData: JSON.stringify(categories),
        lastSyncedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error saving user data to Firestore:', err);
  }
}

/**
 * Load user's activities & goals from Firestore.
 */
export async function loadUserDataFromFirestore(userId: string) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        activities: data.activitiesData ? JSON.parse(data.activitiesData) : null,
        goals: data.goalsData ? JSON.parse(data.goalsData) : null,
        categories: data.categoriesData ? JSON.parse(data.categoriesData) : null
      };
    }
  } catch (err) {
    console.error('Error loading user data from Firestore:', err);
  }
  return null;
}