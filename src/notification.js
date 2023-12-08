// notification.js

// Function to check if browser supports notifications
function isNotificationSupported() {
    console.log("Checking if notifications are supported");
    return "Notification" in window;
  }
  function isServiceWorkerSupported() {
    return "serviceWorker" in navigator;
  }
  
  function isPushNotificationSupported() {
    return "PushManager" in window;
  }
  // Function to subscribe to push notifications
async function subscribeToPushNotifications() {
  console.log("Subscribing to push notifications");
  if (isServiceWorkerSupported() && isPushNotificationSupported()) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // key should not be public, stored later in env. file i promise 
        applicationServerKey: "BLeDgTFEhRJ158HMxxHP6CnbQI37J_5fmsurt9AXoirOFD0h3jEcqH_TgUtS4qK9vPyMfA3B5oo9ahb5nQeSsTc", // Replace with your VAPID public key
      });
      console.log("Push notification subscription:", subscription);
      return subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
    }
  }
}


  // Function to request permission for notifications
  async function requestNotificationPermission() {
    console.log("Requesting notification permission");
    if (isNotificationSupported()) {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
      return permission;
    }
  }
  
  // Function to create and display a notification
  function createNotification(title, options) {
    console.log("Creating notification:", title, options);
    if (isNotificationSupported() && Notification.permission === "granted") {
      // Use the showNotification() method of ServiceWorkerRegistration
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
      });
    }
  }
  
  
  // Function to schedule a daily notification at a specific time
  function scheduleDailyNotification(hour, minute, title, options) {
    console.log("Scheduling daily notification at", hour + ":" + minute);
    const now = new Date();
    const notificationTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute
    );
  
    if (notificationTime < now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }
  
    const timeUntilNotification = notificationTime - now;
    setTimeout(() => {
      createNotification(title, options);
      scheduleDailyNotification(hour, minute, title, options);
    }, timeUntilNotification);
  }
  
  export { isNotificationSupported, requestNotificationPermission, createNotification, scheduleDailyNotification, subscribeToPushNotifications };
