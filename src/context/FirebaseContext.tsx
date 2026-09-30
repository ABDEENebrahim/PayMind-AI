import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  FirebaseUser,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { AgentWallet, EscrowContract, MicroPaymentTransaction, UserProfile } from '../types';
import { INITIAL_WALLETS, INITIAL_ESCROWS } from '../data/initialData';

interface FirebaseContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  isFirestoreConnected: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  saveWallet: (wallet: AgentWallet) => Promise<void>;
  updateWallet: (wallet: AgentWallet) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;
  saveEscrow: (escrow: EscrowContract) => Promise<void>;
  updateEscrow: (escrow: EscrowContract) => Promise<void>;
  saveTransaction: (tx: MicroPaymentTransaction) => Promise<void>;
  firestoreWallets: AgentWallet[];
  firestoreEscrows: EscrowContract[];
  firestoreTransactions: MicroPaymentTransaction[];
  hasLoadedInitialData: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);
  
  const [firestoreWallets, setFirestoreWallets] = useState<AgentWallet[]>([]);
  const [firestoreEscrows, setFirestoreEscrows] = useState<EscrowContract[]>([]);
  const [firestoreTransactions, setFirestoreTransactions] = useState<MicroPaymentTransaction[]>([]);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState<boolean>(false);

  // Listen for authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync or initialize user profile in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Agent Operator',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          } else {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setUserProfile(null);
        setFirestoreWallets([]);
        setFirestoreEscrows([]);
        setFirestoreTransactions([]);
        setHasLoadedInitialData(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time collections when user is logged in
  useEffect(() => {
    if (!user) return;

    const walletsRef = collection(db, 'users', user.uid, 'wallets');
    const escrowsRef = collection(db, 'users', user.uid, 'escrows');
    const txRef = collection(db, 'users', user.uid, 'transactions');

    // Subscribe to wallets
    const unsubWallets = onSnapshot(
      walletsRef,
      async (snapshot) => {
        if (snapshot.empty && !hasLoadedInitialData) {
          // First time user login: Seed default agent fleet to user's Firestore
          try {
            for (const defaultWallet of INITIAL_WALLETS) {
              const wDoc = doc(db, 'users', user.uid, 'wallets', defaultWallet.id);
              await setDoc(wDoc, { ...defaultWallet, userId: user.uid });
            }
          } catch (seedErr) {
            handleFirestoreError(seedErr, OperationType.WRITE, `users/${user.uid}/wallets`);
          }
        } else {
          const loaded: AgentWallet[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as AgentWallet);
          });
          setFirestoreWallets(loaded);
          setHasLoadedInitialData(true);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/wallets`);
      }
    );

    // Subscribe to escrows
    const unsubEscrows = onSnapshot(
      escrowsRef,
      async (snapshot) => {
        if (snapshot.empty && !hasLoadedInitialData) {
          // Seed default escrows to user's Firestore
          try {
            for (const defaultEscrow of INITIAL_ESCROWS) {
              const eDoc = doc(db, 'users', user.uid, 'escrows', defaultEscrow.id);
              await setDoc(eDoc, { ...defaultEscrow, userId: user.uid });
            }
          } catch (seedErr) {
            handleFirestoreError(seedErr, OperationType.WRITE, `users/${user.uid}/escrows`);
          }
        } else {
          const loaded: EscrowContract[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as EscrowContract);
          });
          setFirestoreEscrows(loaded);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/escrows`);
      }
    );

    // Subscribe to transactions
    const unsubTxs = onSnapshot(
      txRef,
      (snapshot) => {
        const loaded: MicroPaymentTransaction[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as MicroPaymentTransaction);
        });
        loaded.sort((a, b) => b.timestamp - a.timestamp);
        setFirestoreTransactions(loaded);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/transactions`);
      }
    );

    return () => {
      unsubWallets();
      unsubEscrows();
      unsubTxs();
    };
  }, [user, hasLoadedInitialData]);

  // Google Sign-In with Popup (as required by skill)
  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setAuthError(error?.message || 'Failed to sign in with Google');
    }
  };

  // Sign Out
  const signOutUser = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign Out Error:', error);
      setAuthError(error?.message || 'Failed to sign out');
    }
  };

  // Save / Update Wallet
  const saveWallet = async (wallet: AgentWallet) => {
    if (!user) return;
    const path = `users/${user.uid}/wallets/${wallet.id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'wallets', wallet.id), {
        ...wallet,
        userId: user.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateWallet = async (wallet: AgentWallet) => {
    if (!user) return;
    const path = `users/${user.uid}/wallets/${wallet.id}`;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'wallets', wallet.id), {
        name: wallet.name,
        status: wallet.status,
        balance: wallet.balance,
        spendingLimits: wallet.spendingLimits,
        totalTransactionsCount: wallet.totalTransactionsCount,
        reputationScore: wallet.reputationScore,
        allowedServices: wallet.allowedServices,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteWallet = async (walletId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/wallets/${walletId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'wallets', walletId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Save / Update Escrow
  const saveEscrow = async (escrow: EscrowContract) => {
    if (!user) return;
    const path = `users/${user.uid}/escrows/${escrow.id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'escrows', escrow.id), {
        ...escrow,
        userId: user.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateEscrow = async (escrow: EscrowContract) => {
    if (!user) return;
    const path = `users/${user.uid}/escrows/${escrow.id}`;
    try {
      const payload: any = {
        status: escrow.status,
      };
      if (escrow.settledTxId) payload.settledTxId = escrow.settledTxId;
      if (escrow.submittedProof) payload.submittedProof = escrow.submittedProof;
      if (escrow.expiresAt) payload.expiresAt = escrow.expiresAt;

      await updateDoc(doc(db, 'users', user.uid, 'escrows', escrow.id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  // Save Transaction
  const saveTransaction = async (tx: MicroPaymentTransaction) => {
    if (!user) return;
    const path = `users/${user.uid}/transactions/${tx.id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'transactions', tx.id), {
        ...tx,
        userId: user.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        userProfile,
        loading,
        authError,
        isFirestoreConnected,
        signInWithGoogle,
        signOutUser,
        saveWallet,
        updateWallet,
        deleteWallet,
        saveEscrow,
        updateEscrow,
        saveTransaction,
        firestoreWallets,
        firestoreEscrows,
        firestoreTransactions,
        hasLoadedInitialData,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
