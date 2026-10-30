/**
 * EMERGENCY FIX: LocalStorage Migration Script
 * 
 * This script fixes all patient records in localStorage that have null/undefined payment_method values.
 * Run this in your browser console on the admin dashboard page:
 * 
 * 1. Open Chrome DevTools (F12)
 * 2. Go to the Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 5. Refresh the page
 */

console.log('🔧 Starting payment_method migration...');

try {
  // Fix gonstead_patients in localStorage
  const gonsteadPatientsRaw = localStorage.getItem('gonstead_patients');
  if (gonsteadPatientsRaw) {
    const patients = JSON.parse(gonsteadPatientsRaw);
    let fixedCount = 0;
    
    const fixedPatients = patients.map(patient => {
      if (!patient.payment_method || patient.payment_method === '' || patient.payment_method === null) {
        fixedCount++;
        return {
          ...patient,
          payment_method: 'cash' // Default to 'cash'
        };
      }
      return patient;
    });
    
    localStorage.setItem('gonstead_patients', JSON.stringify(fixedPatients));
    console.log(`✅ Fixed ${fixedCount} patients in gonstead_patients`);
  }
  
  // Fix sync_queue in localStorage
  const syncQueueRaw = localStorage.getItem('sync_queue');
  if (syncQueueRaw) {
    const syncQueue = JSON.parse(syncQueueRaw);
    let fixedCount = 0;
    
    const fixedQueue = syncQueue.map(item => {
      if (item.type === 'create_patient' && item.data) {
        if (!item.data.payment_method || item.data.payment_method === '' || item.data.payment_method === null) {
          fixedCount++;
          return {
            ...item,
            data: {
              ...item.data,
              payment_method: 'cash' // Default to 'cash'
            }
          };
        }
      }
      return item;
    });
    
    localStorage.setItem('sync_queue', JSON.stringify(fixedQueue));
    console.log(`✅ Fixed ${fixedCount} items in sync_queue`);
  }
  
  console.log('🎉 Migration completed successfully!');
  console.log('📝 Please refresh the page now.');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  console.error('💡 You may need to clear localStorage manually:');
  console.error('   localStorage.removeItem("gonstead_patients");');
  console.error('   localStorage.removeItem("sync_queue");');
}

