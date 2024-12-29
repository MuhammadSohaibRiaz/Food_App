import * as Facebook from 'expo-facebook';

export async function shareOnFacebook(message, url) {
  try {
    await Facebook.initializeAsync({
      appId: 'YOUR_FACEBOOK_APP_ID',
    });
    const {
      type,
      error,
    } = await Facebook.logInWithReadPermissionsAsync({
      permissions: ['public_profile'],
    });
    if (type === 'success') {
      await Facebook.shareAsync({
        message: message,
        url: url,
      });
    } else {
      // handle errors
    }
  } catch ({ message }) {
    alert(`Facebook Login Error: ${message}`);
  }
}

