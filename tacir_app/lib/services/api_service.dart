import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl =
      'http://192.168.219.21:5000/api'; // 10.0.2.2 = localhost pour émulateur Android

  final Dio _dio = Dio();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    _dio.options.baseUrl = baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);

    // Intercepteur pour ajouter le token automatiquement
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    return response.data;
  }

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }

  Future<void> saveFcmToken(String userId, String fcmToken) async {
    print('💾 Saving FCM token for user: $userId');
    print('💾 Token: $fcmToken');
    final response = await _dio.post(
      '/notifications/register-token',
      data: {'userId': userId, 'token': fcmToken, 'device': 'mobile'},
    );
    print('💾 Response: ${response.data}');
    print('💾 User ID envoyé: $userId');
  }

  Future<Map<String, dynamic>> getNotificationPreferences(String userId) async {
    final response = await _dio.get('/notifications/preferences/$userId');
    return response.data;
  }

  Future<void> updateNotificationPreferences(
    String userId,
    List<Map<String, dynamic>> reminders,
  ) async {
    await _dio.put(
      '/notifications/preferences/$userId',
      data: {'reminders': reminders, 'enabled': true},
    );
  }

  // ✅ NOUVELLE MÉTHODE : Récupérer l'historique des notifications depuis le serveur
  Future<List<dynamic>> getNotificationHistory(
    String userId, {
    int limit = 100,
  }) async {
    try {
      final response = await _dio.get(
        '/notifications/history/$userId',
        queryParameters: {'limit': limit, 'skip': 0},
      );
      return response.data as List<dynamic>;
    } catch (e) {
      print('❌ Erreur récupération historique notifications: $e');
      return [];
    }
  }

  // ✅ NOUVELLE MÉTHODE : Marquer une notification comme lue sur le serveur
  Future<void> markNotificationAsRead(String notificationId) async {
    try {
      await _dio.patch('/notifications/$notificationId/read');
    } catch (e) {
      print('❌ Erreur marquage notification lue: $e');
    }
  }

  // ✅ NOUVELLE MÉTHODE : Marquer toutes les notifications comme lues sur le serveur
  Future<void> markAllNotificationsAsRead(String userId) async {
    try {
      await _dio.patch('/notifications/history/$userId/read-all');
    } catch (e) {
      print('❌ Erreur marquage toutes notifications lues: $e');
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
    await _storage.delete(key: 'user_id');
  }

  Future<List<dynamic>> getMyCreathons(String role, String? regionId) async {
    try {
      if (role == 'RegionalCoordinator' && regionId != null) {
        final response = await _dio.get('/creathons/region/$regionId');
        // Retourne un seul créathon
        final data = response.data;
        return data != null ? [data] : [];
      } else if (role == 'ComponentCoordinator') {
        final response = await _dio.get('/creathons/component-coordinator');
        return response.data['creathons'] ?? [];
      } else if (role == 'IncubationCoordinator' || role == 'admin') {
        final response = await _dio.get('/creathons');
        return response.data['creathons'] ?? [];
      } else {
        return [];
      }
    } catch (e) {
      print('❌ Erreur créathons: $e');
      return [];
    }
  }

  Future<List<dynamic>> getMyTrainings() async {
    try {
      final response = await _dio.get('/trainings/my-trainings');
      return response.data['data'] ?? [];
    } catch (e) {
      print('❌ Erreur trainings: $e');
      return [];
    }
  }

  Future<List<dynamic>> getIncubationOutputStats() async {
    final response = await _dio.get('/outputs/incubation/stats');
    final data = response.data;
    if (data is List) return data;
    if (data['data'] != null) return data['data'];
    if (data['outputs'] != null) return data['outputs'];
    return [];
  }
}
