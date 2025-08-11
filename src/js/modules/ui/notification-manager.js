/**
 * XDiagrams Notification Manager Module
 * Maneja las notificaciones del sistema como cache limpiado, etc.
 */

class XDiagramsNotificationManager {
  constructor() {
    this.notifications = new Map();
  }

  showCacheCleared() {
    const notification = document.createElement('div');
    notification.id = 'cache-notification';
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: #000; color: white;
      padding: 12px 20px; border-radius: 6px; font-family: Arial, sans-serif;
      font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0; transform: translateX(100%); transition: all 0.3s ease;
    `;
    notification.textContent = 'Cache limpiado - Recargando datos...';
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.style.cssText += 'opacity: 1; transform: translateX(0);';
    }, 100);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
      notification.style.cssText += 'opacity: 0; transform: translateX(100%);';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);

    this.notifications.set('cache-cleared', notification);
  }

  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    const notificationId = `notification-${Date.now()}`;
    notification.id = notificationId;
    
    const bgColor = this.getBackgroundColor(type);
    const icon = this.getIcon(type);
    
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: white;
      padding: 12px 20px; border-radius: 6px; font-family: Arial, sans-serif;
      font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0; transform: translateX(100%); transition: all 0.3s ease;
      display: flex; align-items: center; gap: 8px;
    `;
    
    notification.innerHTML = `
      <span style="font-size: 16px;">${icon}</span>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.style.cssText += 'opacity: 1; transform: translateX(0);';
    }, 100);

    // Auto-remover
    setTimeout(() => {
      notification.style.cssText += 'opacity: 0; transform: translateX(100%);';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
        this.notifications.delete(notificationId);
      }, 300);
    }, duration);

    this.notifications.set(notificationId, notification);
  }

  getBackgroundColor(type) {
    const colors = {
      'info': '#007bff',
      'success': '#28a745',
      'warning': '#ffc107',
      'error': '#dc3545'
    };
    return colors[type] || colors.info;
  }

  getIcon(type) {
    const icons = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    };
    return icons[type] || icons.info;
  }

  clearAllNotifications() {
    this.notifications.forEach(notification => {
      if (notification.parentNode) {
        notification.remove();
      }
    });
    this.notifications.clear();
  }

  clearNotification(id) {
    const notification = this.notifications.get(id);
    if (notification && notification.parentNode) {
      notification.remove();
      this.notifications.delete(id);
    }
  }
}

export { XDiagramsNotificationManager }; 