
/**
 * EXAMPLE CLOUD FUNCTION
 * Deploy this to Firebase Functions to enable real-time notifications.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onUnsafeSBOSubmitted = functions.firestore
    .document('sbos/{sboId}')
    .onCreate(async (snap, context) => {
        const sbo = snap.data();
        
        // Only notify for risk-based observations
        if (sbo.type === 'safe') return null;

        const payload = {
            notification: {
                title: `⚠️ New ${sbo.type.toUpperCase()} Observed`,
                body: `Observer ${sbo.observer.name} reported a concern in ${sbo.location} (${sbo.unit}).`,
                icon: 'default',
                clickAction: 'FLUTTER_NOTIFICATION_CLICK'
            },
            data: {
                sboId: context.params.sboId,
                type: sbo.type
            }
        };

        // Logic to notify Area Manager or HSE Team
        // In a real environment, you'd fetch the FCM token of the manager
        // or send an email via SendGrid/Mailgun.
        console.log(`Notification trigger for manager: ${sbo.areaMgr}`);
        
        return admin.firestore().collection('notifications').add({
            recipientId: sbo.areaMgr, // Map to actual user ID
            message: `New unsafe report from ${sbo.observer.name} requires attention.`,
            type: 'alert',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
            sboId: context.params.sboId
        });
    });

exports.onSBOClosed = functions.firestore
    .document('sbos/{sboId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (newData.status === 'closed' && oldData.status !== 'closed') {
            console.log(`SBO ${context.params.sboId} was closed. Notifying HSE and Observer.`);
            
            // Notify observer
            return admin.firestore().collection('notifications').add({
                recipientId: newData.observer.id,
                message: `Your safety report for ${newData.category} has been reviewed and closed. Thank you for your vigilance.`,
                type: 'success',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                read: false,
                sboId: context.params.sboId
            });
        }
        return null;
    });
