import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tacir_app/providers/auth_provider.dart';
import 'package:tacir_app/providers/events_provider.dart';
import '../model/app_notification.dart';
import '../providers/notification_provider.dart';
import 'api_service.dart';

class NotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final ApiService _apiService = ApiService();

  Future<void> initialize(String userId, BuildContext context) async {
    final settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      final token = await _fcm.getToken();
      print('🔥 FCM Token: $token');

      if (token != null && userId.isNotEmpty) {
        await _apiService.saveFcmToken(userId, token);
      }

      // ✅ 1. Notification reçue quand l'app est au PREMIER PLAN
      FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
        print(
          '📬 Notification reçue (app au premier plan): ${message.notification?.title}',
        );

        final notif = AppNotification(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          title: message.notification?.title ?? 'Notification',
          body: message.notification?.body ?? '',
          date: DateTime.now(),
          eventId: message.data['eventId'],
          eventType: message.data['eventType'],
        );

        if (context.mounted) {
          await context.read<NotificationProvider>().addNotification(notif);

          // Rafraîchir le calendrier automatiquement
          final auth = context.read<AuthProvider>();
          await context.read<EventsProvider>().fetchEvents(
            auth.userRole ?? '',
            auth.regionId,
          );
        }
      });

      // ✅ 2. NOUVEAU : Notification cliquée quand l'app était en ARRIÈRE-PLAN ou FERMÉE
      FirebaseMessaging.onMessageOpenedApp.listen((
        RemoteMessage message,
      ) async {
        print(
          '📬 Notification cliquée (app en arrière-plan): ${message.notification?.title}',
        );

        // Créer la notification et l'ajouter à l'historique
        final notif = AppNotification(
          id:
              message.data['notificationId'] ??
              DateTime.now().millisecondsSinceEpoch.toString(),
          title: message.notification?.title ?? 'Notification',
          body: message.notification?.body ?? '',
          date: DateTime.now(),
          eventId: message.data['eventId'],
          eventType: message.data['eventType'],
        );

        if (context.mounted) {
          await context.read<NotificationProvider>().addNotification(notif);

          // Rafraîchir le calendrier
          final auth = context.read<AuthProvider>();
          await context.read<EventsProvider>().fetchEvents(
            auth.userRole ?? '',
            auth.regionId,
          );
        }
      });

      // ✅ 3. NOUVEAU : Vérifier si l'app a été ouverte via une notification
      // Cela gère le cas où l'app était COMPLÈTEMENT FERMÉE
      final initialMessage = await _fcm.getInitialMessage();
      if (initialMessage != null) {
        print(
          '📬 App ouverte via notification: ${initialMessage.notification?.title}',
        );

        final notif = AppNotification(
          id:
              initialMessage.data['notificationId'] ??
              DateTime.now().millisecondsSinceEpoch.toString(),
          title: initialMessage.notification?.title ?? 'Notification',
          body: initialMessage.notification?.body ?? '',
          date: DateTime.now(),
          eventId: initialMessage.data['eventId'],
          eventType: initialMessage.data['eventType'],
        );

        if (context.mounted) {
          await context.read<NotificationProvider>().addNotification(notif);

          // Rafraîchir le calendrier
          final auth = context.read<AuthProvider>();
          await context.read<EventsProvider>().fetchEvents(
            auth.userRole ?? '',
            auth.regionId,
          );
        }
      }

      // Gérer le rafraîchissement du token
      _fcm.onTokenRefresh.listen((newToken) async {
        await _apiService.saveFcmToken(userId, newToken);
      });
    }
  }
}
