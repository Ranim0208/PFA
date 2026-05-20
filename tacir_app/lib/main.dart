import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/calendar_screen.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'providers/notification_provider.dart';
import 'widgets/notification_overlay.dart';
import 'providers/events_provider.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'model/app_notification.dart';

// ✅ Handler background amélioré
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('📬 Notification background: ${message.notification?.title}');

  try {
    const storage = FlutterSecureStorage();
    final userId = await storage.read(key: 'user_id');
    final key = 'notifications_${userId ?? 'guest'}';

    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getStringList(key) ?? [];

    // ✅ Utiliser l'ID du serveur si disponible, sinon générer un ID unique
    final notificationId =
        message.data['notificationId'] ??
        message.messageId ??
        DateTime.now().millisecondsSinceEpoch.toString();

    final notif = AppNotification(
      id: notificationId,
      title: message.notification?.title ?? 'Notification',
      body: message.notification?.body ?? '',
      date: DateTime.now(),
      eventId: message.data['eventId'],
      eventType: message.data['eventType'],
    );

    data.insert(0, jsonEncode(notif.toJson()));

    // ✅ Limiter à 200 notifications pour éviter que la liste devienne trop grande
    if (data.length > 200) {
      data.removeRange(200, data.length);
    }

    await prefs.setStringList(key, data);
    debugPrint('✅ Notification sauvegardée en background');
  } catch (e) {
    debugPrint('❌ Erreur sauvegarde notif background: $e');
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('fr', null);
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ChangeNotifierProvider(create: (_) => EventsProvider()),
      ],
      child: MaterialApp(
        title: 'Tacir App',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF7C4DFF)),
          useMaterial3: true,
        ),
        home: const NotificationOverlay(child: AuthWrapper()),
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  void initState() {
    super.initState();
    context.read<AuthProvider>().checkAuth();
    _setupFCM();
  }

  void _setupFCM() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;
    NotificationSettings settings = await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      String? token = await messaging.getToken();
      debugPrint("📲 FCM TOKEN: $token");
    } else {
      debugPrint("⚠️ Notifications non autorisées");
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (!auth.isLoggedIn) return const LoginScreen();

    return const CalendarScreen();
  }
}
