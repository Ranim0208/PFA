import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../model/app_notification.dart';
import '../services/api_service.dart';

class NotificationProvider extends ChangeNotifier {
  List<AppNotification> _notifications = [];
  String? _userId;
  final ApiService _apiService = ApiService();

  List<AppNotification> get notifications => _notifications;
  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  String _key() => 'notifications_${_userId ?? 'guest'}';

  // ✅ MÉTHODE CORRIGÉE : Charge les notifications locales ET synchronise avec le serveur
  Future<void> loadNotifications(String userId) async {
    _userId = userId;
    final prefs = await SharedPreferences.getInstance();

    // 1. Charger les notifications locales de l'utilisateur
    final userData = prefs.getStringList(_key()) ?? [];
    final userNotifs = userData
        .map((e) => AppNotification.fromJson(jsonDecode(e)))
        .toList();

    // 2. Fusionner avec les notifications guest (reçues avant le login)
    const guestKey = 'notifications_guest';
    final guestData = prefs.getStringList(guestKey) ?? [];
    if (guestData.isNotEmpty) {
      final guestNotifs = guestData
          .map((e) => AppNotification.fromJson(jsonDecode(e)))
          .toList();
      final existingIds = userNotifs.map((n) => n.id).toSet();
      for (final n in guestNotifs) {
        if (!existingIds.contains(n.id)) {
          userNotifs.add(n);
        }
      }
      await prefs.remove(guestKey);
    }

    // ✅ 3. NOUVEAU : Synchroniser avec le serveur pour récupérer les notifications manquées
    try {
      print('🔄 Synchronisation des notifications avec le serveur...');
      final serverNotifs = await _apiService.getNotificationHistory(userId);

      // Convertir les notifications du serveur au format AppNotification
      final existingIds = userNotifs.map((n) => n.id).toSet();
      for (final serverNotif in serverNotifs) {
        final id = serverNotif['_id'] ?? serverNotif['id'];
        // Ajouter uniquement les nouvelles notifications du serveur
        if (!existingIds.contains(id)) {
          final notif = AppNotification(
            id: id,
            title: serverNotif['title'] ?? '',
            body: serverNotif['body'] ?? '',
            date: DateTime.parse(
              serverNotif['createdAt'] ?? DateTime.now().toIso8601String(),
            ),
            eventId: serverNotif['eventId'],
            eventType: serverNotif['eventType'],
            isRead: serverNotif['isRead'] ?? false,
          );
          userNotifs.add(notif);
          existingIds.add(id);
        }
      }
      print('✅ ${serverNotifs.length} notifications récupérées du serveur');
    } catch (e) {
      print('⚠️ Erreur synchronisation serveur: $e');
      // Continuer même si la synchronisation échoue
    }

    // 4. Trier par date (plus récent en premier)
    _notifications = userNotifs..sort((a, b) => b.date.compareTo(a.date));

    // 5. Sauvegarder la liste fusionnée localement
    await _saveNotifications();
    notifyListeners();
  }

  Future<void> addNotification(AppNotification notification) async {
    _notifications.insert(0, notification);
    await _saveNotifications();
    notifyListeners();
  }

  Future<void> markAsRead(String id) async {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index != -1) {
      _notifications[index].isRead = true;
      await _saveNotifications();

      // ✅ NOUVEAU : Synchroniser avec le serveur
      try {
        await _apiService.markNotificationAsRead(id);
      } catch (e) {
        print('⚠️ Erreur marquage notification serveur: $e');
      }

      notifyListeners();
    }
  }

  Future<void> markAllAsRead() async {
    for (final n in _notifications) {
      n.isRead = true;
    }
    await _saveNotifications();

    // ✅ NOUVEAU : Synchroniser avec le serveur
    if (_userId != null) {
      try {
        await _apiService.markAllNotificationsAsRead(_userId!);
      } catch (e) {
        print('⚠️ Erreur marquage toutes notifications serveur: $e');
      }
    }

    notifyListeners();
  }

  Future<void> deleteNotification(String id) async {
    _notifications.removeWhere((n) => n.id == id);
    await _saveNotifications();
    notifyListeners();
  }

  Future<void> clearAll() async {
    _notifications = [];
    await _saveNotifications();
    notifyListeners();
  }

  void clearOnLogout() {
    _notifications = [];
    _userId = null;
    notifyListeners();
  }

  Future<void> _saveNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    final data = _notifications.map((n) => jsonEncode(n.toJson())).toList();
    await prefs.setStringList(_key(), data);
  }
}
