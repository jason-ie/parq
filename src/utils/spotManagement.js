import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Create a new parking spot
 */
export const createSpot = async (spotData, userId) => {
  try {
    const newSpot = {
      ...spotData,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rating: 0,
      reviewCount: 0,
      status: 'active',
    };

    const docRef = await addDoc(collection(db, 'spots'), newSpot);
    return docRef.id;
  } catch (error) {
    console.error('Error creating spot:', error);
    throw error;
  }
};

/**
 * Update an existing parking spot
 */
export const updateSpot = async (spotId, updateData) => {
  try {
    const spotRef = doc(db, 'spots', spotId);
    await updateDoc(spotRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating spot:', error);
    throw error;
  }
};

/**
 * Delete a parking spot
 */
export const deleteSpot = async (spotId) => {
  try {
    await deleteDoc(doc(db, 'spots', spotId));
  } catch (error) {
    console.error('Error deleting spot:', error);
    throw error;
  }
};

/**
 * Get all spots for a specific owner
 */
export const getOwnerSpots = async (userId) => {
  try {
    const q = query(
      collection(db, 'spots'),
      where('ownerId', '==', userId),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching owner spots:', error);
    throw error;
  }
};

/**
 * Get spot details by ID
 */
export const getSpotById = async (spotId) => {
  try {
    const spotDoc = await getDocs(doc(db, 'spots', spotId));
    if (!spotDoc.exists()) {
      throw new Error('Spot not found');
    }
    return {
      id: spotDoc.id,
      ...spotDoc.data(),
    };
  } catch (error) {
    console.error('Error fetching spot:', error);
    throw error;
  }
};

/**
 * Update spot rating
 */
export const updateSpotRating = async (spotId, newRating, reviewCount) => {
  try {
    const spotRef = doc(db, 'spots', spotId);
    await updateDoc(spotRef, {
      rating: newRating,
      reviewCount: reviewCount,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating spot rating:', error);
    throw error;
  }
};

/**
 * Update spot availability
 */
export const updateSpotAvailability = async (spotId, availability) => {
  try {
    const spotRef = doc(db, 'spots', spotId);
    await updateDoc(spotRef, {
      availability,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating spot availability:', error);
    throw error;
  }
};

/**
 * Search spots by location and filters
 */
export const searchSpots = async (searchParams) => {
  try {
    let q = collection(db, 'spots');

    // Add filters based on searchParams
    if (searchParams.city) {
      q = query(q, where('location.city', '==', searchParams.city));
    }

    if (searchParams.type) {
      q = query(q, where('type', '==', searchParams.type));
    }

    // Always filter for active spots
    q = query(q, where('status', '==', 'active'));

    const querySnapshot = await getDocs(q);
    const spots = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply additional filters that can't be done in the query
    return spots.filter((spot) => {
      let matches = true;

      if (searchParams.maxPrice) {
        matches = matches && spot.basePrice <= searchParams.maxPrice;
      }

      // Add more custom filters as needed

      return matches;
    });
  } catch (error) {
    console.error('Error searching spots:', error);
    throw error;
  }
};
