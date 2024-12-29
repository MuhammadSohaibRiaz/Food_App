import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleOrderNotification = async (orderId, restaurantName, estimatedDeliveryTime) => {
  const trigger = new Date(estimatedDeliveryTime);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Your order from ${restaurantName} is on the way!`,
      body: `Order #${orderId} is estimated to arrive at ${trigger.toLocaleTimeString()}. Tap to track your order.`,
      data: { orderId },
    },
    trigger,
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

